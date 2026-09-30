import { Head } from '@inertiajs/react';
import { ScrollText } from 'lucide-react';
import { ModulePlaceholder } from '@/components/module-placeholder';
import { dashboard } from '@/routes/admin';
import { index as auditLogsIndex } from '@/routes/admin/audit-logs';

export default function AdminAuditLogsIndex() {
    return (
        <>
            <Head title="Audit Log" />

            <ModulePlaceholder
                icon={ScrollText}
                title="Audit Log"
                description="Jejak aktivitas penting pada sistem CBT, termasuk pelanggaran ujian."
                plannedItems={[
                    'Log login dan logout',
                    'Mulai dan submit ujian',
                    'Penyimpanan jawaban',
                    'Pindah aplikasi & keluar fullscreen',
                ]}
            />
        </>
    );
}

AdminAuditLogsIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard Admin', href: dashboard() },
        { title: 'Audit Log', href: auditLogsIndex() },
    ],
};
