import { Head, Link, router } from '@inertiajs/react';
import { useState, type FormEvent } from 'react';
import SchoolClassController from '@/actions/App/Http/Controllers/Admin/SchoolClassController';
import { AdminPagination } from '@/components/admin/admin-pagination';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { dashboard } from '@/routes/admin';
import {
    create as classesCreate,
    edit as classesEdit,
    index as classesIndex,
} from '@/routes/admin/classes';

type AdminSchoolClass = {
    id: number;
    name: string;
    level: string | null;
    academic_year: string;
    homeroom_teacher: string | null;
    students_count: number;
};

type Paginator<T> = {
    data: T[];
    current_page: number;
    last_page: number;
    total: number;
    from: number | null;
    to: number | null;
};

export default function AdminClassesIndex({
    classes,
    filters,
}: {
    classes: Paginator<AdminSchoolClass>;
    filters: { search: string };
}) {
    const [search, setSearch] = useState(filters.search);

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        router.get(
            classesIndex().url,
            { search },
            { preserveState: true, preserveScroll: true, replace: true },
        );
    };

    const goToPage = (page: number) => {
        router.get(
            classesIndex().url,
            { search, page },
            { preserveState: true, preserveScroll: true },
        );
    };

    const destroy = (schoolClass: AdminSchoolClass) => {
        if (!window.confirm(`Hapus kelas "${schoolClass.name}"?`)) {
            return;
        }

        router.delete(SchoolClassController.destroy.url(schoolClass.id), {
            preserveScroll: true,
        });
    };

    return (
        <>
            <Head title="Kelola Kelas" />
            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                    <Heading
                        title="Kelola Kelas"
                        description="Daftar rombel untuk peserta ujian."
                    />
                    <Button asChild>
                        <Link href={classesCreate().url}>Tambah</Link>
                    </Button>
                </div>
                <Card>
                    <CardHeader>
                        <form
                            onSubmit={submit}
                            className="flex w-full max-w-md gap-2"
                        >
                            <Input
                                type="search"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Cari nama atau tahun ajaran..."
                            />
                            <Button type="submit" variant="outline">
                                Cari
                            </Button>
                        </form>
                    </CardHeader>
                    <CardContent className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b text-left text-xs uppercase">
                                    <th className="py-2 pr-4 font-medium">
                                        Kelas
                                    </th>
                                    <th className="py-2 pr-4 font-medium">
                                        Tahun Ajaran
                                    </th>
                                    <th className="py-2 pr-4 font-medium">
                                        Wali Kelas
                                    </th>
                                    <th className="py-2 text-right font-medium">
                                        Aksi
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {classes.data.map((item) => (
                                    <tr
                                        key={item.id}
                                        className="border-b last:border-0"
                                    >
                                        <td className="py-3 pr-4 font-medium">
                                            {item.name}
                                        </td>
                                        <td className="py-3 pr-4">
                                            {item.academic_year}
                                        </td>
                                        <td className="py-3 pr-4">
                                            {item.homeroom_teacher ?? '-'}
                                        </td>
                                        <td className="py-3 text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    asChild
                                                >
                                                    <Link
                                                        href={
                                                            classesEdit(item.id)
                                                                .url
                                                        }
                                                    >
                                                        Ubah
                                                    </Link>
                                                </Button>
                                                <Button
                                                    variant="destructive"
                                                    size="sm"
                                                    onClick={() =>
                                                        destroy(item)
                                                    }
                                                >
                                                    Hapus
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <AdminPagination
                            paginator={classes}
                            itemLabel="kelas"
                            onPageChange={goToPage}
                        />
                    </CardContent>
                </Card>
            </div>
        </>
    );
}


AdminClassesIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard Admin', href: dashboard() },
        { title: 'Kelola Kelas', href: classesIndex() },
    ],
};
