<?php

namespace App\Services;

use App\Models\AuditLog;
use App\Models\ExamSession;
use App\Models\User;
use Illuminate\Http\Request;

/**
 * Central audit trail writer (spec 17). Every important lifecycle and security
 * event goes through here so the level mapping stays consistent.
 */
class ExamAuditLogger
{
    /**
     * Security events that the student client may report, with their levels (spec 5.4).
     */
    public const SECURITY_EVENT_LEVELS = [
        'WINDOW_BLUR' => 'warning',
        'WINDOW_FOCUS' => 'info',
        'FULLSCREEN_EXIT' => 'violation',
        'FULLSCREEN_ENTER' => 'info',
    ];

    public function log(?User $user, ?int $examId, ?int $sessionId, string $eventType, string $level = 'info', array $metadata = [], ?Request $request = null): AuditLog
    {
        $request ??= request();

        return AuditLog::query()->create([
            'user_id' => $user?->id,
            'exam_id' => $examId,
            'exam_session_id' => $sessionId,
            'event_type' => $eventType,
            'level' => in_array($level, AuditLog::LEVELS, true) ? $level : 'info',
            'metadata' => $metadata,
            'ip_address' => $request?->ip(),
            'user_agent' => $request !== null ? substr((string) $request->userAgent(), 0, 500) : null,
        ]);
    }

    public function forSession(ExamSession $session, string $eventType, string $level = 'info', array $metadata = []): AuditLog
    {
        return $this->log($session->student->user, $session->exam_id, $session->id, $eventType, $level, $metadata);
    }

    public function securityEvent(ExamSession $session, string $type, array $metadata = []): ?AuditLog
    {
        $level = self::SECURITY_EVENT_LEVELS[$type] ?? null;
        if ($level === null) {
            return null;
        }

        return $this->forSession($session, $type, $level, $metadata);
    }

    public function authEvent(?User $user, string $eventType): void
    {
        $this->log($user, null, null, $eventType, 'info');
    }
}
