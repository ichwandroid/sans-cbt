<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\ParentProfileRequest;
use App\Models\ParentProfile;
use App\Models\Student;
use App\Models\User;
use App\Role;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class ParentProfileController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): Response
    {
        $search = $request->string('search')->trim()->value();
        $parents = ParentProfile::query()->with('students:id,full_name')
            ->when($search !== '', fn (Builder $query) => $query->where('full_name', 'like', "%{$search}%")->orWhere('phone', 'like', "%{$search}%"))
            ->orderBy('full_name')->paginate(10)->withQueryString()
            ->through(fn (ParentProfile $parent): array => ['id' => $parent->id, 'user_id' => $parent->user_id, 'full_name' => $parent->full_name, 'phone' => $parent->phone, 'occupation' => $parent->occupation, 'students' => $parent->students->map(fn (Student $student): array => ['id' => $student->id, 'relation' => $student->pivot->relation])->all(), 'student_names' => $parent->students->pluck('full_name')->all()]);

        return Inertia::render('admin/parents/index', ['parents' => $parents, 'filters' => ['search' => $search], ...$this->formOptions()]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(): Response
    {
        return Inertia::render('admin/parents/create', $this->formOptions());
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(ParentProfileRequest $request): RedirectResponse
    {
        DB::transaction(function () use ($request): void {
            $parent = ParentProfile::query()->create($this->payload($request));
            $parent->students()->sync($this->studentRelations($request));
        });
        Inertia::flash('toast', ['type' => 'success', 'message' => 'Data orang tua berhasil ditambahkan.']);

        return to_route('admin.parents.index');
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(ParentProfile $parent): Response
    {
        return Inertia::render('admin/parents/edit', [...$this->formOptions(), 'parent' => ['id' => $parent->id, ...$this->payload($parent), 'students' => $parent->students()->get(['students.id'])->map(fn (Student $student): array => ['id' => $student->id, 'relation' => $student->pivot->relation])->all()]]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(ParentProfileRequest $request, ParentProfile $parent): RedirectResponse
    {
        DB::transaction(function () use ($request, $parent): void {
            $parent->update($this->payload($request));
            $parent->students()->sync($this->studentRelations($request));
        });
        Inertia::flash('toast', ['type' => 'success', 'message' => 'Data orang tua berhasil diperbarui.']);

        return to_route('admin.parents.index');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(ParentProfile $parent): RedirectResponse
    {
        $parent->delete();
        Inertia::flash('toast', ['type' => 'success', 'message' => 'Data orang tua berhasil dihapus.']);

        return to_route('admin.parents.index');
    }

    /** @return array{students: array<int, array{value: int, label: string}>, users: array<int, array{value: int, label: string}>} */
    private function formOptions(): array
    {
        return ['students' => Student::query()->orderBy('full_name')->get(['id', 'full_name', 'nis'])->map(fn (Student $student): array => ['value' => $student->id, 'label' => "{$student->full_name} — {$student->nis}"])->all(), 'users' => User::query()->where('role', Role::OrangTua)->orderBy('name')->get(['id', 'name', 'email'])->map(fn (User $user): array => ['value' => $user->id, 'label' => "{$user->name} — {$user->email}"])->all()];
    }

    /** @return array<string, mixed> */
    private function payload(ParentProfileRequest|ParentProfile $source): array
    {
        return ['user_id' => $source->user_id ?: null, 'full_name' => $source->full_name, 'phone' => $source->phone ?: null, 'occupation' => $source->occupation ?: null];
    }

    /** @return array<int, array{relation: string|null}> */
    private function studentRelations(ParentProfileRequest $request): array
    {
        return collect($request->input('students', []))->mapWithKeys(fn (array $student): array => [(int) $student['id'] => ['relation' => $student['relation'] ?: null]])->all();
    }
}
