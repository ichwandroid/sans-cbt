import { Head } from "@inertiajs/react";
import Heading from "@/components/heading";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { index as studentResultsIndex } from "@/routes/student/results";

type Row = {
    id: number;
    exam_name: string;
    subject: string;
    submitted_at_label: string;
    status: string;
    score: number | null;
    has_essay_pending: boolean;
};

const STATUS_LABELS: Record<string, string> = {
    submitted: "Dikumpulkan",
    expired: "Waktu Habis",
};

export default function StudentResults({ results }: { results: Row[] }) {
    return (
        <>
            <Head title="Riwayat Nilai" />
            <div className="flex h-full flex-1 flex-col gap-5 p-4">
                <Heading
                    title="Riwayat Nilai"
                    description="Rekap ujian yang sudah kamu kerjakan."
                />

                <Card>
                    <CardContent className="overflow-x-auto pt-6">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b text-left text-xs uppercase">
                                    <th className="py-2 pr-4 font-medium">
                                        Ujian
                                    </th>
                                    <th className="py-2 pr-4 font-medium">
                                        Mapel
                                    </th>
                                    <th className="py-2 pr-4 font-medium">
                                        Waktu
                                    </th>
                                    <th className="py-2 pr-4 font-medium">
                                        Status
                                    </th>
                                    <th className="py-2 text-right font-medium">
                                        Nilai
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {results.map((row) => (
                                    <tr
                                        key={row.id}
                                        className="border-b last:border-0"
                                    >
                                        <td className="py-3 pr-4 font-medium">
                                            {row.exam_name}
                                        </td>
                                        <td className="py-3 pr-4">
                                            {row.subject}
                                        </td>
                                        <td className="py-3 pr-4">
                                            {row.submitted_at_label}
                                        </td>
                                        <td className="py-3 pr-4">
                                            <Badge variant="secondary">
                                                {STATUS_LABELS[row.status] ??
                                                    row.status}
                                            </Badge>
                                        </td>
                                        <td className="py-3 text-right font-semibold">
                                            {row.has_essay_pending
                                                ? "Menunggu esai"
                                                : row.score !== null
                                                  ? row.score
                                                  : "Belum diumumkan"}
                                        </td>
                                    </tr>
                                ))}
                                {results.length === 0 && (
                                    <tr>
                                        <td
                                            colSpan={5}
                                            className="py-4 text-center text-muted-foreground"
                                        >
                                            Belum ada riwayat ujian.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

StudentResults.layout = {
    breadcrumbs: [{ title: "Riwayat Nilai", href: studentResultsIndex() }],
};
