<?php

namespace Database\Seeders;

use App\Models\Exam;
use App\Models\Question;
use App\Models\QuestionBank;
use App\Models\SchoolClass;
use App\Models\Subject;
use App\Models\Teacher;
use App\Models\User;
use Illuminate\Database\Seeder;

/**
 * Optional demo data for the teacher area: a teacher profile, a question bank
 * with sample questions, and one published exam for tomorrow.
 */
class DemoGuruSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $user = User::query()->where('email', 'guru@sekolahanaksaleh.sch.id')->first();

        if ($user === null) {
            return;
        }

        $teacher = Teacher::query()->firstOrCreate(
            ['user_id' => $user->id],
            ['full_name' => 'Budi Santoso', 'nip' => '19870001', 'phone' => '081200000001'],
        );

        if (QuestionBank::query()->where('teacher_id', $teacher->id)->where('name', 'Bank UTS Matematika')->exists()) {
            return;
        }

        $subject = Subject::query()->where('name', 'like', '%Matematika%')->first()
            ?? Subject::query()->create(['code' => 'MTK', 'name' => 'Matematika', 'is_active' => true]);

        $bank = QuestionBank::query()->create(['teacher_id' => $teacher->id, 'subject_id' => $subject->id, 'name' => 'Bank UTS Matematika', 'material' => 'Operasi Pecahan']);

        $questions = [
            ['content' => 'Ibu dari nama 3/4 adalah...', 'difficulty' => 'Mudah'],
            ['content' => 'Hasil dari 1/2 + 1/3 adalah...', 'difficulty' => 'Sedang'],
            ['content' => 'Bentuk desimal dari 3/5 adalah...', 'difficulty' => 'Mudah'],
            ['content' => 'Nilai 2/5 dalam persen adalah...', 'difficulty' => 'Sulit'],
        ];

        $questionIds = [];
        foreach ($questions as $index => $payload) {
            $question = Question::query()->create(['question_bank_id' => $bank->id, 'type' => 'multiple_choice', 'content' => $payload['content'], 'difficulty' => $payload['difficulty'], 'weight' => $index + 1]);
            $question->options()->createMany([
                ['label' => 'A', 'content' => 'A', 'is_correct' => false],
                ['label' => 'B', 'content' => 'B', 'is_correct' => false],
                ['label' => 'C', 'content' => 'C', 'is_correct' => true],
                ['label' => 'D', 'content' => 'D', 'is_correct' => false],
            ]);
            $questionIds[] = $question->id;
        }

        $class = SchoolClass::query()->first();

        $exam = Exam::query()->create([
            'teacher_id' => $teacher->id,
            'subject_id' => $subject->id,
            'school_class_id' => $class->id,
            'name' => 'UTS Matematika Semester Ganjil',
            'description' => 'Kerjakan dengan teliti dan cermati satuan.',
            'started_at' => now()->addDay()->setTime(8, 0),
            'duration_minutes' => 90,
            'shuffle_questions' => true,
            'is_published' => true,
            'published_at' => now(),
        ]);

        $exam->questions()->sync(collect($questionIds)->mapWithKeys(fn (int $id, int $index): array => [$id => ['sort_order' => $index + 1]]));
    }
}
