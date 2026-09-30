import { Head } from '@inertiajs/react';
import { BookOpen } from 'lucide-react';
import { ModulePlaceholder } from '@/components/module-placeholder';
import { dashboard } from '@/routes/admin';
import { index as subjectsIndex } from '@/routes/admin/subjects';

export default function AdminSubjectsIndex() {
    return (
        <>
            <Head title="Kelola Mata Pelajaran" />

            <ModulePlaceholder
                icon={BookOpen}
                title="Kelola Mata Pelajaran"
                description="Kelola daftar mata pelajaran dan pengampu di sekolah."
                plannedItems={[
                    'Data mata pelajaran',
                    'Guru pengampu',
                    'Kelas yang mengambil',
                    'Relasinya ke bank soal',
                ]}
            />
        </>
    );
}

AdminSubjectsIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard Admin', href: dashboard() },
        { title: 'Kelola Mata Pelajaran', href: subjectsIndex() },
    ],
};
