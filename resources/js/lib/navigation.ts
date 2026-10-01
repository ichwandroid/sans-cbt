import {
    BookOpen,
    ClipboardList,
    GraduationCap,
    LayoutGrid,
    LineChart,
    ScrollText,
    UserCog,
    Users,
} from 'lucide-react';
import { dashboard } from '@/routes';
import { dashboard as adminDashboard } from '@/routes/admin';
import { index as auditLogsIndex } from '@/routes/admin/audit-logs';
import { index as classesIndex } from '@/routes/admin/classes';
import { index as examMonitoringIndex } from '@/routes/admin/exam-monitoring';
import { index as reportsIndex } from '@/routes/admin/reports';
import { index as parentsIndex } from '@/routes/admin/parents';
import { index as subjectsIndex } from '@/routes/admin/subjects';
import { index as questionsIndex } from '@/routes/admin/questions';
import { index as studentsIndex } from '@/routes/admin/students';
import { index as teachersIndex } from '@/routes/admin/teachers';
import { index as usersIndex } from '@/routes/admin/users';
import type { NavItem, RoleSlug } from '@/types';

export type NavGroup = {
    label: string;
    items: NavItem[];
};

const defaultNavGroups: NavGroup[] = [
    {
        label: 'Platform',
        items: [
            {
                title: 'Dashboard',
                href: dashboard(),
                icon: LayoutGrid,
            },
        ],
    },
];

const adminNavGroups: NavGroup[] = [
    {
        label: 'Menu Utama',
        items: [
            {
                title: 'Dashboard',
                href: adminDashboard(),
                icon: LayoutGrid,
            },
            {
                title: 'Kelola Pengguna',
                href: usersIndex(),
                icon: UserCog,
            },
            {
                title: 'Siswa',
                href: studentsIndex(),
                icon: Users,
            },
            {
                title: 'Guru',
                href: teachersIndex(),
                icon: Users,
            },
            {
                title: 'Orang Tua',
                href: parentsIndex(),
                icon: Users,
            },
        ],
    },
    {
        label: 'Akademik',
        items: [
            {
                title: 'Mata Pelajaran',
                href: subjectsIndex(),
                icon: BookOpen,
            },
            {
                title: 'Bank Soal',
                href: questionsIndex(),
                icon: ClipboardList,
            },
            {
                title: 'Kelas',
                href: classesIndex(),
                icon: GraduationCap,
            },
            {
                title: 'Monitoring Ujian',
                href: examMonitoringIndex(),
                icon: ClipboardList,
            },
        ],
    },
    {
        label: 'Laporan',
        items: [
            {
                title: 'Hasil & Laporan',
                href: reportsIndex(),
                icon: LineChart,
            },
            {
                title: 'Audit Log',
                href: auditLogsIndex(),
                icon: ScrollText,
            },
        ],
    },
];

/**
 * Get the sidebar navigation groups for the given role.
 */
export function navGroupsFor(role: RoleSlug | null | undefined): NavGroup[] {
    return role === 'admin' ? adminNavGroups : defaultNavGroups;
}

/**
 * Get the landing page for the given role.
 */
export function homeFor(role: RoleSlug | null | undefined): NavItem['href'] {
    return role === 'admin' ? adminDashboard() : dashboard();
}
