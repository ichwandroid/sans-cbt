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
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class QuestionController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(): Response
    {
        return Inertia::render('admin/questions/index', ['banks' => QuestionBank::query()->with(['subject:id,name', 'questions:id,question_bank_id,content'])->withCount('questions')->latest()->get()->map(fn (QuestionBank $bank): array => ['id' => $bank->id, 'name' => $bank->name, 'subject' => $bank->subject->name, 'material' => $bank->material, 'questions_count' => $bank->questions_count, 'questions' => $bank->questions->map(fn (Question $question): array => ['id' => $question->id, 'content' => $question->content])->all()])->all(), 'subjects' => Subject::query()->where('is_active', true)->orderBy('name')->get(['id', 'name'])->map(fn (Subject $subject): array => ['value' => $subject->id, 'label' => $subject->name])->all(), 'classes' => SchoolClass::query()->orderBy('name')->get(['id', 'name'])->map(fn (SchoolClass $class): array => ['value' => $class->id, 'label' => $class->name])->all(), 'teachers' => Teacher::query()->orderBy('full_name')->get(['id', 'full_name'])->map(fn (Teacher $teacher): array => ['value' => $teacher->id, 'label' => $teacher->full_name])->all()]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(QuestionRequest $request): RedirectResponse
    {
        DB::transaction(function () use ($request): void {
            $question = Question::query()->create($request->safe()->only(['question_bank_id', 'content', 'difficulty', 'weight']));
            $question->options()->createMany(collect($request->input('options'))->map(fn (array $option, int $index): array => ['label' => chr(65 + $index), 'content' => $option['content'], 'is_correct' => $index === $request->integer('correct_option')])->all());
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

    /**
     * Display the specified resource.
     */
    public function show(Question $question): Response
    {
        return Inertia::render('admin/questions/show', ['question' => $question->load('options')]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(QuestionRequest $request, Question $question): RedirectResponse
    {
        DB::transaction(function () use ($request, $question): void {
            $question->update($request->safe()->only(['content', 'difficulty', 'weight']));
            $question->options()->delete();
            $question->options()->createMany(collect($request->input('options'))->map(fn (array $option, int $index): array => ['label' => chr(65 + $index), 'content' => $option['content'], 'is_correct' => $index === $request->integer('correct_option')])->all());
        });
        Inertia::flash('toast', ['type' => 'success', 'message' => 'Soal berhasil diperbarui.']);
        return back();
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Question $question): RedirectResponse
    {
        $question->delete();
        Inertia::flash('toast', ['type' => 'success', 'message' => 'Soal berhasil dihapus.']);
        return back();
    }
}
