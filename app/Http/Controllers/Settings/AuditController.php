<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use OwenIt\Auditing\Models\Audit;

class AuditController extends Controller
{
    /**
     * Display the user's audit logs.
     */
    public function index(Request $request): Response
    {
        $audits = Audit::with(['user', 'auditable'])
            ->when($request->user_id, function ($query, $userId) {
                return $query->where('user_id', $userId);
            })
            ->when($request->event, function ($query, $event) {
                return $query->where('event', $event);
            })
            ->when($request->auditable_type, function ($query, $type) {
                return $query->where('auditable_type', $type);
            })
            ->latest()
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('settings/audit', [
            'audits' => $audits,
            'filters' => $request->only(['user_id', 'event', 'auditable_type']),
        ]);
    }

    /**
     * Display a specific audit log entry.
     */
    public function show(Audit $audit): Response
    {
        $audit->load(['user', 'auditable']);

        return Inertia::render('settings/audit-detail', [
            'audit' => $audit,
        ]);
    }
}