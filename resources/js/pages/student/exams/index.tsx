import { Head, router } from "@inertiajs/react";
import { useEffect, useState } from "react";
import Heading from "@/components/heading";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
    index as studentExamsIndex,
    result as sessionResult,
    start as examStart,
} from "@/routes/student/exams";

type ExamStatus = "scheduled" | "ongoing" | "finished";
type SessionInfo = { id: number; status: "ongoing" | "submitted" | "expired" };
type Exam = {
    id: number;
    name: string;
    subject: string;
    class: string;
    started_at_label: string;
    ends_at_label: string;
    starts_at: number;
    ends_at: number;
    duration_minutes: number;
    questions_count: number;
    status: ExamStatus;
    session: SessionInfo | null;
};

const STATUS_LABELS: Record<ExamStatus, string> = {
    scheduled: "Akan Datang",
    ongoing: "Sedang Berlangsung",
    finished: "Selesai",
};

const STATUS_VARIANT: Record<
    ExamStatus,
    "secondary" | "default" | "destructive" | "outline"
> = {
    scheduled: "secondary",
    ongoing: "destructive",
    finished: "outline",
};

function useCountdown(target: number, serverTime: number) {
    const [offset] = useState(() => serverTime - Date.now());
    const [remaining, setRemaining] = useState(
        () => target - (Date.now() + offset),
    );

    useEffect(() => {
        const timer = setInterval(
            () => setRemaining(target - (Date.now() + offset)),
            1000,
        );
        return () => clearInterval(timer);
    }, [target, offset]);

    return Math.max(0, remaining);
}

function formatDuration(ms: number): string {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours > 0 ? `${hours} j ` : ""}${minutes} mnt ${seconds.toString().padStart(2, "0")} dtk`;
}

export default function StudentExams({
    exams,
    server_time,
}: {
    exams: Exam[];
    server_time: number;
}) {
    return (
        <>
            <Head title="Ujian Saya" />
            <div className="flex h-full flex-1 flex-col gap-5 p-4">
                <Heading
                    title="Ujian Saya"
                    description="Daftar ujian untuk kelas Anda. Klik Mulai saat ujian sedang berlangsung."
                />

                <div className="grid gap-4 xl:grid-cols-2">
                    {exams.map((exam) => (
                        <ExamCard
                            key={exam.id}
                            exam={exam}
                            serverTime={server_time}
                        />
                    ))}
                    {exams.length === 0 && (
                        <p className="text-sm text-muted-foreground">
                            Belum ada ujian yang dijadwalkan untuk kelas Anda.
                        </p>
                    )}
                </div>
            </div>
        </>
    );
}

function ExamCard({ exam, serverTime }: { exam: Exam; serverTime: number }) {
    const untilStart = useCountdown(exam.starts_at, serverTime);
    const untilEnd = useCountdown(exam.ends_at, serverTime);

    const sessionOngoing = exam.session?.status === "ongoing";
    const sessionDone =
        exam.session !== null && exam.session.status !== "ongoing";

    let action = null;
    if (sessionDone) {
        action = (
            <Button asChild>
                <a href={sessionResult.url(exam.session!.id)}>Lihat Hasil</a>
            </Button>
        );
    } else if (sessionOngoing) {
        action = (
            <Button onClick={() => router.post(examStart.url(exam.id))}>
                Lanjutkan Ujian
            </Button>
        );
    } else if (exam.status === "scheduled") {
        action = (
            <div className="text-right">
                <Button disabled>Mulai Ujian</Button>
                <p className="mt-1 text-xs text-muted-foreground">
                    Dimulai{" "}
                    {untilStart > 0
                        ? formatDuration(untilStart)
                        : "sebentar lagi"}{" "}
                    lagi
                </p>
            </div>
        );
    } else if (exam.status === "ongoing") {
        action = (
            <div className="text-right">
                <Button onClick={() => router.post(examStart.url(exam.id))}>
                    Mulai Ujian
                </Button>
                <p className="mt-1 text-xs text-muted-foreground">
                    Ditutup {formatDuration(untilEnd)} lagi
                </p>
            </div>
        );
    } else {
        action = <Badge variant="secondary">Tidak diikuti</Badge>;
    }

    return (
        <Card>
            <CardContent className="space-y-3 pt-5">
                <div className="flex items-start justify-between gap-3">
                    <div>
                        <h2 className="font-semibold">{exam.name}</h2>
                        <p className="text-sm text-muted-foreground">
                            {exam.subject} · {exam.class}
                        </p>
                        <p className="text-xs text-muted-foreground">
                            {exam.started_at_label} – {exam.ends_at_label} ·{" "}
                            {exam.duration_minutes} menit
                        </p>
                    </div>
                    <Badge variant={STATUS_VARIANT[exam.status]}>
                        {STATUS_LABELS[exam.status]}
                    </Badge>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <span className="text-xs text-muted-foreground">
                        {exam.questions_count} soal
                    </span>
                    {action}
                </div>
            </CardContent>
        </Card>
    );
}

StudentExams.layout = {
    breadcrumbs: [{ title: "Ujian Saya", href: studentExamsIndex() }],
};
