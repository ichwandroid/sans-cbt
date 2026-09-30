import { Head, Link, usePage } from '@inertiajs/react';
import {
    ArrowRight,
    Bell,
    BookOpen,
    CalendarClock,
    CheckCircle2,
    ClipboardList,
    FileText,
    GraduationCap,
    LineChart,
    Lock,
    Maximize,
    MonitorSmartphone,
    ScrollText,
    ServerCog,
    ShieldCheck,
    Timer,
    UserCog,
    Users,
} from 'lucide-react';
import AppLogoIcon from '@/components/app-logo-icon';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { dashboard, home, login } from '@/routes';

const navLinks = [
    { href: '#fitur', label: 'Fitur' },
    { href: '#peran', label: 'Peran' },
    { href: '#keamanan', label: 'Keamanan' },
    { href: '#alur', label: 'Alur' },
];

const features = [
    {
        icon: ClipboardList,
        title: 'Daftar Ujian',
        description:
            'Jadwal ujian hari ini lengkap dengan mata pelajaran, kelas, guru, durasi, dan status ujian.',
    },
    {
        icon: Timer,
        title: 'Kerjakan Ujian',
        description:
            'Antarmuka pengerjaan sederhana dengan navigasi nomor soal, penanda tinjauan, dan penyimpanan jawaban otomatis.',
    },
    {
        icon: ShieldCheck,
        title: 'Anti-Kecurangan',
        description:
            'Deteksi perpindahan aplikasi, kunci layar ujian, pengacakan soal & jawaban, serta pencatatan pelanggaran.',
    },
    {
        icon: CheckCircle2,
        title: 'Nilai Otomatis',
        description:
            'Jawaban dikoreksi otomatis setelah submit, lengkap dengan rincian per soal, bobot nilai, dan riwayat nilai siswa.',
    },
    {
        icon: FileText,
        title: 'Buat Soal',
        description:
            'Bank soal terstruktur dengan kunci jawaban, bobot, kategori, tingkat kesulitan, serta dukungan gambar pada soal.',
    },
    {
        icon: CalendarClock,
        title: 'Kelola Ujian',
        description:
            'Susun jadwal, pilih soal dari bank soal, atur pengacakan, dan tentukan peserta berdasarkan kelas atau kelompok.',
    },
    {
        icon: LineChart,
        title: 'Pantau Nilai Anak',
        description:
            'Orang tua memantau nilai terbaru dan grafik perkembangan anak per mata pelajaran dengan mudah.',
    },
    {
        icon: Lock,
        title: 'Masuk & Akun',
        description:
            'Satu sistem autentikasi dengan peran terpisah untuk Admin, Guru, Siswa, dan Orang Tua beserta hak aksesnya.',
    },
];

const roles = [
    {
        icon: ServerCog,
        name: 'Admin',
        description:
            'Mengelola pengguna, kelas, mata pelajaran, ujian, hasil, dan meninjau audit log sistem.',
    },
    {
        icon: GraduationCap,
        name: 'Guru',
        description:
            'Membuat bank soal, menjadwalkan ujian, memantau peserta, dan melihat hasil ujian.',
    },
    {
        icon: UserCog,
        name: 'Siswa',
        description:
            'Melihat daftar ujian, mengerjakan ujian, dan melihat hasil sesuai kebijakan ujian.',
    },
    {
        icon: Users,
        name: 'Orang Tua',
        description:
            'Memantau nilai anak, melihat grafik perkembangan, dan menerima notifikasi hasil ujian.',
    },
];

const securityItems = [
    { icon: ServerCog, label: 'Timer berbasis waktu server' },
    { icon: MonitorSmartphone, label: 'Device & session binding' },
    { icon: ScrollText, label: 'Audit log setiap aktivitas' },
    { icon: Maximize, label: 'Fullscreen & kiosk mode' },
    { icon: ShieldCheck, label: 'Tingkat pelanggaran terukur' },
    { icon: Bell, label: 'Peringatan koneksi real-time' },
];

const steps = [
    'Masuk dengan akun sekolah',
    'Pilih ujian pada daftar hari ini',
    'Kerjakan soal dengan timer server',
    'Submit, lalu nilai dihitung otomatis',
];

const stats = [
    { value: '8', label: 'Modul inti CBT' },
    { value: '4', label: 'Peran pengguna' },
    { value: '100%', label: 'Timer di sisi server' },
    { value: '100+', label: 'Soal di bank soal' },
];

export default function Welcome() {
    const { auth, name } = usePage().props;

    return (
        <>
            <Head title="Beranda" />

            <div className="min-h-screen bg-background text-foreground">
                <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-md">
                    <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
                        <Link href={home()} className="flex items-center gap-3">
                            <span className="flex size-9 items-center justify-center rounded-lg bg-brand-600 text-white shadow-sm">
                                <AppLogoIcon className="size-5 fill-current" />
                            </span>
                            <span className="grid leading-tight">
                                <span className="text-sm font-semibold">
                                    {name}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                    Computer Based Test
                                </span>
                            </span>
                        </Link>

                        <nav className="hidden items-center gap-8 text-sm font-medium text-muted-foreground md:flex">
                            {navLinks.map((link) => (
                                <a
                                    key={link.href}
                                    href={link.href}
                                    className="transition-colors hover:text-foreground"
                                >
                                    {link.label}
                                </a>
                            ))}
                        </nav>

                        <div className="flex items-center gap-2">
                            {auth.user ? (
                                <Button
                                    asChild
                                    size="sm"
                                    className="bg-brand-600 text-white hover:bg-brand-700"
                                >
                                    <Link href={dashboard()}>Dashboard</Link>
                                </Button>
                            ) : (
                                <>
                                    <Button
                                        asChild
                                        variant="ghost"
                                        size="sm"
                                        className="hidden sm:inline-flex"
                                    >
                                        <a href="#fitur">Pelajari</a>
                                    </Button>
                                    <Button
                                        asChild
                                        size="sm"
                                        className="bg-brand-600 text-white hover:bg-brand-700"
                                    >
                                        <Link href={login()}>Masuk</Link>
                                    </Button>
                                </>
                            )}
                        </div>
                    </div>
                </header>

                <section className="relative overflow-hidden border-b border-border/60">
                    <div className="absolute inset-0 -z-10 bg-linear-to-b from-brand-50 via-background to-background dark:from-brand-950/30" />
                    <div className="mx-auto grid w-full max-w-6xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:px-8 lg:py-24">
                        <div className="flex flex-col items-start gap-6">
                            <span className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700 dark:border-brand-800 dark:bg-brand-950/40 dark:text-brand-300">
                                <ShieldCheck className="size-3.5" />
                                Ujian berbasis komputer yang aman &amp;
                                terpercaya
                            </span>
                            <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
                                Ujian sekolah jadi{' '}
                                <span className="text-brand-600 dark:text-brand-400">
                                    lebih mudah
                                </span>{' '}
                                dan bebas kecurangan
                            </h1>
                            <p className="max-w-xl text-lg text-muted-foreground">
                                {name} membantu siswa mengerjakan ujian dengan
                                tenang, guru mengelola bank soal dan jadwal,
                                serta orang tua memantau nilai anak dalam satu
                                sistem.
                            </p>
                            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
                                <Button
                                    asChild
                                    size="lg"
                                    className="bg-brand-600 text-white hover:bg-brand-700"
                                >
                                    <Link href={login()}>
                                        Masuk ke CBT
                                        <ArrowRight className="size-4" />
                                    </Link>
                                </Button>
                                <Button asChild size="lg" variant="outline">
                                    <a href="#fitur">
                                        <BookOpen className="size-4" />
                                        Lihat Fitur
                                    </a>
                                </Button>
                            </div>
                            <ul className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
                                {[
                                    'Timer server-side',
                                    'Autosave jawaban',
                                    'Nilai otomatis',
                                ].map((item) => (
                                    <li
                                        key={item}
                                        className="flex items-center gap-2"
                                    >
                                        <CheckCircle2 className="size-4 text-brand-600 dark:text-brand-400" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="mx-auto w-full max-w-md">
                            <div className="rounded-2xl border border-border bg-card p-4 shadow-xl shadow-brand-900/5">
                                <div className="flex items-center justify-between rounded-lg bg-brand-600 px-4 py-2.5 text-white">
                                    <span className="text-[11px] font-semibold tracking-wide">
                                        CBT SEKOLAH ANAK SALEH
                                    </span>
                                    <span className="inline-flex items-center gap-1.5 rounded-md bg-white/15 px-2 py-1 text-xs font-semibold tabular-nums">
                                        <Timer className="size-3.5" />
                                        48:32
                                    </span>
                                </div>
                                <div className="px-1 pt-4">
                                    <p className="text-xs font-medium text-muted-foreground">
                                        Soal 12 dari 40
                                    </p>
                                    <p className="mt-2 text-sm font-medium">
                                        12. Ibu kota Provinsi Jawa Timur adalah
                                        ...
                                    </p>
                                    <div className="mt-4 grid gap-2">
                                        {[
                                            'Surabaya',
                                            'Malang',
                                            'Kediri',
                                            'Madiun',
                                        ].map((option, index) => (
                                            <div
                                                key={option}
                                                className={cn(
                                                    'flex items-center gap-3 rounded-lg border px-3 py-2.5 text-sm',
                                                    index === 0
                                                        ? 'border-brand-500 bg-brand-50 text-brand-900 dark:border-brand-700 dark:bg-brand-950/40 dark:text-brand-100'
                                                        : 'border-border',
                                                )}
                                            >
                                                <span
                                                    className={cn(
                                                        'flex size-5 items-center justify-center rounded-full border text-[10px] font-semibold',
                                                        index === 0
                                                            ? 'border-brand-500 bg-brand-600 text-white'
                                                            : 'border-muted-foreground/40',
                                                    )}
                                                >
                                                    {String.fromCharCode(
                                                        65 + index,
                                                    )}
                                                </span>
                                                {option}
                                            </div>
                                        ))}
                                    </div>
                                    <div className="mt-4 grid grid-cols-8 gap-1.5">
                                        {Array.from(
                                            { length: 16 },
                                            (_, i) => i + 1,
                                        ).map((number) => (
                                            <span
                                                key={number}
                                                className={cn(
                                                    'flex aspect-square items-center justify-center rounded-md border text-[11px] font-medium tabular-nums',
                                                    number === 12
                                                        ? 'border-brand-500 bg-brand-600 text-white'
                                                        : number < 12
                                                          ? 'border-brand-200 bg-brand-50 text-brand-700 dark:border-brand-900 dark:bg-brand-950/40 dark:text-brand-300'
                                                          : 'border-border text-muted-foreground',
                                                )}
                                            >
                                                {number}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="border-b border-border/60 bg-muted/40">
                    <div className="mx-auto grid w-full max-w-6xl grid-cols-2 gap-6 px-4 py-10 sm:px-6 lg:grid-cols-4 lg:px-8">
                        {stats.map((stat) => (
                            <div key={stat.label} className="text-center">
                                <p className="text-3xl font-semibold text-brand-600 dark:text-brand-400">
                                    {stat.value}
                                </p>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    {stat.label}
                                </p>
                            </div>
                        ))}
                    </div>
                </section>

                <section id="fitur" className="scroll-mt-20 py-20">
                    <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
                        <div className="mx-auto max-w-2xl text-center">
                            <span className="text-sm font-semibold text-brand-600 dark:text-brand-400">
                                Fitur Utama
                            </span>
                            <h2 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
                                Semua yang dibutuhkan untuk ujian sekolah
                            </h2>
                            <p className="mt-4 text-muted-foreground">
                                Delapan modul inti yang saling terintegrasi,
                                mulai dari penyusunan soal hingga pemantauan
                                nilai.
                            </p>
                        </div>

                        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                            {features.map((feature) => (
                                <div
                                    key={feature.title}
                                    className="rounded-2xl border border-border bg-card p-6 transition-shadow hover:shadow-md"
                                >
                                    <span className="flex size-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-950/50 dark:text-brand-400">
                                        <feature.icon className="size-5" />
                                    </span>
                                    <h3 className="mt-4 font-semibold">
                                        {feature.title}
                                    </h3>
                                    <p className="mt-2 text-sm text-muted-foreground">
                                        {feature.description}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                <section
                    id="peran"
                    className="scroll-mt-20 border-y border-border/60 bg-muted/40 py-20"
                >
                    <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
                        <div className="mx-auto max-w-2xl text-center">
                            <span className="text-sm font-semibold text-brand-600 dark:text-brand-400">
                                Peran Pengguna
                            </span>
                            <h2 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
                                Setiap peran punya ruang kerjanya
                            </h2>
                            <p className="mt-4 text-muted-foreground">
                                Hak akses dipisah dengan jelas agar setiap
                                pengguna hanya melihat yang dibutuhkannya.
                            </p>
                        </div>

                        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                            {roles.map((role) => (
                                <div
                                    key={role.name}
                                    className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-6"
                                >
                                    <span className="flex size-11 items-center justify-center rounded-xl bg-brand-600 text-white">
                                        <role.icon className="size-5" />
                                    </span>
                                    <div>
                                        <h3 className="font-semibold">
                                            {role.name}
                                        </h3>
                                        <p className="mt-2 text-sm text-muted-foreground">
                                            {role.description}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                <section id="keamanan" className="scroll-mt-20 py-20">
                    <div className="mx-auto grid w-full max-w-6xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
                        <div>
                            <span className="text-sm font-semibold text-brand-600 dark:text-brand-400">
                                Keamanan &amp; Anti-Kecurangan
                            </span>
                            <h2 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
                                Frontend tidak dipercaya sebagai sumber
                                kebenaran
                            </h2>
                            <p className="mt-4 text-muted-foreground">
                                Waktu mulai, waktu selesai, status ujian,
                                jawaban, dan nilai seluruhnya divalidasi di sisi
                                server Laravel. Client hanya menampilkan.
                            </p>
                            <p className="mt-4 text-sm text-muted-foreground">
                                Sistem ini berfokus pada pencegahan, deteksi,
                                pencatatan, dan pengendalian sesi ujian.
                            </p>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            {securityItems.map((item) => (
                                <div
                                    key={item.label}
                                    className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3.5"
                                >
                                    <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-950/50 dark:text-brand-400">
                                        <item.icon className="size-4" />
                                    </span>
                                    <span className="text-sm font-medium">
                                        {item.label}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                <section
                    id="alur"
                    className="scroll-mt-20 border-y border-border/60 bg-muted/40 py-20"
                >
                    <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
                        <div className="mx-auto max-w-2xl text-center">
                            <span className="text-sm font-semibold text-brand-600 dark:text-brand-400">
                                Alur Siswa
                            </span>
                            <h2 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
                                Empat langkah dari masuk sampai nilai keluar
                            </h2>
                        </div>

                        <ol className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                            {steps.map((step, index) => (
                                <li
                                    key={step}
                                    className="rounded-2xl border border-border bg-card p-6"
                                >
                                    <span className="flex size-9 items-center justify-center rounded-full bg-brand-600 text-sm font-semibold text-white">
                                        {index + 1}
                                    </span>
                                    <p className="mt-4 text-sm font-medium">
                                        {step}
                                    </p>
                                </li>
                            ))}
                        </ol>
                    </div>
                </section>

                <section className="py-20">
                    <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
                        <div className="relative overflow-hidden rounded-3xl bg-brand-700 px-8 py-14 text-center text-white sm:px-16">
                            <div className="absolute -top-20 -right-10 size-64 rounded-full bg-brand-500/40 blur-3xl" />
                            <div className="absolute -bottom-24 -left-10 size-64 rounded-full bg-brand-400/30 blur-3xl" />
                            <div className="relative">
                                <h2 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
                                    Siap memulai ujian berbasis komputer?
                                </h2>
                                <p className="mx-auto mt-4 max-w-xl text-white/80">
                                    Masuk dengan akun sekolah Anda untuk melihat
                                    jadwal ujian, mengerjakan soal, atau
                                    memantau nilai.
                                </p>
                                <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                                    <Button
                                        asChild
                                        size="lg"
                                        className="bg-white text-brand-700 hover:bg-white/90"
                                    >
                                        <Link href={login()}>
                                            Masuk ke CBT
                                            <ArrowRight className="size-4" />
                                        </Link>
                                    </Button>
                                    <Button
                                        asChild
                                        size="lg"
                                        variant="outline"
                                        className="border-white/40 bg-transparent text-white hover:bg-white/10 hover:text-white"
                                    >
                                        <a href="#fitur">Pelajari Fitur</a>
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <footer className="border-t border-border/60 py-10">
                    <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-4 px-4 text-sm text-muted-foreground sm:flex-row sm:px-6 lg:px-8">
                        <div className="flex items-center gap-3">
                            <span className="flex size-8 items-center justify-center rounded-lg bg-brand-600 text-white">
                                <AppLogoIcon className="size-4 fill-current" />
                            </span>
                            <span className="font-medium text-foreground">
                                {name}
                            </span>
                        </div>
                        <p>
                            &copy; {new Date().getFullYear()} {name}. Seluruh
                            hak cipta dilindungi.
                        </p>
                    </div>
                </footer>
            </div>
        </>
    );
}
