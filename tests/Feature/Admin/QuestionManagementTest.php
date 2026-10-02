<?php

use App\Models\Question;
use App\Models\QuestionBank;
use App\Models\Subject;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

function createQuestionBank(): QuestionBank
{
    $subject = Subject::query()->create(['code' => 'MTK', 'name' => 'Matematika', 'is_active' => true]);

    return QuestionBank::query()->create(['subject_id' => $subject->id, 'name' => 'Bank Ujian Tengah Semester', 'material' => 'Operasi Hitung']);
}

test('admin can create a multiple choice question with its answer key', function () {
    $admin = User::factory()->admin()->create();
    $bank = createQuestionBank();

    $this->actingAs($admin)
        ->post(route('admin.questions.store'), [
            'question_bank_id' => $bank->id,
            'type' => 'multiple_choice',
            'content' => 'Hasil dari 12 + 15 adalah...',
            'difficulty' => 'Mudah',
            'weight' => 5,
            'correct_option' => 2,
            'options' => [
                ['content' => '25'],
                ['content' => '26'],
                ['content' => '27'],
                ['content' => '28'],
            ],
        ])
        ->assertRedirect();

    $question = Question::query()->where('content', 'Hasil dari 12 + 15 adalah...')->first();
    expect($question)->not->toBeNull();
    expect($question->type)->toBe('multiple_choice');
    expect($question->options()->count())->toBe(4);
    expect($question->options()->where('is_correct', true)->value('label'))->toBe('C');
});

test('admin can create a true/false question that is normalized to Benar and Salah options', function () {
    $admin = User::factory()->admin()->create();
    $bank = createQuestionBank();

    $this->actingAs($admin)
        ->post(route('admin.questions.store'), [
            'question_bank_id' => $bank->id,
            'type' => 'true_false',
            'content' => 'Setiap bilangan prima pasti ganjil.',
            'weight' => 2,
            'correct_option' => 1,
        ])
        ->assertRedirect();

    $question = Question::query()->where('content', 'Setiap bilangan prima pasti ganjil.')->first();
    expect($question->type)->toBe('true_false');
    expect($question->options()->orderBy('id')->pluck('content')->all())->toBe(['Benar', 'Salah']);
    expect($question->options()->where('is_correct', true)->value('content'))->toBe('Salah');
});

test('admin can create an essay question without options', function () {
    $admin = User::factory()->admin()->create();
    $bank = createQuestionBank();

    $this->actingAs($admin)
        ->post(route('admin.questions.store'), [
            'question_bank_id' => $bank->id,
            'type' => 'essay',
            'content' => 'Jelaskan cara menghitung luas persegi panjang.',
            'weight' => 10,
        ])
        ->assertRedirect();

    $question = Question::query()->where('type', 'essay')->first();
    expect($question->options()->count())->toBe(0);
});

test('multiple choice questions require at least four options', function () {
    $admin = User::factory()->admin()->create();
    $bank = createQuestionBank();

    $this->actingAs($admin)
        ->post(route('admin.questions.store'), [
            'question_bank_id' => $bank->id,
            'type' => 'multiple_choice',
            'content' => 'Soal dengan pilihan kurang?',
            'weight' => 1,
            'correct_option' => 0,
            'options' => [['content' => 'A'], ['content' => 'B'], ['content' => 'C']],
        ])
        ->assertSessionHasErrors('options');
});

test('admin can upload a question image served through the protected media route', function () {
    Storage::fake('local');
    $admin = User::factory()->admin()->create();
    $bank = createQuestionBank();

    $this->actingAs($admin)
        ->post(route('admin.questions.store'), [
            'question_bank_id' => $bank->id,
            'type' => 'multiple_choice',
            'content' => 'Bangun datar pada gambar adalah...',
            'weight' => 3,
            'correct_option' => 0,
            'image' => UploadedFile::fake()->image('soal.png'),
            'options' => [
                ['content' => 'Persegi', 'image' => UploadedFile::fake()->image('persegi.png')],
                ['content' => 'Lingkaran'],
                ['content' => 'Segitiga'],
                ['content' => 'Trapesium'],
            ],
        ])
        ->assertRedirect();

    $question = Question::query()->where('content', 'Bangun datar pada gambar adalah...')->first();
    expect($question->image_path)->toBeString();
    expect($question->options()->whereNotNull('image_path')->count())->toBe(1);
    Storage::disk('local')->assertExists($question->image_path);
    Storage::disk('local')->assertExists($question->options()->whereNotNull('image_path')->value('image_path'));

    $this->actingAs($admin)
        ->get($question->fresh()->image_url)
        ->assertOk();
});

test('question media is not accessible for guests', function () {
    Storage::fake('local');
    UploadedFile::fake()->image('soal.png')->storeAs('question-media', 'rahasia.png', 'local');

    $this->get(route('admin.question-media.show', ['path' => 'rahasia.png']))
        ->assertRedirect(route('login'));
});

test('question media rejects unexpected file paths', function () {
    $admin = User::factory()->admin()->create();

    $this->actingAs($admin)->get(route('admin.question-media.show', ['path' => '..%2Fsecrets.txt']))->assertNotFound();
    $this->actingAs($admin)->get(route('admin.question-media.show', ['path' => 'tidak-ada.png']))->assertNotFound();
});

test('replacing a question image deletes the old stored file', function () {
    Storage::fake('local');
    $admin = User::factory()->admin()->create();
    $bank = createQuestionBank();
    $question = Question::query()->create([
        'question_bank_id' => $bank->id,
        'type' => 'multiple_choice',
        'content' => 'Soal lama',
        'weight' => 1,
        'image_path' => UploadedFile::fake()->image('lama.png')->store('question-media', 'local'),
    ]);

    $oldPath = $question->image_path;

    $this->actingAs($admin)
        ->put(route('admin.questions.update', $question), [
            'type' => 'multiple_choice',
            'content' => 'Soal lama',
            'weight' => 1,
            'correct_option' => 0,
            'options' => [['content' => 'A'], ['content' => 'B'], ['content' => 'C'], ['content' => 'D']],
            'image' => UploadedFile::fake()->image('baru.png'),
        ])
        ->assertRedirect();

    Storage::disk('local')->assertMissing($oldPath);
    Storage::disk('local')->assertExists($question->fresh()->image_path);
});

test('deleting a question removes its media files', function () {
    Storage::fake('local');
    $admin = User::factory()->admin()->create();
    $bank = createQuestionBank();
    $question = Question::query()->create([
        'question_bank_id' => $bank->id,
        'type' => 'multiple_choice',
        'content' => 'Soal akan dihapus',
        'weight' => 1,
        'image_path' => UploadedFile::fake()->image('soal.png')->store('question-media', 'local'),
    ]);
    $option = $question->options()->create(['label' => 'A', 'content' => 'A', 'is_correct' => true, 'image_path' => UploadedFile::fake()->image('opsi.png')->store('question-media', 'local')]);

    $this->actingAs($admin)
        ->delete(route('admin.questions.destroy', $question))
        ->assertRedirect(route('admin.questions.index'));

    Storage::disk('local')->assertMissing($question->image_path);
    Storage::disk('local')->assertMissing($option->image_path);
    expect(Question::query()->find($question->id))->toBeNull();
});

test('admin can update and delete a question bank', function () {
    $admin = User::factory()->admin()->create();
    $bank = createQuestionBank();

    $this->actingAs($admin)
        ->put(route('admin.question-banks.update', $bank), ['name' => 'Bank PAS', 'subject_id' => $bank->subject_id, 'material' => 'Pecahan'])
        ->assertRedirect();

    expect($bank->fresh()->name)->toBe('Bank PAS');

    $this->actingAs($admin)
        ->delete(route('admin.question-banks.destroy', $bank))
        ->assertRedirect();

    expect(QuestionBank::query()->find($bank->id))->toBeNull();
});
