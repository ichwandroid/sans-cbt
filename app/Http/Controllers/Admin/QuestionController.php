<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\QuestionBankRequest;
use App\Http\Requests\Admin\QuestionRequest;
use App\Models\Question;
use App\Models\QuestionBank;
use App\Models\SchoolClass;
use App\Models\Subject;
use App\Models\Teacher;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class QuestionController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(): Response
    {
        return Inertia::render('admin/questions/index', [
            'banks' => QuestionBank::query()
                ->with(['subject:id,name', 'schoolClass:id,name', 'teacher:id,full_name', 'questions:id,question_bank_id,content,type,difficulty,weight'])
                ->withCount('questions')
                ->latest()
                ->get()
                ->map(fn (QuestionBank $bank): array => [
                    'id' => $bank->id,
                    'name' => $bank->name,
                    'subject' => $bank->subject->name,
                    'subject_id' => $bank->subject_id,
                    'school_class_id' => $bank->school_class_id,
                    'teacher_id' => $bank->teacher_id,
                    'class' => $bank->schoolClass?->name,
                    'teacher' => $bank->teacher?->full_name,
                    'material' => $bank->material,
                    'questions_count' => $bank->questions_count,
                    'questions' => $bank->questions->map(fn (Question $question): array => [
                        'id' => $question->id,
                        'content' => $question->content,
                        'type' => $question->type,
                        'difficulty' => $question->difficulty,
                        'weight' => $question->weight,
                    ])->all(),
                ])
                ->all(),
            'subjects' => Subject::query()->where('is_active', true)->orderBy('name')->get(['id', 'name'])->map(fn (Subject $subject): array => ['value' => $subject->id, 'label' => $subject->name])->all(),
            'classes' => SchoolClass::query()->orderBy('name')->get(['id', 'name'])->map(fn (SchoolClass $class): array => ['value' => $class->id, 'label' => $class->name])->all(),
            'teachers' => Teacher::query()->orderBy('full_name')->get(['id', 'full_name'])->map(fn (Teacher $teacher): array => ['value' => $teacher->id, 'label' => $teacher->full_name])->all(),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(QuestionRequest $request): RedirectResponse
    {
        [$imagePath] = $this->resolveImagePath($request);

        DB::transaction(function () use ($request, $imagePath): void {
            $question = Question::query()->create([...$request->safe()->only(['question_bank_id', 'content', 'type', 'difficulty', 'weight']), 'image_path' => $imagePath]);

            $question->options()->createMany($this->optionRows($request));
        });

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Soal berhasil ditambahkan.']);

        return back();
    }

    public function storeBank(QuestionBankRequest $request): RedirectResponse
    {
        QuestionBank::query()->create($request->validated());
        Inertia::flash('toast', ['type' => 'success', 'message' => 'Bank soal berhasil ditambahkan.']);

        return back();
    }

    public function updateBank(QuestionBankRequest $request, QuestionBank $questionBank): RedirectResponse
    {
        $questionBank->update($request->validated());
        Inertia::flash('toast', ['type' => 'success', 'message' => 'Bank soal berhasil diperbarui.']);
        return back();
    }

    public function destroyBank(QuestionBank $questionBank): RedirectResponse
    {
        $questionBank->delete();
        Inertia::flash('toast', ['type' => 'success', 'message' => 'Bank soal berhasil dihapus.']);
        return back();
    }

    /**
     * Display the specified resource.
     */
    public function show(Question $question): Response
    {
        return Inertia::render('admin/questions/show', [
            'question' => $question->load(['options', 'questionBank:id,name']),
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(QuestionRequest $request, Question $question): RedirectResponse
    {
        $stalePaths = [];

        DB::transaction(function () use ($request, $question, &$stalePaths): void {
            [$imagePath, $stale] = $this->resolveImagePath($request, $question->image_path);
            if ($stale !== null) {
                $stalePaths[] = $stale;
            }

            $oldOptionImages = $question->options()->pluck('image_path')->filter()->all();
            $rows = $this->optionRows($request, $stalePaths);

            $question->update([...$request->safe()->only(['content', 'type', 'difficulty', 'weight']), 'image_path' => $imagePath]);
            $question->options()->delete();
            $question->options()->createMany($rows);

            $kept = collect($rows)->pluck('image_path')->filter()->all();
            foreach ($oldOptionImages as $oldImage) {
                if (! in_array($oldImage, $kept)) {
                    $stalePaths[] = $oldImage;
                }
            }
        });

        collect($stalePaths)->unique()->each(fn (string $path) => Storage::disk('local')->delete($path));

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Soal berhasil diperbarui.']);
        return back();
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Question $question): RedirectResponse
    {
        $imagePaths = $question->options()->pluck('image_path')
            ->push($question->image_path)
            ->filter()
            ->unique()
            ->all();

        $question->delete();

        foreach ($imagePaths as $path) {
            Storage::disk('local')->delete($path);
        }

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Soal berhasil dihapus.']);

        return redirect()->route('admin.questions.index');
    }

    /**
     * Compute the final question image path, replacing or dropping the stored file as requested.
     *
     * @return array{0: ?string, 1: ?string} [newPath, stalePath]
     */
    private function resolveImagePath(QuestionRequest $request, ?string $current = null): array
    {
        if ($file = $request->file('image')) {
            return [$this->storeImage($file), $current];
        }

        if ($request->boolean('remove_image')) {
            return [null, $current];
        }

        return [$current, null];
    }

    private function storeImage(UploadedFile $file): string
    {
        return $file->store('question-media', 'local');
    }

    /**
     * Build the option rows for the request, uploading/removing images along the way
     * and collecting replaced files that should be deleted after the DB write succeeds.
     *
     * @return list<array{label: string, content: string, is_correct: bool, image_path: ?string}>
     */
    private function optionRows(QuestionRequest $request, array &$stalePaths = []): array
    {
        return collect($request->input('options', []))
            ->values()
            ->map(function (array $option, int $index) use ($request, &$stalePaths): array {
                $path = isset($option['image_path']) ? (string) $option['image_path'] : null;

                if ($file = $request->file("options.$index.image")) {
                    if ($path !== null) {
                        $stalePaths[] = $path;
                    }
                    $path = $this->storeImage($file);
                } elseif (! empty($option['remove_image'])) {
                    if ($path !== null) {
                        $stalePaths[] = $path;
                    }
                    $path = null;
                }

                return [
                    'label' => chr(65 + $index),
                    'content' => (string) $option['content'],
                    'is_correct' => $index === (int) $request->integer('correct_option'),
                    'image_path' => $path,
                ];
            })
            ->all();
    }
}
