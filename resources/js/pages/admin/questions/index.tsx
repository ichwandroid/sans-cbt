import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import QuestionController from '@/actions/App/Http/Controllers/Admin/QuestionController';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { dashboard } from '@/routes/admin';
import { index } from '@/routes/admin/questions';

type Option = { value: number; label: string };
type Bank = { id: number; name: string; subject: string; material: string | null; questions_count: number };

export default function Questions({ banks, subjects, classes, teachers }: { banks: Bank[]; subjects: Option[]; classes: Option[]; teachers: Option[] }) {
    const [bankOpen, setBankOpen] = useState(false);
    const [questionBank, setQuestionBank] = useState<Bank | null>(null);

    return <><Head title="Bank Soal" /><div className="flex h-full flex-1 flex-col gap-4 p-4"><div className="flex flex-wrap justify-between gap-3"><Heading title="Bank Soal" description="Kelola soal pilihan ganda untuk CBT." /><Button onClick={() => setBankOpen(true)}>Tambah Bank</Button></div><div className="grid gap-4 md:grid-cols-2">{banks.map((bank) => <Card key={bank.id}><CardContent className="pt-6"><p className="font-semibold">{bank.name}</p><p className="text-sm text-muted-foreground">{bank.subject}{bank.material ? ` · ${bank.material}` : ''}</p><p className="mt-3 text-sm">{bank.questions_count} soal</p><Button size="sm" className="mt-4" onClick={() => setQuestionBank(bank)}>Tambah Soal</Button></CardContent></Card>)}{banks.length === 0 && <p className="text-sm text-muted-foreground">Belum ada bank soal.</p>}</div><BankDialog open={bankOpen} onOpenChange={setBankOpen} subjects={subjects} classes={classes} teachers={teachers} /><QuestionDialog bank={questionBank} onOpenChange={(open) => !open && setQuestionBank(null)} /></div></>;
}

function BankDialog({ open, onOpenChange, subjects, classes, teachers }: { open: boolean; onOpenChange: (open: boolean) => void; subjects: Option[]; classes: Option[]; teachers: Option[] }) {
    return <Dialog open={open} onOpenChange={onOpenChange}><DialogContent><DialogHeader><DialogTitle>Tambah Bank Soal</DialogTitle></DialogHeader><form className="space-y-4" onSubmit={(event) => { event.preventDefault(); router.post('/admin/question-banks', Object.fromEntries(new FormData(event.currentTarget)), { onSuccess: () => onOpenChange(false) }); }}><Field name="name" label="Nama bank" required /><Select name="subject_id" label="Mata pelajaran" options={subjects} required /><Select name="school_class_id" label="Kelas" options={classes} /><Select name="teacher_id" label="Guru" options={teachers} /><Field name="material" label="Materi" /><Button>Simpan</Button></form></DialogContent></Dialog>;
}

function QuestionDialog({ bank, onOpenChange }: { bank: Bank | null; onOpenChange: (open: boolean) => void }) {
    const [correct, setCorrect] = useState(0);
    return <Dialog open={bank !== null} onOpenChange={onOpenChange}><DialogContent className="max-h-[90vh] overflow-y-auto"><DialogHeader><DialogTitle>Tambah Soal {bank ? `— ${bank.name}` : ''}</DialogTitle></DialogHeader><form className="space-y-3" onSubmit={(event) => { event.preventDefault(); const form = new FormData(event.currentTarget); router.post(QuestionController.store.url(), { question_bank_id: bank?.id, content: form.get('content'), difficulty: form.get('difficulty'), weight: form.get('weight'), correct_option: correct, options: [0, 1, 2, 3].map((item) => ({ content: form.get(`option_${item}`) })) }, { onSuccess: () => onOpenChange(false) }); }}><textarea name="content" required rows={4} placeholder="Tulis pertanyaan..." className="border-input w-full rounded-md border p-2 text-sm" />{[0, 1, 2, 3].map((item) => <div key={item} className="flex items-center gap-2"><input type="radio" checked={correct === item} onChange={() => setCorrect(item)} /><Input name={`option_${item}`} required placeholder={`Pilihan ${String.fromCharCode(65 + item)}`} /></div>)}<div className="grid grid-cols-2 gap-3"><select name="difficulty" defaultValue="Sedang" className="border-input h-9 rounded-md border px-2 text-sm"><option>Mudah</option><option>Sedang</option><option>Sulit</option></select><Input name="weight" type="number" min="1" defaultValue="1" /></div><Button>Simpan Soal</Button></form></DialogContent></Dialog>;
}

function Field({ name, label, required = false }: { name: string; label: string; required?: boolean }) { return <div className="grid gap-2"><Label htmlFor={name}>{label}</Label><Input id={name} name={name} required={required} /></div>; }
function Select({ name, label, options, required = false }: { name: string; label: string; options: Option[]; required?: boolean }) { return <div className="grid gap-2"><Label htmlFor={name}>{label}</Label><select id={name} name={name} required={required} className="border-input h-9 rounded-md border px-2 text-sm"><option value="">-</option>{options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></div>; }
Questions.layout = { breadcrumbs: [{ title: 'Dashboard Admin', href: dashboard() }, { title: 'Bank Soal', href: index() }] };
