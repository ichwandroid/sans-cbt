import { Head, router } from '@inertiajs/react';
import { Maximize } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    answer as answerRoute,
    security as securityRoute,
    submit as submitRoute,
} from '@/routes/student/exams';

type QuestionType =
    | 'multiple_choice'
    | 'multiple_answers'
    | 'true_false'
    | 'statement_true_false'
    | 'matching'
    | 'essay';
type Option = { id: number; content: string; image_url: string | null };
type WorkQuestion = {
    id: number;
    content: string;
    type: QuestionType;
    weight: number;
    image_url: string | null;
    options: Option[];
    pairs: { id: number; left_text: string }[];
    right_pool: string[];
};
type SessionInfo = {
    id: number;
    exam_name: string;
    subject: string;
    server_time: number;
    deadline: number;
    started_at_label: string;
    violation_flag_threshold: number;
};
type AnswerValue = Record<string, unknown>;

const TYPE_HINTS: Partial<Record<QuestionType, string>> = {
    multiple_choice: 'Pilih satu jawaban yang paling benar.',
    multiple_answers:
        'Centang semua jawaban yang benar (bisa lebih dari satu).',
    true_false: 'Pilih Benar atau Salah.',
    statement_true_false: 'Nilai setiap pernyataan: Benar atau Salah.',
    matching: 'Pasangkan setiap item kiri dengan pasangannya yang benar.',
    essay: 'Tulis jawabanmu dengan kalimat yang jelas.',
};

function formatClock(ms: number): string {
    const total = Math.max(0, Math.floor(ms / 1000));
    const hours = Math.floor(total / 3600);
    const minutes = Math.floor((total % 3600) / 60);
    const seconds = total % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

export default function StudentExamWork({
    session,
    questions,
    answers: initialAnswers,
}: {
    session: SessionInfo;
    questions: WorkQuestion[];
    answers: Record<string, AnswerValue | null>;
}) {
    const clockOffset = useRef(session.server_time - Date.now());
    const [remaining, setRemaining] = useState(
        () => session.deadline - (Date.now() + clockOffset.current),
    );
    const [current, setCurrent] = useState(0);
    const [answers, setAnswers] = useState<Record<number, AnswerValue | null>>(
        () =>
            Object.fromEntries(
                Object.entries(initialAnswers).map(([key, value]) => [
                    Number(key),
                    value,
                ]),
            ),
    );
    const [flagged, setFlagged] = useState<Set<number>>(() => {
        try {
            return new Set(
                JSON.parse(
                    localStorage.getItem(`cbt-flagged-${session.id}`) ?? '[]',
                ) as number[],
            );
        } catch {
            return new Set<number>();
        }
    });
    const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved'>(
        'idle',
    );
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [focusMode, setFocusMode] = useState(false);
    const submittedRef = useRef(false);
    const saveTimers = useRef<Record<number, ReturnType<typeof setTimeout>>>(
        {},
    );
    const blurAtRef = useRef<number | null>(null);
    const lastViolationNoticeRef = useRef(0);
    const fullscreenSupported =
        typeof document !== 'undefined' &&
        typeof document.documentElement.requestFullscreen === 'function';

    const submit = useCallback(() => {
        if (submittedRef.current) return;
        submittedRef.current = true;
        router.post(submitRoute.url({ session: session.id }));
    }, [session.id]);

    const reportSecurity = useCallback(
        (type: string, metadata: Record<string, unknown> = {}) => {
            if (submittedRef.current) return Promise.resolve(null);
            return fetch(securityRoute.url({ session: session.id }), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN':
                        (
                            document.querySelector(
                                'meta[name="csrf-token"]',
                            ) as HTMLMetaElement | null
                        )?.content ?? '',
                    Accept: 'application/json',
                },
                body: JSON.stringify({ type, metadata }),
            })
                .then((response) => (response.ok ? response.json() : null))
                .catch(() => null);
        },
        [session.id],
    );

    // Anti-cheating detection (spec 5.2 & 5.4): losing window focus, leaving
    // fullscreen, clipboard use, and their durations are recorded server-side.
    useEffect(() => {
        const onBlur = () => {
            blurAtRef.current ??= Date.now();
            void reportSecurity('WINDOW_BLUR');
        };
        const onFocus = () => {
            const blurAt = blurAtRef.current;
            blurAtRef.current = null;
            void reportSecurity(
                'WINDOW_FOCUS',
                blurAt !== null ? { duration_ms: Date.now() - blurAt } : {},
            );
        };
        const onFullscreenChange = () => {
            if (document.fullscreenElement) {
                setFocusMode(true);
                void reportSecurity('FULLSCREEN_ENTER');
            } else {
                setFocusMode(false);
                void reportSecurity('FULLSCREEN_EXIT', {
                    hint: 'keluar dari mode layar penuh',
                }).then((data) => {
                    const count = data?.violation_count;
                    if (
                        typeof count !== 'number' ||
                        count < session.violation_flag_threshold ||
                        lastViolationNoticeRef.current === count
                    ) {
                        return;
                    }
                    lastViolationNoticeRef.current = count;
                    toast.warning(
                        `Kamu sudah ${count}× keluar dari mode ujian. Pelanggaran ini dicatat untuk pengawas.`,
                    );
                });
            }
        };
        const onVisibility = () => {
            if (document.hidden) {
                blurAtRef.current ??= Date.now();
                void reportSecurity('WINDOW_BLUR', { via: 'visibilitychange' });
            }
        };
        const onCopy = (event: Event) => {
            event.preventDefault();
            void reportSecurity('COPY_ATTEMPT');
        };
        const onPaste = (event: Event) => {
            event.preventDefault();
            void reportSecurity('PASTE_BLOCKED');
        };
        const onContextMenu = (event: Event) => event.preventDefault();

        window.addEventListener('blur', onBlur);
        window.addEventListener('focus', onFocus);
        document.addEventListener('fullscreenchange', onFullscreenChange);
        document.addEventListener('visibilitychange', onVisibility);
        document.addEventListener('copy', onCopy);
        document.addEventListener('paste', onPaste);
        document.addEventListener('contextmenu', onContextMenu);
        return () => {
            window.removeEventListener('blur', onBlur);
            window.removeEventListener('focus', onFocus);
            document.removeEventListener(
                'fullscreenchange',
                onFullscreenChange,
            );
            document.removeEventListener('visibilitychange', onVisibility);
            document.removeEventListener('copy', onCopy);
            document.removeEventListener('paste', onPaste);
            document.removeEventListener('contextmenu', onContextMenu);
        };
    }, [reportSecurity, session.violation_flag_threshold]);

    const enterExamMode = () => {
        document.documentElement.requestFullscreen?.().catch(() => {});
    };

    // Fullscreen is mandatory: request it right away (the "Mulai Ujian" click
    // usually still counts as user activation) and gate the page behind the
    // overlay whenever it is not active.
    useEffect(() => {
        if (fullscreenSupported && !document.fullscreenElement) {
            enterExamMode();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        const timer = setInterval(() => {
            const left = session.deadline - (Date.now() + clockOffset.current);
            setRemaining(left);
            if (left <= 0) submit();
        }, 1000);
        return () => clearInterval(timer);
    }, [session.deadline, submit]);

    useEffect(() => {
        const handler = (event: BeforeUnloadEvent) => {
            if (!submittedRef.current) event.preventDefault();
        };
        window.addEventListener('beforeunload', handler);
        return () => window.removeEventListener('beforeunload', handler);
    }, []);

    const persist = useCallback(
        (questionId: number, value: AnswerValue | null) => {
            setSaveState('saving');
            clearTimeout(saveTimers.current[questionId]);
            saveTimers.current[questionId] = setTimeout(() => {
                fetch(answerRoute.url({ session: session.id }), {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN':
                            (
                                document.querySelector(
                                    'meta[name="csrf-token"]',
                                ) as HTMLMetaElement
                            )?.content ?? '',
                        Accept: 'application/json',
                    },
                    body: JSON.stringify({ question_id: questionId, value }),
                })
                    .then((response) =>
                        response.ok
                            ? response.json()
                            : Promise.reject(response.status),
                    )
                    .then(() => setSaveState('saved'))
                    .catch((status) => {
                        if (status === 409) {
                            submit();
                        } else {
                            setSaveState('idle');
                        }
                    });
            }, 500);
        },
        [session.id, submit],
    );

    const setAnswer = (questionId: number, value: AnswerValue | null) => {
        setAnswers((current) => ({ ...current, [questionId]: value }));
        persist(questionId, value);
    };

    const toggleFlag = (questionId: number) => {
        setFlagged((current) => {
            const next = new Set(current);
            if (next.has(questionId)) {
                next.delete(questionId);
            } else {
                next.add(questionId);
            }
            localStorage.setItem(
                `cbt-flagged-${session.id}`,
                JSON.stringify([...next]),
            );
            return next;
        });
    };

    const question = questions[current];
    const answeredCount = questions.filter(
        (q) =>
            answers[q.id] !== undefined &&
            answers[q.id] !== null &&
            !isEmptyAnswer(answers[q.id]),
    ).length;
    const lowTime = remaining <= 5 * 60 * 1000;

    return (
        <>
            <Head title={session.exam_name} />
            {fullscreenSupported && !focusMode && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-background p-4">
                    <div className="w-full max-w-md space-y-4 rounded-xl border bg-card p-6 text-center shadow-lg">
                        <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                            <Maximize className="size-6" />
                        </div>
                        <div className="space-y-1.5">
                            <h2 className="text-lg font-semibold">
                                Mode layar penuh diperlukan
                            </h2>
                            <p className="text-sm text-muted-foreground">
                                Ujian harus dikerjakan dalam mode layar penuh.
                                Keluar dari mode ini akan dicatat sebagai
                                pelanggaran oleh pengawas.
                            </p>
                        </div>
                        <Button className="w-full" onClick={enterExamMode}>
                            <Maximize />
                            Masuk Mode Ujian
                        </Button>
                    </div>
                </div>
            )}
            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-card p-4">
                    <div>
                        <p className="text-sm font-semibold">
                            {session.exam_name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                            {session.subject}
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <span
                            className={`text-xs ${saveState === 'saved' ? 'text-emerald-600 dark:text-emerald-400' : 'text-muted-foreground'}`}
                        >
                            {saveState === 'saving'
                                ? 'Menyimpan...'
                                : saveState === 'saved'
                                  ? 'Jawaban tersimpan ✓'
                                  : ''}
                        </span>
                        <span
                            className={`rounded-lg px-3 py-1.5 font-mono text-lg font-bold ${lowTime ? 'bg-destructive/10 text-destructive' : 'bg-muted'}`}
                        >
                            ⏱ {formatClock(remaining)}
                        </span>
                    </div>
                </div>

                <p className="text-sm text-muted-foreground">
                    Soal {current + 1} dari {questions.length} ·{' '}
                    <span className="text-xs">
                        Terjawab {answeredCount}/{questions.length}
                    </span>
                </p>

                {question && (
                    <Card>
                        <CardContent className="space-y-4 pt-5">
                            <div className="flex items-start justify-between gap-3">
                                <p className="text-base whitespace-pre-wrap">
                                    {question.content}
                                </p>
                                <Button
                                    type="button"
                                    size="sm"
                                    variant={
                                        flagged.has(question.id)
                                            ? 'default'
                                            : 'outline'
                                    }
                                    onClick={() => toggleFlag(question.id)}
                                >
                                    {flagged.has(question.id)
                                        ? '★ Ditandai'
                                        : '☆ Tandai'}
                                </Button>
                            </div>
                            {question.image_url && (
                                <img
                                    src={question.image_url}
                                    alt="Gambar soal"
                                    className="max-h-64 rounded-md border object-contain"
                                />
                            )}
                            <p className="text-xs text-muted-foreground">
                                {TYPE_HINTS[question.type]}
                            </p>
                            <QuestionInput
                                question={question}
                                value={answers[question.id] ?? null}
                                onChange={(value) =>
                                    setAnswer(question.id, value)
                                }
                            />
                        </CardContent>
                    </Card>
                )}

                <div className="flex flex-wrap gap-1.5">
                    {questions.map((q, index) => {
                        const answered =
                            answers[q.id] !== undefined &&
                            answers[q.id] !== null &&
                            !isEmptyAnswer(answers[q.id]);
                        return (
                            <button
                                key={q.id}
                                type="button"
                                onClick={() => setCurrent(index)}
                                className={`size-9 rounded-md border text-sm font-medium transition-colors ${
                                    index === current
                                        ? 'border-primary bg-primary text-primary-foreground'
                                        : flagged.has(q.id)
                                          ? 'border-amber-500 bg-amber-500/15 text-amber-700 dark:text-amber-400'
                                          : answered
                                            ? 'border-emerald-600 bg-emerald-600/15 text-emerald-700 dark:text-emerald-400'
                                            : 'bg-background text-muted-foreground hover:bg-muted'
                                }`}
                            >
                                {index + 1}
                            </button>
                        );
                    })}
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3">
                    <Button
                        type="button"
                        variant="outline"
                        disabled={current === 0}
                        onClick={() =>
                            setCurrent((index) => Math.max(0, index - 1))
                        }
                    >
                        ← Sebelumnya
                    </Button>
                    <div className="flex gap-2">
                        {current < questions.length - 1 ? (
                            <Button
                                type="button"
                                onClick={() =>
                                    setCurrent((index) =>
                                        Math.min(
                                            questions.length - 1,
                                            index + 1,
                                        ),
                                    )
                                }
                            >
                                Berikutnya →
                            </Button>
                        ) : (
                            <Button
                                type="button"
                                onClick={() => setConfirmOpen(true)}
                            >
                                Selesai &amp; Kumpulkan
                            </Button>
                        )}
                    </div>
                </div>

                <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Kumpulkan ujian?</DialogTitle>
                            <DialogDescription>
                                {questions.length - answeredCount > 0
                                    ? `Masih ada ${questions.length - answeredCount} soal belum terjawab. Jawaban yang sudah tersimpan akan dinilai.`
                                    : 'Semua soal sudah terjawab. Jawaban akan dinilai otomatis.'}
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            <Button
                                variant="outline"
                                onClick={() => setConfirmOpen(false)}
                            >
                                Periksa Lagi
                            </Button>
                            <Button onClick={submit}>Ya, Kumpulkan</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </>
    );
}

function isEmptyAnswer(value: AnswerValue | null): boolean {
    if (value === null) return true;
    if ('text' in value) return !value.text || String(value.text).trim() === '';
    if ('option_id' in value)
        return value.option_id === null || value.option_id === undefined;
    if ('option_ids' in value)
        return (
            !Array.isArray(value.option_ids) || value.option_ids.length === 0
        );
    if ('judgments' in value)
        return Object.keys(value.judgments ?? {}).length === 0;
    if ('matches' in value)
        return Object.keys(value.matches ?? {}).length === 0;
    return true;
}

function QuestionInput({
    question,
    value,
    onChange,
}: {
    question: WorkQuestion;
    value: AnswerValue | null;
    onChange: (value: AnswerValue | null) => void;
}) {
    if (question.type === 'multiple_choice' || question.type === 'true_false') {
        const selected = (value?.option_id as number | undefined) ?? null;
        return (
            <div className="space-y-2">
                {question.options.map((option, index) => (
                    <label
                        key={option.id}
                        className="flex cursor-pointer items-start gap-3 rounded-md border p-3 text-sm transition-colors hover:bg-muted/50"
                    >
                        <input
                            type="radio"
                            name={`option-${question.id}`}
                            checked={selected === option.id}
                            onChange={() => onChange({ option_id: option.id })}
                            className="mt-0.5 size-4 shrink-0 accent-primary"
                        />
                        <span className="min-w-0 flex-1">
                            <span className="font-medium">
                                {String.fromCharCode(65 + index)}.
                            </span>{' '}
                            {option.content}
                        </span>
                        {option.image_url && (
                            <img
                                src={option.image_url}
                                alt={`Pilihan ${String.fromCharCode(65 + index)}`}
                                className="max-h-16 rounded border object-contain"
                            />
                        )}
                    </label>
                ))}
            </div>
        );
    }

    if (question.type === 'multiple_answers') {
        const selected = new Set(
            ((value?.option_ids as number[] | undefined) ?? []).map(Number),
        );
        return (
            <div className="space-y-2">
                {question.options.map((option, index) => (
                    <label
                        key={option.id}
                        className="flex cursor-pointer items-start gap-3 rounded-md border p-3 text-sm transition-colors hover:bg-muted/50"
                    >
                        <input
                            type="checkbox"
                            checked={selected.has(option.id)}
                            onChange={() => {
                                const next = new Set(selected);
                                if (next.has(option.id)) {
                                    next.delete(option.id);
                                } else {
                                    next.add(option.id);
                                }
                                onChange({ option_ids: [...next] });
                            }}
                            className="mt-0.5 size-4 shrink-0 accent-primary"
                        />
                        <span className="min-w-0 flex-1">
                            <span className="font-medium">
                                {String.fromCharCode(65 + index)}.
                            </span>{' '}
                            {option.content}
                        </span>
                    </label>
                ))}
            </div>
        );
    }

    if (question.type === 'statement_true_false') {
        const judgments =
            (value?.judgments as Record<string, boolean> | undefined) ?? {};
        return (
            <div className="divide-y rounded-md border">
                {question.options.map((option, index) => (
                    <div
                        key={option.id}
                        className="flex flex-wrap items-center justify-between gap-2 p-3"
                    >
                        <p className="min-w-0 flex-1 text-sm">
                            {index + 1}. {option.content}
                        </p>
                        <div className="flex gap-4 text-sm">
                            {[true, false].map((isTrue) => (
                                <label
                                    key={String(isTrue)}
                                    className="flex cursor-pointer items-center gap-1.5"
                                >
                                    <input
                                        type="radio"
                                        name={`statement-${question.id}-${option.id}`}
                                        checked={
                                            (judgments[option.id] ??
                                                judgments[String(option.id)] ??
                                                null) === isTrue
                                        }
                                        onChange={() =>
                                            onChange({
                                                judgments: {
                                                    ...judgments,
                                                    [option.id]: isTrue,
                                                },
                                            })
                                        }
                                    />
                                    {isTrue ? 'Benar' : 'Salah'}
                                </label>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (question.type === 'matching') {
        const matches =
            (value?.matches as Record<string, string> | undefined) ?? {};
        return (
            <div className="grid gap-2">
                {question.pairs.map((pair, index) => (
                    <div
                        key={pair.id}
                        className="flex flex-wrap items-center gap-3 rounded-md border p-3"
                    >
                        <span className="min-w-24 text-sm font-medium">
                            {index + 1}. {pair.left_text}
                        </span>
                        <span className="text-muted-foreground">→</span>
                        <select
                            value={
                                matches[pair.id] ??
                                matches[String(pair.id)] ??
                                ''
                            }
                            onChange={(event) => {
                                const next = { ...matches };
                                if (event.target.value === '') {
                                    delete next[pair.id];
                                } else {
                                    next[pair.id] = event.target.value;
                                }
                                onChange({ matches: next });
                            }}
                            className="h-9 min-w-44 flex-1 rounded-md border border-input bg-background px-2 text-sm"
                        >
                            <option value="">— pilih pasangan —</option>
                            {question.right_pool.map((text) => (
                                <option key={text} value={text}>
                                    {text}
                                </option>
                            ))}
                        </select>
                    </div>
                ))}
            </div>
        );
    }

    const text = (value?.text as string | undefined) ?? '';
    return (
        <textarea
            rows={6}
            value={text}
            onChange={(event) => onChange({ text: event.target.value })}
            placeholder="Tulis jawabanmu di sini..."
            className="w-full rounded-md border border-input bg-background p-3 text-sm"
        />
    );
}
