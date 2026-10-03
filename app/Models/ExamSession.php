<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $exam_id
 * @property int $student_id
 * @property Carbon $started_at
 * @property Carbon|null $submitted_at
 * @property string $status
 * @property int $random_seed
 * @property list<int> $question_order
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read Exam $exam
 * @property-read Student $student
 */
#[Fillable(['exam_id', 'student_id', 'started_at', 'submitted_at', 'status', 'random_seed', 'question_order'])]
class ExamSession extends Model
{
    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'started_at' => 'datetime',
            'submitted_at' => 'datetime',
            'random_seed' => 'integer',
            'question_order' => 'array',
        ];
    }

    public function exam(): BelongsTo
    {
        return $this->belongsTo(Exam::class);
    }

    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
    }

    /**
     * @return HasMany<Answer, $this>
     */
    public function answers(): HasMany
    {
        return $this->hasMany(Answer::class);
    }

    /**
     * @return HasOne<Result, $this>
     */
    public function result(): HasOne
    {
        return $this->hasOne(Result::class);
    }

    /**
     * Audit trail entries tied to this attempt (lifecycle + security events).
     *
     * @return HasMany<AuditLog, $this>
     */
    public function auditLogs(): HasMany
    {
        return $this->hasMany(AuditLog::class);
    }

    /**
     * Server-side deadline for this attempt: start time plus exam duration.
     */
    public function deadline(): Carbon
    {
        return \Illuminate\Support\Carbon::instance($this->started_at)->addMinutes($this->exam->duration_minutes);
    }

    public function isExpired(): bool
    {
        return now()->gt($this->deadline());
    }
}
