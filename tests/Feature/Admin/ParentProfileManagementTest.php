<?php

use App\Models\ParentProfile;
use App\Models\Student;
use App\Models\User;

test('admin can create a parent linked to students', function () {
    $admin = User::factory()->admin()->create();
    $student = Student::factory()->create();

    $this->actingAs($admin)->post(route('admin.parents.store'), [
        'full_name' => 'Bapak Rahman',
        'phone' => '081234567890',
        'students' => [['id' => $student->id, 'relation' => 'Ayah']],
    ])->assertRedirect(route('admin.parents.index'));

    $parent = ParentProfile::query()->where('full_name', 'Bapak Rahman')->firstOrFail();
    $this->assertDatabaseHas('parent_student', ['parent_id' => $parent->id, 'student_id' => $student->id, 'relation' => 'Ayah']);
});

test('parent creation rejects an account without the parent role', function () {
    $admin = User::factory()->admin()->create();
    $studentUser = User::factory()->siswa()->create();

    $this->actingAs($admin)->from(route('admin.parents.create'))->post(route('admin.parents.store'), [
        'full_name' => 'Ibu Sari',
        'user_id' => $studentUser->id,
    ])->assertRedirect(route('admin.parents.create'))->assertSessionHasErrors('user_id');
});
