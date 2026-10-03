<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['question_id', 'left_text', 'right_text', 'sort_order'])]
class QuestionPair extends Model
{
    public function question(): BelongsTo
    {
        return $this->belongsTo(Question::class);
    }
}
