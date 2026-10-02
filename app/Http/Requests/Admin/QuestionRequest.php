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
     * Normalize option payloads so the controller only deals with one shape:
     * true/false questions always carry the Benar/Salah pair and essays never carry options.
     */
    protected function prepareForValidation(): void
    {
        $type = (string) $this->input('type', 'multiple_choice');

        if ($type === 'true_false') {
            $this->merge([
                'options' => [['content' => 'Benar'], ['content' => 'Salah']],
                'correct_option' => min(max((int) $this->input('correct_option', 0), 0), 1),
            ]);
        }

        if ($type === 'essay') {
            $this->merge(['options' => [], 'correct_option' => null]);
        }
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $type = (string) $this->input('type', 'multiple_choice');
        $optionCount = $type === 'true_false' ? 'size:2' : 'max:5';

        return [
            'question_bank_id' => [$this->isMethod('post') ? 'required' : 'nullable', 'integer', Rule::exists('question_banks', 'id')],
            'type' => ['required', Rule::in(['multiple_choice', 'true_false', 'essay'])],
            'content' => ['required', 'string', 'max:10000'],
            'difficulty' => ['nullable', Rule::in(['Mudah', 'Sedang', 'Sulit'])],
            'weight' => ['required', 'integer', 'min:1', 'max:100'],
            'image' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
            'image_path' => ['nullable', 'string', 'regex:#^question-media/[A-Za-z0-9._-]+$#'],
            'remove_image' => ['nullable', 'boolean'],
            'options' => [Rule::requiredIf(in_array($type, ['multiple_choice', 'true_false'], true)), 'nullable', 'array', $type === 'multiple_choice' ? 'min:4' : $optionCount],
            'options.*.content' => ['required_with:options', 'string', 'max:5000'],
            'options.*.image' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
            'options.*.image_path' => ['nullable', 'string', 'regex:#^question-media/[A-Za-z0-9._-]+$#'],
            'options.*.remove_image' => ['nullable', 'boolean'],
            'correct_option' => [Rule::requiredIf($type !== 'essay'), 'nullable', 'integer', 'min:0', 'max:4'],
        ];
    }
}
