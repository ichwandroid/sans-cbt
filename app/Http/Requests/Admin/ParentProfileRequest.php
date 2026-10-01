<?php

namespace App\Http\Requests\Admin;

use App\Models\ParentProfile;
use App\Role;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ParentProfileRequest extends FormRequest
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
        $parent = $this->route('parent');
        $parentId = $parent instanceof ParentProfile ? $parent->id : null;

        return [
            'user_id' => ['nullable', Rule::exists('users', 'id')->where('role', Role::OrangTua->value), Rule::unique('parents', 'user_id')->ignore($parentId)],
            'full_name' => ['required', 'string', 'max:255'],
            'phone' => ['nullable', 'string', 'max:50'],
            'occupation' => ['nullable', 'string', 'max:255'],
            'students' => ['nullable', 'array'],
            'students.*.id' => ['required', 'integer', Rule::exists('students', 'id')],
            'students.*.relation' => ['nullable', 'string', 'max:50'],
        ];
    }
}
