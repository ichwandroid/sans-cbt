<?php

use App\Http\Controllers\Admin\DashboardController as AdminDashboardController;
use App\Http\Controllers\Admin\AuditLogController as AdminAuditLogController;
use App\Http\Controllers\Admin\ExamMonitorController as AdminExamMonitorController;
use App\Http\Controllers\Admin\ParentProfileController as AdminParentProfileController;
use App\Http\Controllers\Admin\QuestionController as AdminQuestionController;
use App\Http\Controllers\Admin\QuestionMediaController as AdminQuestionMediaController;
use App\Http\Controllers\Admin\SchoolClassController as AdminSchoolClassController;
use App\Http\Controllers\Admin\StudentController as AdminStudentController;
use App\Http\Controllers\Admin\SubjectController as AdminSubjectController;
use App\Http\Controllers\Admin\TeacherController as AdminTeacherController;
use App\Http\Controllers\Admin\UserController as AdminUserController;
use App\Http\Controllers\Teacher\DashboardController as TeacherDashboardController;
use App\Http\Controllers\Teacher\ExamController as TeacherExamController;
use App\Http\Controllers\Teacher\QuestionController as TeacherQuestionController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\Student\ExamController as StudentExamController;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', DashboardController::class)->name('dashboard');
});

Route::middleware(['auth', 'verified', 'role:admin'])
    ->prefix('admin')
    ->name('admin.')
    ->group(function () {
        Route::get('/', AdminDashboardController::class)->name('dashboard');

        Route::get('users', [AdminUserController::class, 'index'])->name('users.index');
        Route::post('users', [AdminUserController::class, 'store'])->name('users.store');
        Route::patch('users/{user}', [AdminUserController::class, 'update'])->name('users.update');
        Route::delete('users/{user}', [AdminUserController::class, 'destroy'])->name('users.destroy');

        Route::get('subjects', [AdminSubjectController::class, 'index'])->name('subjects.index');
        Route::get('subjects/create', [AdminSubjectController::class, 'create'])->name('subjects.create');
        Route::post('subjects', [AdminSubjectController::class, 'store'])->name('subjects.store');
        Route::get('subjects/{subject}/edit', [AdminSubjectController::class, 'edit'])->name('subjects.edit');
        Route::patch('subjects/{subject}', [AdminSubjectController::class, 'update'])->name('subjects.update');
        Route::delete('subjects/{subject}', [AdminSubjectController::class, 'destroy'])->name('subjects.destroy');

        Route::get('classes', [AdminSchoolClassController::class, 'index'])->name('classes.index');
        Route::get('classes/create', [AdminSchoolClassController::class, 'create'])->name('classes.create');
        Route::post('classes', [AdminSchoolClassController::class, 'store'])->name('classes.store');
        Route::get('classes/{class}/edit', [AdminSchoolClassController::class, 'edit'])->name('classes.edit');
        Route::patch('classes/{class}', [AdminSchoolClassController::class, 'update'])->name('classes.update');
        Route::delete('classes/{class}', [AdminSchoolClassController::class, 'destroy'])->name('classes.destroy');

        Route::resource('students', AdminStudentController::class)->except('show');
        Route::resource('teachers', AdminTeacherController::class)->except('show');
        Route::resource('parents', AdminParentProfileController::class)->except('show')->parameters(['parents' => 'parent']);
        Route::resource('questions', AdminQuestionController::class)->except(['create', 'edit']);
        Route::post('question-banks', [AdminQuestionController::class, 'storeBank'])->name('question-banks.store');
        Route::put('question-banks/{questionBank}', [AdminQuestionController::class, 'updateBank'])->name('question-banks.update');
        Route::delete('question-banks/{questionBank}', [AdminQuestionController::class, 'destroyBank'])->name('question-banks.destroy');

        Route::inertia('people', 'admin/people/index')->name('people.index');
        Route::get('exam-monitoring', AdminExamMonitorController::class)->name('exam-monitoring.index');
        Route::get('audit-logs', [AdminAuditLogController::class, 'index'])->name('audit-logs.index');
        Route::inertia('reports', 'admin/reports/index')->name('reports.index');
    });

// Question media is shared by the admin and teacher areas; files live on the private disk.
Route::middleware(['auth', 'verified', 'role:admin,guru'])
    ->prefix('admin')
    ->name('admin.')
    ->group(function () {
        Route::get('question-media/{path}', AdminQuestionMediaController::class)
            ->where('path', '[A-Za-z0-9._-]+')
            ->name('question-media.show');
    });

Route::middleware(['auth', 'verified', 'role:guru'])
    ->prefix('teacher')
    ->name('teacher.')
    ->group(function () {
        Route::get('/', TeacherDashboardController::class)->name('dashboard');

        Route::get('questions', [TeacherQuestionController::class, 'index'])->name('questions.index');
        Route::post('questions', [TeacherQuestionController::class, 'store'])->name('questions.store');
        Route::get('questions/{question}', [TeacherQuestionController::class, 'show'])->name('questions.show');
        Route::put('questions/{question}', [TeacherQuestionController::class, 'update'])->name('questions.update');
        Route::delete('questions/{question}', [TeacherQuestionController::class, 'destroy'])->name('questions.destroy');
        Route::post('question-banks', [TeacherQuestionController::class, 'storeBank'])->name('question-banks.store');
        Route::put('question-banks/{questionBank}', [TeacherQuestionController::class, 'updateBank'])->name('question-banks.update');
        Route::delete('question-banks/{questionBank}', [TeacherQuestionController::class, 'destroyBank'])->name('question-banks.destroy');

        Route::get('exams', [TeacherExamController::class, 'index'])->name('exams.index');
        Route::get('exams/create', [TeacherExamController::class, 'create'])->name('exams.create');
        Route::post('exams', [TeacherExamController::class, 'store'])->name('exams.store');
        Route::get('exams/{exam}/edit', [TeacherExamController::class, 'edit'])->name('exams.edit');
        Route::get('exams/{exam}/grading', [TeacherExamController::class, 'grading'])->name('exams.grading');
        Route::post('exams/{exam}/sessions/{session}/grade', [TeacherExamController::class, 'grade'])->name('exams.grade');
        Route::get('exams/{exam}/monitor', [TeacherExamController::class, 'monitor'])->name('exams.monitor');
        Route::put('exams/{exam}', [TeacherExamController::class, 'update'])->name('exams.update');
        Route::get('exams/{exam}', [TeacherExamController::class, 'show'])->name('exams.show');
        Route::delete('exams/{exam}', [TeacherExamController::class, 'destroy'])->name('exams.destroy');
        Route::patch('exams/{exam}/publish', [TeacherExamController::class, 'publish'])->name('exams.publish');
        Route::patch('exams/{exam}/unpublish', [TeacherExamController::class, 'unpublish'])->name('exams.unpublish');
    });

Route::middleware(['auth', 'verified', 'role:siswa'])
    ->prefix('student')
    ->name('student.')
    ->group(function () {
        Route::get('exams', [StudentExamController::class, 'index'])->name('exams.index');
        Route::post('exams/{exam}/start', [StudentExamController::class, 'start'])->name('exams.start');
        Route::get('results', [StudentExamController::class, 'history'])->name('results.index');
        Route::get('sessions/{session}/work', [StudentExamController::class, 'work'])->name('exams.work');
        Route::get('sessions/{session}/result', [StudentExamController::class, 'result'])->name('exams.result');
        Route::post('sessions/{session}/submit', [StudentExamController::class, 'submit'])->name('exams.submit');
        Route::post('sessions/{session}/answers', [StudentExamController::class, 'saveAnswer'])->name('exams.answer');
        Route::post('sessions/{session}/security-events', [StudentExamController::class, 'securityEvent'])->name('exams.security');
    });

require __DIR__.'/settings.php';
