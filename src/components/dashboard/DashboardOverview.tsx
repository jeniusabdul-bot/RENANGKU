import React from 'react';
import { 
  Users, 
  Calendar, 
  Send, 
  CreditCard, 
  AlertCircle, 
  Clock, 
  MapPin, 
  ChevronRight, 
  CheckCircle2, 
  MessageSquare,
  Sparkles,
  ArrowUpRight
} from 'lucide-react';
import { 
  Student, 
  ScheduleSession, 
  AttendanceRecord, 
  PaymentInvoice, 
  PackagePlan,
  WhatsAppMessageLog,
  AppSettings
} from '../../types';
import { formatRupiah, formatDisplayDate, buildWaUrl, generatePaymentReminderMessage } from '../../utils/whatsapp';

interface DashboardOverviewProps {
  students: Student[];
  schedules: ScheduleSession[];
  attendance: AttendanceRecord[];
  invoices: PaymentInvoice[];
  packages: PackagePlan[];
  waLogs: WhatsAppMessageLog[];
  settings: AppSettings;
  onNavigate: (tab: string, contextId?: string) => void;
  onSendWaReminder: (student: Student, invoice: PaymentInvoice) => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  students,
  schedules,
  attendance,
  invoices,
  packages,
  waLogs,
  settings,
  onNavigate,
  onSendWaReminder
}) => {
  // Current day in Indonesian
  const dayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const todayDayName = dayNames[new Date().getDay()];
  const todayDateStr = new Date().toISOString().split('T')[0];

  // Sessions for today
  const todaySchedules = schedules.filter(s => s.dayOfWeek === todayDayName);

  // Active students
  const activeStudents = students.filter(s => s.status === 'Aktif');

  // Low quota students (<= 1 session)
  const lowQuotaStudents = students.filter(s => s.status === 'Aktif' && s.remainingSessions <= 1);

  // Pending WhatsApp attendance reports
  const pendingAttendanceWa = attendance.filter(a => !a.whatsappSent && a.status === 'Hadir');

  // Monthly revenue
  const monthlyRevenue = invoices
    .filter(i => i.status === 'Lunas')
    .reduce((sum, i) => sum + i.amount, 0);

  const pendingRevenue = invoices
    .filter(i => i.status === 'Menunggu' || i.status === 'Jatuh Tempo')
    .reduce((sum, i) => sum + i.amount, 0);

  return (
    <div className="space-y-8">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-slate-900 text-white border border-slate-800 shadow-md">
        <div className="absolute inset-0 z-0">
          <img 
            src="/src/assets/images/swimming_pool_banner_1792391814421.jpg" 
            alt="Gelanggang Renang Akuatik" 
            className="w-full h-full object-cover opacity-35"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900/80 to-transparent" />
        </div>

        <div className="relative z-10 p-6 md:p-8 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-sky-500/20 text-sky-300 border border-sky-400/30 rounded-full text-xs font-medium mb-3 backdrop-blur-sm">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Sistem Otomasi Les Renang & WhatsApp Terpadu</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white mb-2">
            Selamat Datang di {settings.academyName}
          </h1>
          <p className="text-sm md:text-base text-slate-300 leading-relaxed mb-6 max-w-2xl">
            Kelola jadwal latihan, pantau sisa kuota murid, serta kirimkan laporan evaluasi dan absensi langsung ke WhatsApp wali murid segera setelah sesi renang selesai.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigate('attendance')}
              className="flex items-center gap-2 px-4 py-2.5 bg-sky-500 hover:bg-sky-400 text-white font-medium text-sm rounded-lg transition-colors shadow-sm cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Input Presensi Hari Ini</span>
            </button>
            <button
              onClick={() => onNavigate('schedules')}
              className="flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-medium text-sm rounded-lg transition-colors backdrop-blur-sm border border-white/20 cursor-pointer"
            >
              <Calendar className="w-4 h-4" />
              <span>Lihat Kalender Latihan</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Metrics Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-2">
            <span>Total Murid Aktif</span>
            <Users className="w-4 h-4 text-sky-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono-data tabular-nums">
            {activeStudents.length} <span className="text-xs text-slate-500 font-normal font-sans">Anak</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {students.length} total terdaftar
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-2">
            <span>Sesi Latihan Hari Ini</span>
            <Calendar className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono-data tabular-nums">
            {todaySchedules.length} <span className="text-xs text-slate-500 font-normal font-sans">Kelas ({todayDayName})</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {todaySchedules.reduce((acc, s) => acc + s.studentIds.length, 0)} murid terjadwal
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-2">
            <span>Laporan WA Pending</span>
            <Send className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono-data tabular-nums">
            {pendingAttendanceWa.length} <span className="text-xs text-slate-500 font-normal font-sans">Belum Terkirim</span>
          </div>
          <p className="text-xs text-amber-600 font-medium mt-1">
            {pendingAttendanceWa.length > 0 ? 'Siap dikirim ke wali murid' : 'Semua laporan sudah terkirim'}
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-2">
            <span>Pemasukan Terkumpul</span>
            <CreditCard className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-xl font-bold text-slate-900 font-mono-data tabular-nums">
            {formatRupiah(monthlyRevenue)}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Tunggakan: <span className="font-mono-data tabular-nums font-medium text-rose-600">{formatRupiah(pendingRevenue)}</span>
          </p>
        </div>
      </div>

      {/* Main Grid: Today's Schedule & Low Quota Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (2 Cols): Jadwal Latihan Hari Ini */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Jadwal Latihan Hari Ini ({todayDayName})
              </h2>
              <p className="text-xs text-slate-500">
                {formatDisplayDate(todayDateStr)}
              </p>
            </div>
            <button
              onClick={() => onNavigate('schedules')}
              className="text-xs font-medium text-sky-600 hover:text-sky-800 flex items-center gap-1 cursor-pointer"
            >
              <span>Semua Jadwal Mingguan</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {todaySchedules.length === 0 ? (
            <div className="bg-white p-8 rounded-xl border border-slate-200 text-center">
              <Calendar className="w-10 h-10 text-slate-400 mx-auto mb-3" />
              <h3 className="text-sm font-semibold text-slate-800 mb-1">
                Tidak Ada Jadwal Kelas Hari {todayDayName}
              </h3>
              <p className="text-xs text-slate-500 mb-4 max-w-sm mx-auto">
                Hari ini adalah jadwal istirahat kolam atau Anda dapat melihat seluruh sesi mingguan pada menu Jadwal & Sesi.
              </p>
              <button
                onClick={() => onNavigate('schedules')}
                className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-medium hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Lihat Kalender Lengkap
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {todaySchedules.map((schedule) => {
                const enrolled = students.filter(s => schedule.studentIds.includes(s.id));
                const sessionAtt = attendance.filter(a => a.scheduleId === schedule.id && a.date === todayDateStr);
                const hasAttendance = sessionAtt.length > 0;

                return (
                  <div
                    key={schedule.id}
                    className="bg-white p-5 rounded-xl border border-slate-200 hover:border-slate-300 transition-all shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium px-2 py-0.5 bg-sky-50 text-sky-700 rounded-md">
                          {schedule.levelBadge}
                        </span>
                        <h3 className="font-semibold text-slate-900 text-sm">
                          {schedule.title}
                        </h3>
                      </div>

                      <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span className="font-mono-data tabular-nums font-medium text-slate-700">
                            {schedule.startTime} - {schedule.endTime} WIB
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          <span>{schedule.poolLocation}</span>
                        </div>
                        <div>
                          <span>Pelatih: <strong className="text-slate-700">{schedule.coachName}</strong></span>
                        </div>
                      </div>

                      {/* Enrolled students badges */}
                      <div className="flex items-center gap-1.5 pt-1">
                        <span className="text-xs text-slate-400">Murid:</span>
                        <div className="flex flex-wrap gap-1">
                          {enrolled.map(st => (
                            <span 
                              key={st.id} 
                              className="text-xs text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md"
                            >
                              {st.nickname} ({st.remainingSessions} sesi)
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="sm:self-center shrink-0 flex items-center gap-2">
                      <button
                        onClick={() => onNavigate('attendance', schedule.id)}
                        className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                          hasAttendance
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                            : 'bg-sky-600 text-white hover:bg-sky-700'
                        }`}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{hasAttendance ? 'Lihat / Edit Presensi' : 'Isi Presensi Sesi'}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Sisa Kuota Menipis & Peringatan Perpanjangan */}
          <div className="pt-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  Perhatian Kuota: Sisa Sesi Menipis (&le; 1 Sesi)
                </h3>
              </div>
              <span className="text-xs text-slate-500">
                {lowQuotaStudents.length} murid butuh renewal
              </span>
            </div>

            {lowQuotaStudents.length === 0 ? (
              <div className="bg-white p-4 rounded-xl border border-slate-200 text-xs text-slate-500">
                Semua murid aktif memiliki kuota sesi yang cukup.
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100">
                {lowQuotaStudents.map(student => {
                  const studentPackage = packages.find(p => p.id === student.packageId);
                  const studentInvoice = invoices.find(i => i.studentId === student.id && i.status !== 'Lunas');

                  return (
                    <div key={student.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50 transition-colors">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-900 text-sm">{student.name}</span>
                          <span className={`text-xs px-2 py-0.5 rounded font-mono font-medium ${
                            student.remainingSessions === 0 
                              ? 'bg-rose-100 text-rose-800' 
                              : 'bg-amber-100 text-amber-800'
                          }`}>
                            {student.remainingSessions === 0 ? 'KUOTA HABIS' : 'SISA 1 SESI'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500">
                          Wali: {student.parentRelation} {student.parentName} ({student.parentPhone}) · Paket: {studentPackage?.name}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {studentInvoice ? (
                          <button
                            onClick={() => onSendWaReminder(student, studentInvoice)}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg border border-emerald-200 transition-colors cursor-pointer"
                          >
                            <Send className="w-3.5 h-3.5" />
                            <span>Kirim Pengingat WA</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => onNavigate('payments')}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-sky-700 bg-sky-50 hover:bg-sky-100 rounded-lg border border-sky-200 transition-colors cursor-pointer"
                          >
                            <span>Buat Tagihan Baru</span>
                            <ArrowUpRight className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: WhatsApp Activity & Quick Actions */}
        <div className="space-y-6">
          {/* Quick Action Box */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900">
              Aksi Cepat Operasional
            </h3>

            <div className="space-y-2">
              <button
                onClick={() => onNavigate('attendance')}
                className="w-full text-left p-3 rounded-lg border border-slate-200 hover:border-sky-300 hover:bg-sky-50/50 transition-all group flex items-center justify-between cursor-pointer"
              >
                <div>
                  <div className="text-xs font-semibold text-slate-800 group-hover:text-sky-700">
                    Kirim Notifikasi Absensi Terakhir
                  </div>
                  <div className="text-xs text-slate-500">
                    Kirim rangkuman latihan ke chat WhatsApp orang tua
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-sky-600" />
              </button>

              <button
                onClick={() => onNavigate('payments')}
                className="w-full text-left p-3 rounded-lg border border-slate-200 hover:border-sky-300 hover:bg-sky-50/50 transition-all group flex items-center justify-between cursor-pointer"
              >
                <div>
                  <div className="text-xs font-semibold text-slate-800 group-hover:text-sky-700">
                    Rekap Pembayaran & Buat Kuitansi
                  </div>
                  <div className="text-xs text-slate-500">
                    Cek SPP bulanan & bagikan bukti bayar ke WA
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-sky-600" />
              </button>

              <button
                onClick={() => onNavigate('students')}
                className="w-full text-left p-3 rounded-lg border border-slate-200 hover:border-sky-300 hover:bg-sky-50/50 transition-all group flex items-center justify-between cursor-pointer"
              >
                <div>
                  <div className="text-xs font-semibold text-slate-800 group-hover:text-sky-700">
                    + Daftarkan Murid Baru
                  </div>
                  <div className="text-xs text-slate-500">
                    Input data perenang, kontak wali & pilih paket awal
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-sky-600" />
              </button>
            </div>
          </div>

          {/* Riwayat Pengiriman Pesan WhatsApp */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-emerald-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  Riwayat WhatsApp Terkirim
                </h3>
              </div>
              <span className="text-xs text-slate-500 font-mono-data tabular-nums">
                {waLogs.length} Terkirim
              </span>
            </div>

            <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
              {waLogs.slice(0, 5).map(log => (
                <div key={log.id} className="text-xs p-3 bg-slate-50 rounded-lg border border-slate-100 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-800">{log.studentName}</span>
                    <span className="text-slate-400 font-mono-data text-[11px]">{log.timestamp}</span>
                  </div>
                  <div className="text-slate-500 text-[11px]">
                    Ke: {log.recipientName} ({log.recipientPhone})
                  </div>
                  <div className="text-slate-600 line-clamp-2 italic bg-white p-1.5 rounded border border-slate-100">
                    "{log.messageText}"
                  </div>
                  <div className="pt-1 flex items-center justify-between text-[11px]">
                    <span className="text-emerald-600 font-medium flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      {log.type}
                    </span>
                    <a
                      href={buildWaUrl(log.recipientPhone, log.messageText)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sky-600 hover:text-sky-800 font-medium"
                    >
                      Buka Chat Lagi &rarr;
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
