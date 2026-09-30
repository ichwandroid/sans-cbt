import { Head } from '@inertiajs/react';
import { GraduationCap } from 'lucide-react';
import { ModulePlaceholder } from '@/components/module-placeholder';
import { dashboard } from '@/routes/admin';
import { index as classesIndex } from '@/routes/admin/classes';

export default function AdminClassesIndex() {
    return (
        <>
            <Head title="Kelola Kelas" />

            <ModulePlaceholder
                icon={GraduationCap}
                title="Kelola Kelas"
                description="Atur kelas dan rombongan belajar beserta daftar siswanya."
                plannedItems={[
                    'Data kelas dan tingkat',
                    'Rombongan belajar (rombel)',
                    'Daftar siswa per kelas',
                    'Wali kelas',
                ]}
            />
        </>
    );
}

AdminClassesIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard Admin', href: dashboard() },
        { title: 'Kelola Kelas', href: classesIndex() },
    ],
};
