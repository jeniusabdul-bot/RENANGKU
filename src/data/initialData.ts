import { 
  Student, 
  PackagePlan, 
  ScheduleSession, 
  AttendanceRecord, 
  PaymentInvoice, 
  AppSettings,
  WhatsAppMessageLog
} from '../types';

export const INITIAL_PACKAGES: PackagePlan[] = [
  {
    id: 'pkg-1',
    name: 'Paket Reguler Anak (8 Pertemuan)',
    sessionsCount: 8,
    price: 650000,
    description: '1x seminggu @90 menit, maksimal 5 murid per pelatih. Termasuk sertifikat level.',
    validityDays: 60,
    category: 'Reguler'
  },
  {
    id: 'pkg-2',
    name: 'Paket Privat Eksklusif (4 Pertemuan)',
    sessionsCount: 4,
    price: 900000,
    description: '1-on-1 bersama instruktur berlisensi PRSI. Jadwal fleksibel dan pendampingan intensif.',
    validityDays: 45,
    category: 'Privat'
  },
  {
    id: 'pkg-3',
    name: 'Paket Semi-Privat (8 Pertemuan)',
    sessionsCount: 8,
    price: 1100000,
    description: 'Maksimal 2 murid dalam satu grup belajar. Sangat efektif untuk percepatan teknik.',
    validityDays: 60,
    category: 'Privat'
  },
  {
    id: 'pkg-4',
    name: 'Paket Prestasi & Tim Kompetisi (Bulanan)',
    sessionsCount: 16,
    price: 1350000,
    description: 'Latihan 4x seminggu @120 menit. Program interval, endurance, pembedahan video stroke.',
    validityDays: 30,
    category: 'Prestasi'
  }
];

export const INITIAL_STUDENTS: Student[] = [
  {
    id: 'std-1',
    name: 'Arkan Daniswara',
    nickname: 'Arkan',
    birthDate: '2016-04-12',
    gender: 'L',
    level: 'Pemula (Water Safety & Meluncur)',
    parentName: 'Bpk. Hendra Daniswara',
    parentPhone: '6281234567891',
    parentRelation: 'Ayah',
    medicalNotes: 'Telinga kiri agak sensitif terhadap kaporit, wajib gunakan penutup telinga (earplug).',
    joinedDate: '2026-01-10',
    packageId: 'pkg-1',
    totalSessions: 8,
    remainingSessions: 2,
    status: 'Aktif',
    avatarBg: 'bg-sky-500'
  },
  {
    id: 'std-2',
    name: 'Kirana Aulia Putri',
    nickname: 'Kirana',
    birthDate: '2015-08-23',
    gender: 'P',
    level: 'Dasar (Gaya Dada & Bebas)',
    parentName: 'Ibu Ratna Dewi',
    parentPhone: '6281398765432',
    parentRelation: 'Ibu',
    medicalNotes: 'Kondisi fisik prima, tidak ada riwayat alergi atau asma.',
    joinedDate: '2025-11-04',
    packageId: 'pkg-1',
    totalSessions: 8,
    remainingSessions: 5,
    status: 'Aktif',
    avatarBg: 'bg-emerald-500'
  },
  {
    id: 'std-3',
    name: 'Fatih Raditya Pratama',
    nickname: 'Fatih',
    birthDate: '2017-02-18',
    gender: 'L',
    level: 'Pemula (Water Safety & Meluncur)',
    parentName: 'Ibu Maya Safitri',
    parentPhone: '6282112348899',
    parentRelation: 'Ibu',
    medicalNotes: 'Awalnya takut air dalam (>1.2m), butuh pendekatan bertahap dan pelampung lengan.',
    joinedDate: '2026-02-01',
    packageId: 'pkg-1',
    totalSessions: 8,
    remainingSessions: 1, // due for renewal!
    status: 'Aktif',
    avatarBg: 'bg-amber-500'
  },
  {
    id: 'std-4',
    name: 'Naomi Zahra Wijaya',
    nickname: 'Naomi',
    birthDate: '2014-10-05',
    gender: 'P',
    level: 'Lanjutan (Gaya Punggung & Kupu)',
    parentName: 'Bpk. Gunawan Wijaya',
    parentPhone: '6285712399881',
    parentRelation: 'Ayah',
    medicalNotes: 'Memiliki riwayat asma ringan saat cuaca terlalu dingin, sediakan inhaler cadangan.',
    joinedDate: '2025-06-15',
    packageId: 'pkg-3',
    totalSessions: 8,
    remainingSessions: 6,
    status: 'Aktif',
    avatarBg: 'bg-indigo-500'
  },
  {
    id: 'std-5',
    name: 'Rayyan Malik Ibrahim',
    nickname: 'Rayyan',
    birthDate: '2013-03-30',
    gender: 'L',
    level: 'Prestasi & Tim Kompetisi',
    parentName: 'Ibu Sinta Ibrahim',
    parentPhone: '6281988776655',
    parentRelation: 'Ibu',
    medicalNotes: 'Fisik sangat bugar. Target O2SN tingkat kota nomor 50m Gaya Bebas.',
    joinedDate: '2024-08-01',
    packageId: 'pkg-4',
    totalSessions: 16,
    remainingSessions: 11,
    status: 'Aktif',
    avatarBg: 'bg-rose-500'
  },
  {
    id: 'std-6',
    name: 'Alika Nabila Santoso',
    nickname: 'Alika',
    birthDate: '2018-09-14',
    gender: 'P',
    level: 'Pemula (Water Safety & Meluncur)',
    parentName: 'Bpk. Tri Santoso',
    parentPhone: '6281287654321',
    parentRelation: 'Ayah',
    medicalNotes: 'Sering haus setelah renang, disarankan bawa air mineral hangat.',
    joinedDate: '2026-03-01',
    packageId: 'pkg-2',
    totalSessions: 4,
    remainingSessions: 0, // Habis, butuh renewal
    status: 'Aktif',
    avatarBg: 'bg-teal-500'
  }
];

export const INITIAL_SCHEDULES: ScheduleSession[] = [
  {
    id: 'sch-1',
    title: 'Kelas Pagi: Water Safety & Pemula Anak',
    dayOfWeek: 'Sabtu',
    startTime: '08:00',
    endTime: '09:30',
    poolLocation: 'Kolam Tirta Mas, Jalur 1-2 (Kedalaman 0.9m)',
    coachName: 'Coach Bagas Prasetyo',
    coachPhone: '6281290908080',
    studentIds: ['std-1', 'std-3', 'std-6'],
    maxCapacity: 5,
    levelBadge: 'Pemula'
  },
  {
    id: 'sch-2',
    title: 'Kelas Siang: Penguatan Gaya Dada & Bebas',
    dayOfWeek: 'Sabtu',
    startTime: '10:00',
    endTime: '11:30',
    poolLocation: 'Kolam Tirta Mas, Jalur 3-4 (Kedalaman 1.4m)',
    coachName: 'Coach Rina Melati',
    coachPhone: '6281311223344',
    studentIds: ['std-2', 'std-4'],
    maxCapacity: 4,
    levelBadge: 'Dasar / Menengah'
  },
  {
    id: 'sch-3',
    title: 'Sesi Sore: Skuad Lanjutan & Prestasi',
    dayOfWeek: 'Minggu',
    startTime: '15:30',
    endTime: '17:30',
    poolLocation: 'Gelanggang Renang Kencana (Olympic 50m)',
    coachName: 'Coach Dimas Tirta, S.Or',
    coachPhone: '6281177665544',
    studentIds: ['std-5', 'std-4'],
    maxCapacity: 6,
    levelBadge: 'Prestasi'
  },
  {
    id: 'sch-4',
    title: 'Sesi Reguler Sore: Pemula & Water Confidence',
    dayOfWeek: 'Rabu',
    startTime: '16:00',
    endTime: '17:30',
    poolLocation: 'Kolam Tirta Mas, Jalur 1 (Kedalaman 0.9m)',
    coachName: 'Coach Bagas Prasetyo',
    coachPhone: '6281290908080',
    studentIds: ['std-1', 'std-3'],
    maxCapacity: 5,
    levelBadge: 'Pemula'
  },
  {
    id: 'sch-5',
    title: 'Sesi Privat: Teknik & Pembalikan Dinding',
    dayOfWeek: 'Jumat',
    startTime: '16:00',
    endTime: '17:30',
    poolLocation: 'Kolam Tirta Mas, Jalur Khusus Privat',
    coachName: 'Coach Rina Melati',
    coachPhone: '6281311223344',
    studentIds: ['std-6'],
    maxCapacity: 2,
    levelBadge: 'Privat'
  }
];

export const INITIAL_ATTENDANCE: AttendanceRecord[] = [
  {
    id: 'att-1',
    date: '2026-10-17',
    scheduleId: 'sch-1',
    studentId: 'std-1',
    status: 'Hadir',
    coachNotes: 'Latihan meluncur 10m tanpa bantuan papan. Posisi streamline badan sudah horizontal dan pernapasan ke samping sudah rileks.',
    skillsPracticed: ['Streamline Meluncur', 'Pernapasan Samping', 'Kicking 25m'],
    starRating: 5,
    whatsappSent: true,
    whatsappSentAt: '2026-10-17 09:35'
  },
  {
    id: 'att-2',
    date: '2026-10-17',
    scheduleId: 'sch-1',
    studentId: 'std-3',
    status: 'Hadir',
    coachNotes: 'Ananda Fatih sangat percaya diri hari ini, sudah berani melompat dari pinggir kolam dan mengapung telentang 15 detik!',
    skillsPracticed: ['Water Confidence', 'Mengapung Telentang', 'Papan Luncur'],
    starRating: 4,
    whatsappSent: true,
    whatsappSentAt: '2026-10-17 09:36'
  },
  {
    id: 'att-3',
    date: '2026-10-17',
    scheduleId: 'sch-1',
    studentId: 'std-6',
    status: 'Izin',
    coachNotes: 'Wali murid mengabarkan ada acara keluarga di luar kota. Sesi tidak dipotong dan dijadwalkan sesi pengganti (make-up class).',
    skillsPracticed: [],
    starRating: 0,
    whatsappSent: false
  },
  {
    id: 'att-4',
    date: '2026-10-18',
    scheduleId: 'sch-2',
    studentId: 'std-2',
    status: 'Hadir',
    coachNotes: 'Kayuhan gaya dada 50m stabil. Koordinasi tendangan katak dan tarikan tangan makin sinkron. Pertahankan tempo pernapasan.',
    skillsPracticed: ['Gaya Dada 50m', 'Pernapasan Ritmik', 'Dolphin Kick'],
    starRating: 5,
    whatsappSent: true,
    whatsappSentAt: '2026-10-18 11:35'
  },
  {
    id: 'att-5',
    date: '2026-10-18',
    scheduleId: 'sch-2',
    studentId: 'std-4',
    status: 'Hadir',
    coachNotes: 'Latihan kayuhan gaya punggung 25m x 4 repetisi. Dagu sudah terangkat dengan baik dan rotasi pinggul seimbang.',
    skillsPracticed: ['Gaya Punggung 25m', 'Rotasi Bahu', 'Start Dinding'],
    starRating: 4,
    whatsappSent: false // pending send to parent!
  }
];

export const INITIAL_INVOICES: PaymentInvoice[] = [
  {
    id: 'inv-101',
    invoiceNumber: 'INV/2026/X/001',
    studentId: 'std-1',
    packageId: 'pkg-1',
    amount: 650000,
    status: 'Lunas',
    issueDate: '2026-10-01',
    dueDate: '2026-10-07',
    paidDate: '2026-10-02',
    paymentMethod: 'Transfer Bank',
    notes: 'Transfer via BCA an. Hendra Daniswara',
    whatsappSent: true
  },
  {
    id: 'inv-102',
    invoiceNumber: 'INV/2026/X/002',
    studentId: 'std-2',
    packageId: 'pkg-1',
    amount: 650000,
    status: 'Lunas',
    issueDate: '2026-10-01',
    dueDate: '2026-10-07',
    paidDate: '2026-10-03',
    paymentMethod: 'QRIS',
    notes: 'Pembayaran QRIS Kasir Kolam',
    whatsappSent: true
  },
  {
    id: 'inv-103',
    invoiceNumber: 'INV/2026/X/003',
    studentId: 'std-3',
    packageId: 'pkg-1',
    amount: 650000,
    status: 'Menunggu',
    issueDate: '2026-10-15',
    dueDate: '2026-10-22',
    paymentMethod: 'Transfer Bank',
    notes: 'Perpanjangan paket (Sisa sesi murid tinggal 1)',
    whatsappSent: false
  },
  {
    id: 'inv-104',
    invoiceNumber: 'INV/2026/X/004',
    studentId: 'std-6',
    packageId: 'pkg-2',
    amount: 900000,
    status: 'Jatuh Tempo',
    issueDate: '2026-10-05',
    dueDate: '2026-10-12',
    paymentMethod: 'Transfer Bank',
    notes: 'Paket privat 4 sesi baru telah habis terpakai',
    whatsappSent: false
  },
  {
    id: 'inv-105',
    invoiceNumber: 'INV/2026/X/005',
    studentId: 'std-5',
    packageId: 'pkg-4',
    amount: 1350000,
    status: 'Lunas',
    issueDate: '2026-10-01',
    dueDate: '2026-10-05',
    paidDate: '2026-10-01',
    paymentMethod: 'Transfer Bank',
    notes: 'SPP Bulanan Tim Prestasi Renang',
    whatsappSent: true
  }
];

export const INITIAL_SETTINGS: AppSettings = {
  academyName: 'AkuatikPro Swimming Academy',
  tagline: 'Membangun Kepercayaan Diri, Disiplin & Prestasi di Dalam Air',
  phoneNumber: '6281288990011',
  email: 'admin@akuatikpro.id',
  address: 'Gelanggang Olahraga & Kolam Renang Tirta Mas, Lt. 1, Jakarta Selatan',
  bankAccount: 'Bank Central Asia (BCA): 872-098-7651',
  accountHolder: 'AkuatikPro Tirta Berjaya',
  attendanceWaTemplate: `Halo {wali_nama}, terima kasih telah mempercayakan ananda *{murid_nama}* berlatih di *{akademi_nama}*.

Berikut laporan presensi & evaluasi latihan hari ini:
📅 *Tanggal:* {tanggal}
⏰ *Sesi:* {waktu} WIB
🏊 *Lokasi:* {lokasi}
👨‍🏫 *Pelatih:* {pelatih_nama}
📌 *Status Kehadiran:* {status_kehadiran}

⭐ *Pencapaian & Catatan Pelatih:*
"{catatan_pelatih}"

🎯 *Fokus Keterampilan:*
{keterampilan}

📊 *Sisa Sesi Paket:* *{sisa_sesi} sesi* lagi
{peringatan_kuota}

Semoga ananda semakin sehat, ceria, dan terus berprestasi! Sampai jumpa di jadwal sesi berikutnya ya. Salam hangat! 🏊‍♂️💙`,

  paymentReminderTemplate: `Yth. {wali_nama}, orang tua dari ananda *{murid_nama}*.

Kami menginformasikan bahwa paket les renang ananda ({nama_paket}) memiliki rincian tagihan sebagai berikut:

📄 *No. Invoice:* {no_invoice}
💰 *Nominal Tagihan:* Rp {nominal}
⏳ *Batas Jatuh Tempo:* {jatuh_tempo}
📊 *Status Saat Ini:* *{status_bayar}*
ℹ️ *Sisa Sesi Aktif:* {sisa_sesi} sesi

Pembayaran dapat ditransfer ke:
🏦 *{rekening_bank}*
A.n: *{nama_pemilik_rekening}*

Setelah melakukan transfer, mohon konfirmasi dengan membalas pesan ini atau mengirimkan bukti transfer. Terima kasih banyak atas kerjasamanya! 🙏`,

  paymentReceiptTemplate: `*BUKTI PEMBAYARAN RESMI LES RENANG*
*{akademi_nama}*

Terima kasih {wali_nama}, pembayaran untuk ananda *{murid_nama}* telah kami terima dengan sukses.

📄 *No. Kuitansi:* {no_invoice}
📅 *Tanggal Lunas:* {tanggal_lunas}
📦 *Paket:* {nama_paket} ({jumlah_sesi} Pertemuan)
💳 *Metode:* {metode_bayar}
💵 *Jumlah:* Rp {nominal}
✅ *Status:* LUNAS

Kuota sesi ananda telah diperbarui menjadi *{sisa_sesi} Sesi*. Terima kasih atas dukungannya selalu! 🌟🏊`
};

export const INITIAL_WA_LOGS: WhatsAppMessageLog[] = [
  {
    id: 'log-1',
    recipientName: 'Bpk. Hendra Daniswara',
    recipientPhone: '6281234567891',
    studentName: 'Arkan Daniswara',
    type: 'Absensi Latihan',
    timestamp: '2026-10-17 09:35',
    messageText: 'Laporan presensi & evaluasi latihan ananda Arkan: Meluncur 10m tanpa papan pelampung...',
    status: 'Terkirim'
  },
  {
    id: 'log-2',
    recipientName: 'Ibu Maya Safitri',
    recipientPhone: '6282112348899',
    studentName: 'Fatih Raditya Pratama',
    type: 'Absensi Latihan',
    timestamp: '2026-10-17 09:36',
    messageText: 'Laporan presensi ananda Fatih: Sangat percaya diri, mengapung telentang 15 detik...',
    status: 'Terkirim'
  },
  {
    id: 'log-3',
    recipientName: 'Bpk. Hendra Daniswara',
    recipientPhone: '6281234567891',
    studentName: 'Arkan Daniswara',
    type: 'Kuitansi Pembayaran',
    timestamp: '2026-10-02 10:14',
    messageText: 'BUKTI PEMBAYARAN RESMI LES RENANG INV/2026/X/001 senilai Rp 650.000 Lunas...',
    status: 'Terkirim'
  }
];
