import { Head } from "@inertiajs/react";
import TeacherExamController from "@/actions/App/Http/Controllers/Teacher/ExamController";
import { ExamForm, type Option, type BankOption } from "./form";
import { dashboard as teacherDashboard } from "@/routes/teacher";
import {
    create as examCreate,
    index as examsIndex,
} from "@/routes/teacher/exams";

export default function TeacherExamCreate({
    subjects,
    classes,
    banks,
}: {
    subjects: Option[];
    classes: Option[];
    banks: BankOption[];
}) {
    return (
        <>
            <Head title="Buat Ujian" />
            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <ExamForm
                    action={TeacherExamController.store.form()}
                    headingTitle="Buat Ujian"
                    headingDescription="Pilih soal dari bank soal Anda, tentukan kelas peserta, jadwal, dan pengaturan acak."
                    exam={null}
                    subjects={subjects}
                    classes={classes}
                    banks={banks}
                    backHref={examsIndex().url}
                />
            </div>
        </>
    );
}

TeacherExamCreate.layout = {
    breadcrumbs: [
        { title: "Dashboard Guru", href: teacherDashboard() },
        { title: "Ujian", href: examsIndex() },
        { title: "Buat", href: examCreate() },
    ],
};
