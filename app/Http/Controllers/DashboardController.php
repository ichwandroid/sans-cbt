<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Role;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    /**
     * Show the dashboard for the authenticated user.
     */
    public function __invoke(Request $request): Response|RedirectResponse
    {
        $user = $request->user();

        if ($user instanceof User && $user->hasRole(Role::Admin)) {
            return to_route('admin.dashboard');
        }

        return Inertia::render('dashboard');
    }
}
