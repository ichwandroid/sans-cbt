import { Head, Link, router } from '@inertiajs/react';
import QuestionController from '@/actions/App/Http/Controllers/Admin/QuestionController';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { dashboard } from '@/routes/admin';
import { index } from '@/routes/admin/questions';

type Question = { id: number; content: string; difficulty: string | null; weight: number; options: { id: number; label: string; content: string; is_correct: boolean }[] };

export default function QuestionShow({ question }: { question: Question }) {
    return <><Head title="Detail Soal" /><div className="flex h-full flex-1 flex-col gap-4 p-4"><Heading title="Detail Soal" description={`Tingkat ${question.difficulty ?? '-'} · Bobot ${question.weight}`} /><Card><CardContent className="space-y-4 pt-6"><p className="font-medium">{question.content}</p>{question.options.map((option) => <p key={option.id} className={option.is_correct ? 'rounded bg-primary/10 p-2 font-medium' : 'p-2'}>{option.label}. {option.content}{option.is_correct && ' — Kunci jawaban'}</p>)}<div className="flex gap-2"><Button variant="destructive" onClick={() => { if (window.confirm('Hapus soal ini?')) router.delete(QuestionController.destroy.url(question.id), { onSuccess: () => router.visit(index().url) }); }}>Hapus</Button><Button variant="outline" asChild><Link href={index().url}>Kembali</Link></Button></div></CardContent></Card></div></>;
}

QuestionShow.layout = { breadcrumbs: [{ title: 'Dashboard Admin', href: dashboard() }, { title: 'Bank Soal', href: index() }] };
