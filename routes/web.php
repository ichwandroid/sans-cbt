<?php

use App\Http\Controllers\Admin\DashboardController as AdminDashboardController;
use App\Http\Controllers\Admin\SchoolClassController as AdminSchoolClassController;
use App\Http\Controllers\Admin\SubjectController as AdminSubjectController;
use App\Http\Controllers\Admin\UserController as AdminUserController;
use App\Http\Controllers\DashboardController;
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

        Route::inertia('people', 'admin/people/index')->name('people.index');
        Route::inertia('exam-monitoring', 'admin/exam-monitoring/index')->name('exam-monitoring.index');
        Route::inertia('audit-logs', 'admin/audit-logs/index')->name('audit-logs.index');
        Route::inertia('reports', 'admin/reports/index')->name('reports.index');
    });

require __DIR__.'/settings.php';
