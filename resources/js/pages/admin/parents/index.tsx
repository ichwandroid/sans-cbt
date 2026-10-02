import { Head, router } from '@inertiajs/react';
import { useState, type FormEvent } from 'react';
import ParentProfileController from '@/actions/App/Http/Controllers/Admin/ParentProfileController';
import { AdminPagination } from '@/components/admin/admin-pagination';
import { DeleteConfirmationDialog } from '@/components/admin/delete-confirmation-dialog';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { dashboard } from '@/routes/admin';
import { index } from '@/routes/admin/parents';

type Option = { value: number; label: string };
type Parent = {
    id: number;
    user_id: number | null;
    full_name: string;
    phone: string | null;
    occupation: string | null;
    students: { id: number; relation: string | null }[];
    student_names: string[];
};
type Paginator<T> = {
    data: T[];
    current_page: number;
    last_page: number;
    total: number;
    from: number | null;
    to: number | null;
};
export default function AdminParentsIndex({
    parents,
    filters,
    students,
    users,
}: {
    parents: Paginator<Parent>;
    filters: { search: string };
    students: Option[];
    users: Option[];
}) {
    const [search, setSearch] = useState(filters.search);
    const [open, setOpen] = useState(false);
    const [selected, setSelected] = useState<Parent | null>(null);
    const [toDelete, setToDelete] = useState<Parent | null>(null);
    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        router.get(
            index().url,
            { search },
            { preserveState: true, preserveScroll: true, replace: true },
        );
    };
    const destroy = () => {
        if (toDelete)
            router.delete(ParentProfileController.destroy.url(toDelete.id), {
                preserveScroll: true,
                onSuccess: () => setToDelete(null),
            });
    };
    return (
        <>
            <Head title="Kelola Orang Tua" />
            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                    <Heading
                        title="Kelola Orang Tua"
                        description="Data orang tua dan siswa yang dipantau."
                    />
                    <Button
                        onClick={() => {
                            setSelected(null);
                            setOpen(true);
                        }}
                    >
                        Tambah Orang Tua
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
                                onChange={(event) =>
                                    setSearch(event.target.value)
                                }
                                placeholder="Cari nama atau telepon..."
                            />
                            <Button variant="outline">Cari</Button>
                        </form>
                    </CardHeader>
                    <CardContent className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b text-left text-xs uppercase">
                                    <th className="py-2 pr-4">Orang Tua</th>
                                    <th className="py-2 pr-4">Pekerjaan</th>
                                    <th className="py-2 pr-4">Siswa</th>
                                    <th className="py-2 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {parents.data.map((parent) => (
                                    <tr
                                        key={parent.id}
                                        className="border-b last:border-0"
                                    >
                                        <td className="py-3 pr-4 font-medium">
                                            {parent.full_name}
                                            <span className="block text-muted-foreground">
                                                {parent.phone ?? '-'}
                                            </span>
                                        </td>
                                        <td className="py-3 pr-4">
                                            {parent.occupation ?? '-'}
                                        </td>
                                        <td className="py-3 pr-4">
                                            {parent.student_names.join(', ') ||
                                                '-'}
                                        </td>
                                        <td className="py-3 text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => {
                                                        setSelected(parent);
                                                        setOpen(true);
                                                    }}
                                                >
                                                    Ubah
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="destructive"
                                                    onClick={() =>
                                                        setToDelete(parent)
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
                            paginator={parents}
                            itemLabel="orang tua"
                            onPageChange={(page) =>
                                router.get(
                                    index().url,
                                    { search, page },
                                    {
                                        preserveState: true,
                                        preserveScroll: true,
                                    },
                                )
                            }
                        />
                    </CardContent>
                </Card>
                <ParentDialog
                    open={open}
                    onOpenChange={setOpen}
                    parent={selected}
                    students={students}
                    users={users}
                />
                <DeleteConfirmationDialog
                    open={toDelete !== null}
                    onOpenChange={(value) => !value && setToDelete(null)}
                    itemName={toDelete?.full_name ?? null}
                    onConfirm={destroy}
                />
            </div>
        </>
    );
}
function ParentDialog({
    open,
    onOpenChange,
    parent,
    students,
    users,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    parent: Parent | null;
    students: Option[];
    users: Option[];
}) {
    const isEditing = parent !== null;
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
                <DialogHeader>
                    <DialogTitle>
                        {isEditing ? 'Ubah Orang Tua' : 'Tambah Orang Tua'}
                    </DialogTitle>
                    <DialogDescription>
                        Tambahkan siswa serta jenis hubungan keluarga.
                    </DialogDescription>
                </DialogHeader>
                <form
                    onSubmit={(event) => {
                        event.preventDefault();
                        const form = new FormData(event.currentTarget);
                        const selections = form
                            .getAll('student_ids')
                            .map((id) => ({
                                id: Number(id),
                                relation: form.get(`relation_${id}`),
                            }));
                        const data = {
                            full_name: form.get('full_name'),
                            phone: form.get('phone'),
                            occupation: form.get('occupation'),
                            user_id: form.get('user_id'),
                            students: selections,
                        };
                        router[isEditing ? 'patch' : 'post'](
                            isEditing
                                ? ParentProfileController.update.url(parent.id)
                                : ParentProfileController.store.url(),
                            data,
                            {
                                preserveScroll: true,
                                onSuccess: () => onOpenChange(false),
                            },
                        );
                    }}
                    className="space-y-4"
                >
                    <Field
                        label="Nama lengkap"
                        name="full_name"
                        required
                        value={parent?.full_name ?? ''}
                    />
                    <Field
                        label="Telepon"
                        name="phone"
                        value={parent?.phone ?? ''}
                    />
                    <Field
                        label="Pekerjaan"
                        name="occupation"
                        value={parent?.occupation ?? ''}
                    />
                    <div className="grid gap-2">
                        <Label>Akun Orang Tua</Label>
                        <select
                            name="user_id"
                            defaultValue={parent?.user_id ?? ''}
                            className="h-9 rounded-md border border-input bg-transparent px-3 text-sm"
                        >
                            <option value="">Belum dihubungkan</option>
                            {users.map((user) => (
                                <option key={user.value} value={user.value}>
                                    {user.label}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="grid gap-2">
                        <Label>Siswa yang dipantau</Label>
                        {students.map((student) => {
                            const relation =
                                parent?.students.find(
                                    (item) => item.id === student.value,
                                )?.relation ?? '';
                            return (
                                <div
                                    key={student.value}
                                    className="flex items-center gap-2"
                                >
                                    <input
                                        type="checkbox"
                                        name="student_ids"
                                        value={student.value}
                                        defaultChecked={parent?.students.some(
                                            (item) => item.id === student.value,
                                        )}
                                    />
                                    <span className="flex-1 text-sm">
                                        {student.label}
                                    </span>
                                    <Input
                                        name={`relation_${student.value}`}
                                        defaultValue={relation}
                                        placeholder="cth: Ayah"
                                        className="w-28"
                                    />
                                </div>
                            );
                        })}
                    </div>
                    <div className="flex justify-end gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                        >
                            Batal
                        </Button>
                        <Button>Simpan</Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
function Field({
    label,
    name,
    required = false,
    value,
}: {
    label: string;
    name: string;
    required?: boolean;
    value: string;
}) {
    return (
        <div className="grid gap-2">
            <Label htmlFor={name}>{label}</Label>
            <Input
                id={name}
                name={name}
                required={required}
                defaultValue={value}
            />
        </div>
    );
}
AdminParentsIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard Admin', href: dashboard() },
        { title: 'Kelola Orang Tua', href: index() },
    ],
};
