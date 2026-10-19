export type StudentLevel = 
  | 'Pemula (Water Safety & Meluncur)'
  | 'Dasar (Gaya Dada & Bebas)'
  | 'Lanjutan (Gaya Punggung & Kupu)'
  | 'Prestasi & Tim Kompetisi';

export interface Student {
  id: string;
  name: string;
  nickname: string;
  birthDate: string;
  gender: 'L' | 'P';
  level: StudentLevel;
  parentName: string;
  parentPhone: string; // e.g. "6281234567890"
  parentRelation: 'Ayah' | 'Ibu' | 'Wali';
  medicalNotes: string;
  joinedDate: string;
  packageId: string;
  totalSessions: number;
  remainingSessions: number;
  status: 'Aktif' | 'Cuti' | 'Selesai';
  avatarBg: string;
}

export interface PackagePlan {
  id: string;
  name: string;
  sessionsCount: number;
  price: number;
  description: string;
  validityDays: number;
  category: 'Reguler' | 'Privat' | 'Prestasi';
}

export type DayOfWeek = 'Senin' | 'Selasa' | 'Rabu' | 'Kamis' | 'Jumat' | 'Sabtu' | 'Minggu';

export interface ScheduleSession {
  id: string;
  title: string;
  dayOfWeek: DayOfWeek;
  startTime: string; // "08:00"
  endTime: string;   // "09:30"
  poolLocation: string;
  coachName: string;
  coachPhone: string;
  studentIds: string[];
  maxCapacity: number;
  levelBadge: string;
}

export type AttendanceStatus = 'Hadir' | 'Izin' | 'Sakit' | 'Alpa';

export interface AttendanceRecord {
  id: string;
  date: string; // YYYY-MM-DD
  scheduleId: string;
  studentId: string;
  status: AttendanceStatus;
  coachNotes: string;
  skillsPracticed: string[];
  starRating: number; // 1-5
  whatsappSent: boolean;
  whatsappSentAt?: string;
}

export type PaymentStatus = 'Lunas' | 'Menunggu' | 'Jatuh Tempo';

export interface PaymentInvoice {
  id: string;
  invoiceNumber: string;
  studentId: string;
  packageId: string;
  amount: number;
  status: PaymentStatus;
  issueDate: string;
  dueDate: string;
  paidDate?: string;
  paymentMethod?: 'Transfer Bank' | 'QRIS' | 'Tunai / Cash';
  notes?: string;
  whatsappSent: boolean;
}

export interface WhatsAppMessageLog {
  id: string;
  recipientName: string;
  recipientPhone: string;
  studentName: string;
  type: 'Absensi Latihan' | 'Pengingat Pembayaran' | 'Kuitansi Pembayaran';
  timestamp: string;
  messageText: string;
  status: 'Terkirim';
}

export interface AppSettings {
  academyName: string;
  tagline: string;
  phoneNumber: string;
  email: string;
  address: string;
  bankAccount: string;
  accountHolder: string;
  attendanceWaTemplate: string;
  paymentReminderTemplate: string;
  paymentReceiptTemplate: string;
}
