<?php

namespace Database\Factories;

use App\Models\ParentProfile;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<ParentProfile>
 */
class ParentProfileFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var class-string<ParentProfile>
     */
    protected $model = ParentProfile::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => null,
            'full_name' => fake()->name(),
            'phone' => fake()->numerify('08##########'),
            'occupation' => fake()->jobTitle(),
        ];
    }
}
