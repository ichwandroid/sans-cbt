<?php

use App\Http\Controllers\Admin\DashboardController as AdminDashboardController;
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

        Route::inertia('classes', 'admin/classes/index')->name('classes.index');
        Route::inertia('subjects', 'admin/subjects/index')->name('subjects.index');
        Route::inertia('people', 'admin/people/index')->name('people.index');
        Route::inertia('exam-monitoring', 'admin/exam-monitoring/index')->name('exam-monitoring.index');
        Route::inertia('audit-logs', 'admin/audit-logs/index')->name('audit-logs.index');
        Route::inertia('reports', 'admin/reports/index')->name('reports.index');
    });

require __DIR__.'/settings.php';
