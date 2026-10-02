import { useRef, useState } from 'react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export type QuestionType = 'multiple_choice' | 'true_false' | 'essay';

type OptionValue = {
    content: string;
    is_correct?: boolean;
    image_path?: string | null;
    image_url?: string | null;
};
type QuestionValue = {
    type?: QuestionType;
    content?: string;
    difficulty?: string | null;
    weight?: number;
    image_path?: string | null;
    image_url?: string | null;
    options?: OptionValue[];
};

export const QUESTION_TYPE_LABELS: Record<QuestionType, string> = {
    multiple_choice: 'Pilihan Ganda',
    true_false: 'Benar/Salah',
    essay: 'Esai',
};

const DIFFICULTIES = ['Mudah', 'Sedang', 'Sulit'];
const ACCEPT = 'image/png,image/jpeg,image/webp';

/**
 * Shared question fields used by both the create dialog and the edit page.
 * Input names follow PHP bracket notation so Laravel receives nested option data.
 */
export default function QuestionFormFields({
    question,
    errors,
    idPrefix,
}: {
    question?: QuestionValue | null;
    errors: Partial<Record<string, string>>;
    idPrefix: string;
}) {
    const [type, setType] = useState<QuestionType>(
        question?.type ?? 'multiple_choice',
    );
    const [optionCount, setOptionCount] = useState(() =>
        question?.options?.length
            ? Math.min(5, Math.max(4, question.options.length))
            : 4,
    );
    const [correct, setCorrect] = useState(() => {
        const index = question?.options?.findIndex(
            (option) => option.is_correct,
        );
        return index !== undefined && index > -1 ? index : 0;
    });
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [imageRemoved, setImageRemoved] = useState(false);
    const imageInputRef = useRef<HTMLInputElement>(null);
    const id = (name: string) => `${idPrefix}-${name}`;
    const isMultipleChoice = type === 'multiple_choice';

    return (
        <>
            <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                    <Label htmlFor={id('type')}>Tipe soal</Label>
                    <select
                        id={id('type')}
                        name="type"
                        value={type}
                        onChange={(event) =>
                            setType(event.target.value as QuestionType)
                        }
                        className="h-9 rounded-md border border-input bg-background px-2 text-sm"
                    >
                        {Object.entries(QUESTION_TYPE_LABELS).map(
                            ([value, label]) => (
                                <option key={value} value={value}>
                                    {label}
                                </option>
                            ),
                        )}
                    </select>
                    <InputError message={errors.type} />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor={id('difficulty')}>Tingkat kesulitan</Label>
                    <select
                        id={id('difficulty')}
                        name="difficulty"
                        defaultValue={question?.difficulty ?? 'Sedang'}
                        className="h-9 rounded-md border border-input bg-background px-2 text-sm"
                    >
                        {DIFFICULTIES.map((difficulty) => (
                            <option key={difficulty} value={difficulty}>
                                {difficulty}
                            </option>
                        ))}
                    </select>
                    <InputError message={errors.difficulty} />
                </div>
            </div>

            <div className="grid gap-2">
                <Label htmlFor={id('content')}>Pertanyaan</Label>
                <textarea
                    id={id('content')}
                    name="content"
                    required
                    rows={4}
                    defaultValue={question?.content ?? ''}
                    placeholder="Tulis pertanyaan..."
                    className="w-full rounded-md border border-input bg-background p-2 text-sm"
                />
                <InputError message={errors.content} />
            </div>

            <div className="grid gap-2">
                <Label htmlFor={id('image')}>Gambar soal (opsional)</Label>
                {(imagePreview || (question?.image_url && !imageRemoved)) && (
                    <img
                        src={imagePreview ?? question?.image_url ?? undefined}
                        alt="Pratinjau gambar soal"
                        className="max-h-40 rounded-md border object-contain"
                    />
                )}
                <div className="flex flex-wrap items-center gap-3">
                    <Input
                        ref={imageInputRef}
                        id={id('image')}
                        name="image"
                        type="file"
                        accept={ACCEPT}
                        className="w-auto text-xs"
                        onChange={(event) => {
                            setImageRemoved(false);
                            setImagePreview(
                                event.target.files?.[0]
                                    ? URL.createObjectURL(event.target.files[0])
                                    : null,
                            );
                        }}
                    />
                    {question?.image_path && (
                        <label className="flex items-center gap-1.5 text-sm text-muted-foreground">
                            <input
                                type="checkbox"
                                name="remove_image"
                                value="1"
                                checked={imageRemoved}
                                onChange={(event) => {
                                    setImageRemoved(event.target.checked);
                                    if (event.target.checked) {
                                        setImagePreview(null);
                                        if (imageInputRef.current)
                                            imageInputRef.current.value = '';
                                    }
                                }}
                            />
                            Hapus gambar
                        </label>
                    )}
                </div>
                <InputError message={errors.image} />
            </div>

            {isMultipleChoice && (
                <div className="grid gap-2">
                    <Label>Pilihan jawaban &amp; kunci</Label>
                    {Array.from({ length: optionCount }, (_, index) => {
                        const letter = String.fromCharCode(65 + index);
                        const existing = question?.options?.[index];
                        return (
                            <div
                                key={index}
                                className="flex items-start gap-2 rounded-md border p-2.5"
                            >
                                <input
                                    aria-label={`Jadikan pilihan ${letter} sebagai kunci jawaban`}
                                    type="radio"
                                    checked={correct === index}
                                    onChange={() => setCorrect(index)}
                                    className="mt-2.5"
                                />
                                <div className="min-w-0 flex-1 space-y-2">
                                    <div className="flex items-center gap-2">
                                        <span className="w-5 text-sm font-medium">
                                            {letter}.
                                        </span>
                                        <Input
                                            name={`options[${index}][content]`}
                                            required
                                            placeholder={`Pilihan ${letter}`}
                                            defaultValue={
                                                existing?.content ?? ''
                                            }
                                        />
                                    </div>
                                    <OptionImageInput
                                        name={`options[${index}]`}
                                        existingPath={
                                            existing?.image_path ?? null
                                        }
                                        existingUrl={
                                            existing?.image_url ?? null
                                        }
                                        error={errors[`options.${index}.image`]}
                                    />
                                </div>
                            </div>
                        );
                    })}
                    <input
                        type="hidden"
                        name="correct_option"
                        value={correct}
                    />
                    <div className="flex gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            disabled={optionCount >= 5}
                            onClick={() =>
                                setOptionCount((count) =>
                                    Math.min(5, count + 1),
                                )
                            }
                        >
                            Tambah Pilihan
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            disabled={optionCount <= 4}
                            onClick={() => {
                                const next = Math.max(4, optionCount - 1);
                                setOptionCount(next);
                                setCorrect((current) =>
                                    current >= next ? 0 : current,
                                );
                            }}
                        >
                            Kurangi Pilihan
                        </Button>
                    </div>
                    <InputError
                        message={errors.options ?? errors.correct_option}
                    />
                    <p className="text-xs text-muted-foreground">
                        Minimal 4 pilihan, maksimal 5 (A&ndash;E). Klik bulatan
                        di kiri untuk menandai kunci jawaban.
                    </p>
                </div>
            )}

            {type === 'true_false' && (
                <div className="grid gap-2">
                    <Label>Kunci jawaban</Label>
                    {['Benar', 'Salah'].map((label, index) => (
                        <label
                            key={label}
                            className="flex items-center gap-2 text-sm"
                        >
                            <input
                                type="radio"
                                name={`${idPrefix}-tf-ui`}
                                checked={correct === index}
                                onChange={() => setCorrect(index)}
                            />
                            {label}
                        </label>
                    ))}
                    <input
                        type="hidden"
                        name="correct_option"
                        value={correct}
                    />
                    <InputError message={errors.correct_option} />
                    <p className="text-xs text-muted-foreground">
                        Pilihan Benar/Salah dibuat otomatis oleh sistem.
                    </p>
                </div>
            )}

            {type === 'essay' && (
                <p className="rounded-md bg-muted p-3 text-sm text-muted-foreground">
                    Soal esai tidak memiliki pilihan jawaban dan akan dinilai
                    manual oleh guru setelah ujian.
                </p>
            )}

            <div className="grid gap-2">
                <Label htmlFor={id('weight')}>Bobot nilai</Label>
                <Input
                    id={id('weight')}
                    name="weight"
                    type="number"
                    min="1"
                    max="100"
                    defaultValue={question?.weight ?? 1}
                    required
                />
                <InputError message={errors.weight} />
            </div>
        </>
    );
}

/**
 * One option image control: uploads a replacement file or flags the existing one for removal.
 */
function OptionImageInput({
    name,
    existingPath,
    existingUrl,
    error,
}: {
    name: string;
    existingPath: string | null;
    existingUrl: string | null;
    error?: string;
}) {
    const [preview, setPreview] = useState<string | null>(null);
    const [removed, setRemoved] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const showsExisting = !preview && existingUrl !== null && !removed;

    return (
        <div className="flex flex-wrap items-center gap-2 pl-7">
            {existingPath && (
                <input
                    type="hidden"
                    name={`${name}[image_path]`}
                    value={existingPath}
                />
            )}
            {(preview || showsExisting) && (
                <img
                    src={preview ?? existingUrl ?? undefined}
                    alt="Pratinjau pilihan"
                    className="size-10 rounded border object-cover"
                />
            )}
            <input
                ref={inputRef}
                type="file"
                name={`${name}[image]`}
                accept={ACCEPT}
                className="text-xs"
                onChange={(event) => {
                    const file = event.target.files?.[0];
                    setPreview(file ? URL.createObjectURL(file) : null);
                    if (file) setRemoved(false);
                }}
            />
            {existingPath && (
                <label className="flex items-center gap-1 text-xs text-muted-foreground">
                    <input
                        type="checkbox"
                        name={`${name}[remove_image]`}
                        value="1"
                        checked={removed}
                        onChange={(event) => {
                            setRemoved(event.target.checked);
                            if (event.target.checked) {
                                setPreview(null);
                                if (inputRef.current)
                                    inputRef.current.value = '';
                            }
                        }}
                    />
                    hapus gambar
                </label>
            )}
            <InputError message={error} />
        </div>
    );
}
