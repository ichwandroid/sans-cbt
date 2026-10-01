<?php

namespace App\Http\Requests\Admin;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class QuestionRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'question_bank_id' => [$this->isMethod('post') ? 'required' : 'nullable', 'integer', Rule::exists('question_banks', 'id')],
            'content' => ['required', 'string', 'max:10000'],
            'difficulty' => ['nullable', Rule::in(['Mudah', 'Sedang', 'Sulit'])],
            'weight' => ['required', 'integer', 'min:1', 'max:100'],
            'options' => ['required', 'array', 'min:4', 'max:5'],
            'options.*.content' => ['required', 'string', 'max:5000'],
            'correct_option' => ['required', 'integer', 'min:0', 'max:4'],
        ];
    }
}
