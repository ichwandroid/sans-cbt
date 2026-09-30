import { Head } from '@inertiajs/react';
import { ClipboardList } from 'lucide-react';
import { ModulePlaceholder } from '@/components/module-placeholder';
import { dashboard } from '@/routes/admin';
import { index as examMonitoringIndex } from '@/routes/admin/exam-monitoring';

export default function AdminExamMonitoringIndex() {
    return (
        <>
            <Head title="Monitoring Ujian" />

            <ModulePlaceholder
                icon={ClipboardList}
                title="Monitoring Ujian"
                description="Pantau sesi ujian yang sedang berlangsung secara langsung."
                plannedItems={[
                    'Sesi ujian aktif',
                    'Progres peserta',
                    'Peringatan pelanggaran',
                    'Aksi menghentikan sesi',
                ]}
            />
        </>
    );
}

AdminExamMonitoringIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard Admin', href: dashboard() },
        { title: 'Monitoring Ujian', href: examMonitoringIndex() },
    ],
};
