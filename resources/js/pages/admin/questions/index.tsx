import { Form, Head, Link, router } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import QuestionController from '@/actions/App/Http/Controllers/Admin/QuestionController';
import { DeleteConfirmationDialog } from '@/components/admin/delete-confirmation-dialog';
import QuestionFormFields, {
    QUESTION_TYPE_LABELS,
} from '@/components/admin/question-form-fields';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { dashboard } from '@/routes/admin';
import { index as questionsIndex } from '@/routes/admin/questions';

type Option = { value: number; label: string };
type QuestionType = 'multiple_choice' | 'true_false' | 'essay';
type Question = {
    id: number;
    content: string;
    type: QuestionType;
    difficulty: string | null;
    weight: number;
};
type Bank = {
    id: number;
    name: string;
    subject: string;
    subject_id: number;
    school_class_id: number | null;
    teacher_id: number | null;
    class: string | null;
    teacher: string | null;
    material: string | null;
    questions_count: number;
    questions: Question[];
};

const DIFFICULTY_VARIANT: Record<
    string,
    'default' | 'secondary' | 'destructive'
> = {
    Mudah: 'secondary',
    Sedang: 'default',
    Sulit: 'destructive',
};

export default function Questions({
    banks,
    subjects,
    classes,
    teachers,
}: {
    banks: Bank[];
    subjects: Option[];
    classes: Option[];
    teachers: Option[];
}) {
    const [bankOpen, setBankOpen] = useState(false);
    const [editingBank, setEditingBank] = useState<Bank | null>(null);
    const [questionBank, setQuestionBank] = useState<Bank | null>(null);
    const [bankToDelete, setBankToDelete] = useState<Bank | null>(null);
    const [search, setSearch] = useState('');
    const [subjectFilter, setSubjectFilter] = useState('');

    const filtered = useMemo(
        () =>
            banks.filter(
                (bank) =>
                    (!subjectFilter ||
                        String(bank.subject_id) === subjectFilter) &&
                    `${bank.name} ${bank.subject} ${bank.material ?? ''} ${bank.questions.map((question) => question.content).join(' ')}`
                        .toLowerCase()
                        .includes(search.toLowerCase()),
            ),
        [banks, search, subjectFilter],
    );

    const destroyBank = () => {
        if (!bankToDelete) return;
        router.delete(QuestionController.destroyBank.url(bankToDelete.id), {
            preserveScroll: true,
            onSuccess: () => setBankToDelete(null),
        });
    };

    return (
        <>
            <Head title="Bank Soal" />
            <div className="flex h-full flex-1 flex-col gap-5 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                    <Heading
                        title="Bank Soal"
                        description="Kelola bank, soal, pilihan jawaban, gambar, dan tingkat kesulitan."
                    />
                    <Button
                        onClick={() => {
                            setEditingBank(null);
                            setBankOpen(true);
                        }}
                    >
                        Tambah Bank
                    </Button>
                </div>

                <div className="flex flex-wrap gap-3">
                    <Input
                        aria-label="Cari bank atau soal"
                        placeholder="Cari bank atau isi soal..."
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        className="max-w-sm"
                    />
                    <select
                        aria-label="Filter mata pelajaran"
                        value={subjectFilter}
                        onChange={(event) =>
                            setSubjectFilter(event.target.value)
                        }
                        className="h-9 rounded-md border border-input bg-background px-3 text-sm"
                    >
                        <option value="">Semua mata pelajaran</option>
                        {subjects.map((subject) => (
                            <option key={subject.value} value={subject.value}>
                                {subject.label}
                            </option>
                        ))}
                    </select>
                    <p className="self-center text-sm text-muted-foreground">
                        {filtered.length} bank ·{' '}
                        {filtered.reduce(
                            (sum, bank) => sum + bank.questions_count,
                            0,
                        )}{' '}
                        soal
                    </p>
                </div>

                <div className="grid gap-4 xl:grid-cols-2">
                    {filtered.map((bank) => (
                        <Card key={bank.id}>
                            <CardContent className="space-y-4 pt-5">
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <h2 className="font-semibold">
                                            {bank.name}
                                        </h2>
                                        <p className="text-sm text-muted-foreground">
                                            {bank.subject}
                                            {bank.material
                                                ? ` · ${bank.material}`
                                                : ''}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {bank.class ?? 'Semua kelas'}
                                            {bank.teacher
                                                ? ` · ${bank.teacher}`
                                                : ''}
                                        </p>
                                    </div>
                                    <span className="rounded-full bg-muted px-2.5 py-1 text-xs whitespace-nowrap">
                                        {bank.questions_count} soal
                                    </span>
                                </div>

                                <div className="flex flex-wrap gap-2">
                                    <Button
                                        size="sm"
                                        onClick={() => setQuestionBank(bank)}
                                    >
                                        Tambah Soal
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => {
                                            setEditingBank(bank);
                                            setBankOpen(true);
                                        }}
                                    >
                                        Edit Bank
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="destructive"
                                        onClick={() => setBankToDelete(bank)}
                                    >
                                        Hapus Bank
                                    </Button>
                                </div>

                                <div className="divide-y rounded-md border">
                                    {bank.questions.length ? (
                                        bank.questions.map((question) => (
                                            <div
                                                key={question.id}
                                                className="flex items-center justify-between gap-3 p-3"
                                            >
                                                <div className="min-w-0">
                                                    <p className="line-clamp-2 text-sm">
                                                        {question.content}
                                                    </p>
                                                    <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                                                        <Badge variant="outline">
                                                            {QUESTION_TYPE_LABELS[
                                                                question.type
                                                            ] ?? question.type}
                                                        </Badge>
                                                        {question.difficulty && (
                                                            <Badge
                                                                variant={
                                                                    DIFFICULTY_VARIANT[
                                                                        question
                                                                            .difficulty
                                                                    ] ??
                                                                    'secondary'
                                                                }
                                                            >
                                                                {
                                                                    question.difficulty
                                                                }
                                                            </Badge>
                                                        )}
                                                        <span className="text-xs text-muted-foreground">
                                                            Bobot{' '}
                                                            {question.weight}
                                                        </span>
                                                    </div>
                                                </div>
                                                <Button
                                                    asChild
                                                    size="sm"
                                                    variant="ghost"
                                                >
                                                    <Link
                                                        href={QuestionController.show.url(
                                                            question.id,
                                                        )}
                                                    >
                                                        Detail / Edit
                                                    </Link>
                                                </Button>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="p-3 text-sm text-muted-foreground">
                                            Belum ada soal di bank ini.
                                        </p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                    {filtered.length === 0 && (
                        <p className="text-sm text-muted-foreground">
                            Tidak ada bank soal yang cocok.
                        </p>
                    )}
                </div>

                {bankOpen && (
                    <BankDialog
                        open
                        onOpenChange={setBankOpen}
                        bank={editingBank}
                        subjects={subjects}
                        classes={classes}
                        teachers={teachers}
                    />
                )}
                {questionBank && (
                    <Dialog
                        open
                        onOpenChange={(open) => !open && setQuestionBank(null)}
                    >
                        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
                            <DialogHeader>
                                <DialogTitle>
                                    Tambah Soal — {questionBank.name}
                                </DialogTitle>
                            </DialogHeader>
                            <Form
                                {...QuestionController.store.form()}
                                options={{ preserveScroll: true }}
                                onSuccess={() => setQuestionBank(null)}
                                className="space-y-4"
                            >
                                {({ processing, errors }) => (
                                    <>
                                        <input
                                            type="hidden"
                                            name="question_bank_id"
                                            value={questionBank.id}
                                        />
                                        <QuestionFormFields
                                            errors={errors}
                                            idPrefix="create"
                                        />
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={() =>
                                                    setQuestionBank(null)
                                                }
                                            >
                                                Batal
                                            </Button>
                                            <Button disabled={processing}>
                                                Simpan Soal
                                            </Button>
                                        </div>
                                    </>
                                )}
                            </Form>
                        </DialogContent>
                    </Dialog>
                )}

                <DeleteConfirmationDialog
                    open={bankToDelete !== null}
                    onOpenChange={(open) => !open && setBankToDelete(null)}
                    itemName={
                        bankToDelete
                            ? `${bankToDelete.name} beserta seluruh soalnya`
                            : null
                    }
                    onConfirm={destroyBank}
                />
            </div>
        </>
    );
}

function BankDialog({
    open,
    onOpenChange,
    bank,
    subjects,
    classes,
    teachers,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    bank: Bank | null;
    subjects: Option[];
    classes: Option[];
    teachers: Option[];
}) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
                <DialogHeader>
                    <DialogTitle>
                        {bank ? 'Edit Bank Soal' : 'Tambah Bank Soal'}
                    </DialogTitle>
                </DialogHeader>
                <Form
                    {...(bank
                        ? QuestionController.updateBank.form(bank.id)
                        : QuestionController.storeBank.form())}
                    options={{ preserveScroll: true }}
                    onSuccess={() => onOpenChange(false)}
                    className="space-y-4"
                >
                    {({ processing, errors }) => (
                        <>
                            <Field
                                name="name"
                                label="Nama bank"
                                required
                                defaultValue={bank?.name}
                                error={errors.name}
                            />
                            <SelectField
                                name="subject_id"
                                label="Mata pelajaran"
                                options={subjects}
                                required
                                defaultValue={bank?.subject_id}
                                error={errors.subject_id}
                            />
                            <SelectField
                                name="school_class_id"
                                label="Kelas"
                                options={classes}
                                defaultValue={
                                    bank?.school_class_id ?? undefined
                                }
                                error={errors.school_class_id}
                            />
                            <SelectField
                                name="teacher_id"
                                label="Guru"
                                options={teachers}
                                defaultValue={bank?.teacher_id ?? undefined}
                                error={errors.teacher_id}
                            />
                            <Field
                                name="material"
                                label="Materi"
                                defaultValue={bank?.material ?? ''}
                                error={errors.material}
                            />
                            <div className="flex justify-end gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => onOpenChange(false)}
                                >
                                    Batal
                                </Button>
                                <Button disabled={processing}>
                                    {bank ? 'Simpan Perubahan' : 'Simpan Bank'}
                                </Button>
                            </div>
                        </>
                    )}
                </Form>
            </DialogContent>
        </Dialog>
    );
}

function Field({
    name,
    label,
    required = false,
    defaultValue = '',
    error,
}: {
    name: string;
    label: string;
    required?: boolean;
    defaultValue?: string;
    error?: string;
}) {
    return (
        <div className="grid gap-2">
            <Label htmlFor={name}>{label}</Label>
            <Input
                id={name}
                name={name}
                required={required}
                defaultValue={defaultValue}
            />
            <InputError message={error} />
        </div>
    );
}

function SelectField({
    name,
    label,
    options,
    required = false,
    defaultValue,
    error,
}: {
    name: string;
    label: string;
    options: Option[];
    required?: boolean;
    defaultValue?: number;
    error?: string;
}) {
    return (
        <div className="grid gap-2">
            <Label htmlFor={name}>{label}</Label>
            <select
                id={name}
                name={name}
                required={required}
                defaultValue={defaultValue ?? ''}
                className="h-9 rounded-md border border-input bg-background px-2 text-sm"
            >
                <option value="">-</option>
                {options.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
            <InputError message={error} />
        </div>
    );
}

Questions.layout = {
    breadcrumbs: [
        { title: 'Dashboard Admin', href: dashboard() },
        { title: 'Bank Soal', href: questionsIndex() },
    ],
};
