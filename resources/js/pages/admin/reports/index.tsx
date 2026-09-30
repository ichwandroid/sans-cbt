import { Head } from '@inertiajs/react';
import { LineChart } from 'lucide-react';
import { ModulePlaceholder } from '@/components/module-placeholder';
import { dashboard } from '@/routes/admin';
import { index as reportsIndex } from '@/routes/admin/reports';

export default function AdminReportsIndex() {
    return (
        <>
            <Head title="Hasil & Laporan" />

            <ModulePlaceholder
                icon={LineChart}
                title="Hasil & Laporan"
                description="Rekap nilai dan laporan hasil ujian sekolah."
                plannedItems={[
                    'Rekap nilai per kelas',
                    'Rekap nilai per mata pelajaran',
                    'Analisis butir soal',
                    'Ekspor laporan',
                ]}
            />
        </>
    );
}

AdminReportsIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard Admin', href: dashboard() },
        { title: 'Hasil & Laporan', href: reportsIndex() },
    ],
};
