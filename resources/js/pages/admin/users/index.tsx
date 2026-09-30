import { Head, router } from '@inertiajs/react';
import type { FormEvent } from 'react';
import { useState } from 'react';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { dashboard } from '@/routes/admin';
import { index as usersIndex } from '@/routes/admin/users';

type AdminUser = {
    id: number;
    name: string;
    email: string;
    role: string | null;
    role_label: string;
    email_verified_at: string | null;
    created_at: string | null;
};

type Paginator<T> = {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
};

type Props = {
    users: Paginator<AdminUser>;
    filters: {
        search: string;
    };
};

export default function AdminUsersIndex({ users, filters }: Props) {
    const [search, setSearch] = useState(filters.search);

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        router.get(
            usersIndex().url,
            { search },
            { preserveState: true, preserveScroll: true, replace: true },
        );
    };

    const goToPage = (page: number) => {
        router.get(
            usersIndex().url,
            { search, page },
            { preserveState: true, preserveScroll: true },
        );
    };

    return (
        <>
            <Head title="Kelola Pengguna" />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <Heading
                    title="Kelola Pengguna"
                    description="Daftar akun Admin, Guru, Siswa, dan Orang Tua."
                />

                <Card>
                    <CardHeader>
                        <form
                            onSubmit={submit}
                            className="flex w-full max-w-md items-center gap-2"
                        >
                            <Input
                                type="search"
                                name="search"
                                value={search}
                                onChange={(event) =>
                                    setSearch(event.target.value)
                                }
                                placeholder="Cari nama atau email..."
                            />
                            <Button type="submit" variant="outline">
                                Cari
                            </Button>
                        </form>
                    </CardHeader>

                    <CardContent className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-border text-left text-xs text-muted-foreground uppercase">
                                    <th className="py-2 pr-4 font-medium">
                                        Nama
                                    </th>
                                    <th className="py-2 pr-4 font-medium">
                                        Email
                                    </th>
                                    <th className="py-2 pr-4 font-medium">
                                        Peran
                                    </th>
                                    <th className="py-2 pr-4 font-medium">
                                        Status
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.data.map((user) => (
                                    <tr
                                        key={user.id}
                                        className="border-b border-border/60 last:border-0"
                                    >
                                        <td className="py-3 pr-4 font-medium">
                                            {user.name}
                                        </td>
                                        <td className="py-3 pr-4 text-muted-foreground">
                                            {user.email}
                                        </td>
                                        <td className="py-3 pr-4">
                                            <span className="rounded-md border border-border px-2 py-0.5 text-xs">
                                                {user.role_label}
                                            </span>
                                        </td>
                                        <td className="py-3 pr-4 text-muted-foreground">
                                            {user.email_verified_at
                                                ? 'Terverifikasi'
                                                : 'Belum verifikasi'}
                                        </td>
                                    </tr>
                                ))}

                                {users.data.length === 0 && (
                                    <tr>
                                        <td
                                            colSpan={4}
                                            className="py-8 text-center text-muted-foreground"
                                        >
                                            Tidak ada pengguna yang cocok dengan
                                            pencarian.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>

                        <div className="mt-4 flex flex-col items-center justify-between gap-3 sm:flex-row">
                            <p className="text-xs text-muted-foreground">
                                {users.total > 0
                                    ? `Menampilkan ${users.from}–${users.to} dari ${users.total} pengguna`
                                    : 'Tidak ada data'}
                            </p>

                            <div className="flex items-center gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    disabled={users.current_page <= 1}
                                    onClick={() =>
                                        goToPage(users.current_page - 1)
                                    }
                                >
                                    Sebelumnya
                                </Button>
                                <span className="text-xs text-muted-foreground">
                                    Halaman {users.current_page} dari{' '}
                                    {users.last_page}
                                </span>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    disabled={
                                        users.current_page >= users.last_page
                                    }
                                    onClick={() =>
                                        goToPage(users.current_page + 1)
                                    }
                                >
                                    Berikutnya
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

AdminUsersIndex.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard Admin',
            href: dashboard(),
        },
        {
            title: 'Kelola Pengguna',
            href: usersIndex(),
        },
    ],
};
