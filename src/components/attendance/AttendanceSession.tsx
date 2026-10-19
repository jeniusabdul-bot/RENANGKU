import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  Send, 
  Copy, 
  Calendar, 
  Clock, 
  MapPin, 
  User, 
  Star, 
  Sparkles, 
  Check, 
  AlertTriangle,
  MessageSquare,
  ChevronDown,
  Filter,
  Eye,
  RefreshCw
} from 'lucide-react';
import { 
  Student, 
  ScheduleSession, 
  AttendanceRecord, 
  AttendanceStatus,
  AppSettings,
  WhatsAppMessageLog
} from '../../types';
import { 
  generateAttendanceMessage, 
  buildWaUrl, 
  formatDisplayDate 
} from '../../utils/whatsapp';

interface AttendanceSessionProps {
  students: Student[];
  schedules: ScheduleSession[];
  attendance: AttendanceRecord[];
  settings: AppSettings;
  preselectedScheduleId?: string;
  onSaveAttendance: (records: AttendanceRecord[], updatedStudents: Student[]) => void;
  onLogWaMessage: (log: WhatsAppMessageLog) => void;
}

const COMMON_SKILLS = [
  'Adaptasi Air & Menyelam',
  'Meluncur Streamline',
  'Kicking Papan 25m',
  'Pernapasan Samping (Gaya Bebas)',
  'Kayuhan Gaya Bebas 25m',
  'Kayuhan Gaya Bebas 50m',
  'Tendangan Kaki Katak',
  'Koordinasi Gaya Dada',
  'Mengapung Telentang',
  'Kayuhan Gaya Punggung',
  'Pembalikan Dinding (Flip Turn)',
  'Endurance & Latihan Stamina'
];

const QUICK_NOTES = [
  'Latihan pernapasan gaya bebas semakin rileks dan ritmik. Kayuhan tangan sudah terkoordinasi baik.',
  'Posisi streamline meluncur sudah sangat lurus dan stabil tanpa pelampung. Hebat!',
  'Ananda sangat percaya diri di kolam dalam, berani melompat dan mengapung mandiri.',
  'Kayuhan gaya dada 50m sinkron antara tendangan katak dan tarikan tangan. Pertahankan stamina!',
  'Fokus pada rotasi bahu dan tendangan kaki konstan. Progres latihan hari ini luar biasa.'
];

export const AttendanceSession: React.FC<AttendanceSessionProps> = ({
  students,
  schedules,
  attendance,
  settings,
  preselectedScheduleId,
  onSaveAttendance,
  onLogWaMessage
}) => {
  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [selectedScheduleId, setSelectedScheduleId] = useState<string>(
    preselectedScheduleId || (schedules.length > 0 ? schedules[0].id : '')
  );

  // Local state for editing attendance for the selected session and date
  const [sessionAttendance, setSessionAttendance] = useState<Record<string, AttendanceRecord>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [previewStudentId, setPreviewStudentId] = useState<string | null>(null);
  const [showBlastModal, setShowBlastModal] = useState<boolean>(false);
  const [saveSuccessNotice, setSaveSuccessNotice] = useState<boolean>(false);

  const activeSchedule = schedules.find(s => s.id === selectedScheduleId);
  const enrolledStudents = students.filter(s => activeSchedule?.studentIds.includes(s.id));

  // Initialize or fetch attendance records for this date + schedule
  useEffect(() => {
    if (!activeSchedule) return;

    const currentMap: Record<string, AttendanceRecord> = {};

    enrolledStudents.forEach(st => {
      const existing = attendance.find(
        a => a.scheduleId === activeSchedule.id && a.studentId === st.id && a.date === selectedDate
      );

      if (existing) {
        currentMap[st.id] = { ...existing };
      } else {
        // default record
        currentMap[st.id] = {
          id: `att-${Date.now()}-${st.id}`,
          date: selectedDate,
          scheduleId: activeSchedule.id,
          studentId: st.id,
          status: 'Hadir',
          coachNotes: 'Ananda berlatih dengan ceria, disiplin, dan menunjukkan penguasaan teknik yang semakin matang.',
          skillsPracticed: ['Meluncur Streamline', 'Kicking Papan 25m'],
          starRating: 5,
          whatsappSent: false
        };
      }
    });

    setSessionAttendance(currentMap);
  }, [selectedScheduleId, selectedDate, schedules]);

  const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
    setSessionAttendance(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        status
      }
    }));
  };

  const handleNotesChange = (studentId: string, notes: string) => {
    setSessionAttendance(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        coachNotes: notes
      }
    }));
  };

  const handleRatingChange = (studentId: string, rating: number) => {
    setSessionAttendance(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        starRating: rating
      }
    }));
  };

  const handleToggleSkill = (studentId: string, skill: string) => {
    setSessionAttendance(prev => {
      const currentSkills = prev[studentId]?.skillsPracticed || [];
      const updated = currentSkills.includes(skill)
        ? currentSkills.filter(s => s !== skill)
        : [...currentSkills, skill];

      return {
        ...prev,
        [studentId]: {
          ...prev[studentId],
          skillsPracticed: updated
        }
      };
    });
  };

  const handleSaveAndSync = () => {
    if (!activeSchedule) return;

    const recordsToSave = Object.values(sessionAttendance);

    // Calculate quota reduction for students marked Hadir (if not previously deducted)
    const updatedStudentsList = students.map(student => {
      const record = sessionAttendance[student.id];
      if (!record) return student;

      const previousRecord = attendance.find(
        a => a.scheduleId === activeSchedule.id && a.studentId === student.id && a.date === selectedDate
      );

      // If newly marked Hadir from non-hadir or new
      if (record.status === 'Hadir' && (!previousRecord || previousRecord.status !== 'Hadir')) {
        return {
          ...student,
          remainingSessions: Math.max(0, student.remainingSessions - 1)
        };
      } else if (record.status !== 'Hadir' && previousRecord && previousRecord.status === 'Hadir') {
        // Returned to Izin/Sakit -> refund quota
        return {
          ...student,
          remainingSessions: student.remainingSessions + 1
        };
      }

      return student;
    });

    onSaveAttendance(recordsToSave, updatedStudentsList);
    setSaveSuccessNotice(true);
    setTimeout(() => setSaveSuccessNotice(false), 3000);
  };

  const handleSendWhatsAppSingle = (student: Student) => {
    if (!activeSchedule) return;

    const record = sessionAttendance[student.id];
    if (!record) return;

    const messageText = generateAttendanceMessage(student, activeSchedule, record, settings);
    const waUrl = buildWaUrl(student.parentPhone, messageText);

    // Mark as sent in state & persistence
    const nowTime = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    const updatedRecord: AttendanceRecord = {
      ...record,
      whatsappSent: true,
      whatsappSentAt: `${selectedDate} ${nowTime}`
    };

    setSessionAttendance(prev => ({
      ...prev,
      [student.id]: updatedRecord
    }));

    onSaveAttendance([updatedRecord], students);

    // Log to message history
    onLogWaMessage({
      id: `log-${Date.now()}-${student.id}`,
      recipientName: student.parentName,
      recipientPhone: student.parentPhone,
      studentName: student.name,
      type: 'Absensi Latihan',
      timestamp: `${selectedDate} ${nowTime}`,
      messageText,
      status: 'Terkirim'
    });

    // Open WhatsApp in new tab
    window.open(waUrl, '_blank', 'noopener,noreferrer');
  };

  const handleCopyText = (student: Student) => {
    if (!activeSchedule) return;
    const record = sessionAttendance[student.id];
    if (!record) return;

    const messageText = generateAttendanceMessage(student, activeSchedule, record, settings);
    navigator.clipboard.writeText(messageText);
    setCopiedId(student.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  // Metrics for current session
  const totalStudents = enrolledStudents.length;
  const hadirCount = Object.values(sessionAttendance).filter(r => r.status === 'Hadir').length;
  const izinCount = Object.values(sessionAttendance).filter(r => r.status === 'Izin').length;
  const sakitCount = Object.values(sessionAttendance).filter(r => r.status === 'Sakit').length;
  const sentWaCount = Object.values(sessionAttendance).filter(r => r.whatsappSent).length;

  return (
    <div className="space-y-6">
      {/* Top Filter and Session Picker */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900">
              Presensi Latihan & Notifikasi WhatsApp Wali
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Catat kehadiran, pencapaian latihan di pinggir kolam, dan kirimkan laporan evaluasi otomatis ke WhatsApp wali murid.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Date input */}
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg text-xs">
              <Calendar className="w-4 h-4 text-slate-400" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-transparent font-medium text-slate-700 focus:outline-none cursor-pointer"
              />
            </div>

            {/* Schedule Selector */}
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg text-xs">
              <Clock className="w-4 h-4 text-slate-400" />
              <select
                value={selectedScheduleId}
                onChange={(e) => setSelectedScheduleId(e.target.value)}
                className="bg-transparent font-medium text-slate-700 focus:outline-none cursor-pointer pr-4"
              >
                {schedules.map(sch => (
                  <option key={sch.id} value={sch.id}>
                    {sch.dayOfWeek} · {sch.startTime}-{sch.endTime} · {sch.title}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Selected Session Details Card */}
        {activeSchedule && (
          <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4 text-xs">
            <div className="flex flex-wrap items-center gap-4 text-slate-600">
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-sky-600" />
                <span>{activeSchedule.poolLocation}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-sky-600" />
                <span>Pelatih: <strong>{activeSchedule.coachName}</strong></span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="font-mono-data tabular-nums font-semibold text-slate-800">
                  {enrolledStudents.length} Murid Terdaftar
                </span>
              </div>
            </div>

            {/* Quick action buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleSaveAndSync}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-lg transition-colors cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Simpan Presensi</span>
              </button>
              <button
                onClick={() => setShowBlastModal(true)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-colors cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Kirim Semua WA ({enrolledStudents.length})</span>
              </button>
            </div>
          </div>
        )}

        {/* Success Notice */}
        {saveSuccessNotice && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Presensi latihan berhasil disimpan! Kuota sesi murid telah disinkronkan.</span>
          </div>
        )}
      </div>

      {/* Summary KPI Strip for this session */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-3.5 rounded-lg border border-slate-200 flex items-center justify-between">
          <span className="text-xs text-slate-500">Hadir</span>
          <span className="text-lg font-bold text-emerald-600 font-mono-data tabular-nums">{hadirCount}</span>
        </div>
        <div className="bg-white p-3.5 rounded-lg border border-slate-200 flex items-center justify-between">
          <span className="text-xs text-slate-500">Izin / Sakit</span>
          <span className="text-lg font-bold text-sky-600 font-mono-data tabular-nums">{izinCount + sakitCount}</span>
        </div>
        <div className="bg-white p-3.5 rounded-lg border border-slate-200 flex items-center justify-between">
          <span className="text-xs text-slate-500">Laporan WA Terkirim</span>
          <span className="text-lg font-bold text-slate-800 font-mono-data tabular-nums">{sentWaCount} / {totalStudents}</span>
        </div>
        <div className="bg-white p-3.5 rounded-lg border border-slate-200 flex items-center justify-between">
          <span className="text-xs text-slate-500">Tanggal Latihan</span>
          <span className="text-xs font-semibold text-slate-700">{formatDisplayDate(selectedDate)}</span>
        </div>
      </div>

      {/* Roster Attendance Cards */}
      {enrolledStudents.length === 0 ? (
        <div className="bg-white p-8 rounded-xl border border-slate-200 text-center text-slate-500 text-xs">
          Belum ada murid yang dimasukkan ke dalam sesi kelas ini. Silakan atur daftar murid pada menu Jadwal & Sesi.
        </div>
      ) : (
        <div className="space-y-4">
          {enrolledStudents.map((student) => {
            const record = sessionAttendance[student.id] || {
              id: `att-tmp-${student.id}`,
              date: selectedDate,
              scheduleId: selectedScheduleId,
              studentId: student.id,
              status: 'Hadir',
              coachNotes: '',
              skillsPracticed: [],
              starRating: 5,
              whatsappSent: false
            };

            const isPresent = record.status === 'Hadir';
            const isSent = record.whatsappSent;

            return (
              <div 
                key={student.id}
                className={`bg-white rounded-xl border transition-all ${
                  isSent 
                    ? 'border-emerald-200 bg-emerald-50/20' 
                    : isPresent 
                      ? 'border-slate-200 hover:border-slate-300' 
                      : 'border-slate-200 opacity-90'
                } p-5 shadow-xs`}
              >
                {/* Header row: Student info, level, quota, and status pills */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full ${student.avatarBg} text-white font-bold flex items-center justify-center text-sm shadow-xs`}>
                      {student.nickname.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-slate-900 text-sm">{student.name}</h3>
                        <span className="text-xs text-slate-500">({student.nickname})</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                        <span>Wali: {student.parentRelation} {student.parentName}</span>
                        <span>·</span>
                        <span className="font-mono-data">{student.parentPhone}</span>
                      </div>
                    </div>
                  </div>

                  {/* Status buttons & Quota badge */}
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Remaining session badge */}
                    <div className={`text-xs px-2.5 py-1 rounded font-mono font-medium ${
                      student.remainingSessions <= 1 
                        ? 'bg-amber-100 text-amber-900' 
                        : 'bg-slate-100 text-slate-700'
                    }`}>
                      Sisa: <strong>{student.remainingSessions}</strong>/{student.totalSessions} sesi
                    </div>

                    {/* Status switcher: Hadir, Izin, Sakit, Alpa */}
                    <div className="inline-flex rounded-lg border border-slate-200 p-0.5 bg-slate-100 text-xs">
                      {(['Hadir', 'Izin', 'Sakit', 'Alpa'] as AttendanceStatus[]).map((st) => (
                        <button
                          key={st}
                          onClick={() => handleStatusChange(student.id, st)}
                          className={`px-3 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                            record.status === st
                              ? st === 'Hadir'
                                ? 'bg-emerald-600 text-white shadow-xs'
                                : st === 'Izin'
                                ? 'bg-sky-600 text-white shadow-xs'
                                : st === 'Sakit'
                                ? 'bg-amber-600 text-white shadow-xs'
                                : 'bg-rose-600 text-white shadow-xs'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          {st}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Body: Skills, Star Rating & Notes (Visible if Hadir) */}
                {isPresent && (
                  <div className="pt-4 grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Skills Checklist */}
                    <div className="space-y-2 lg:col-span-1">
                      <div className="text-xs font-semibold text-slate-700 flex items-center justify-between">
                        <span>Keterampilan yang Dilatih</span>
                        <span className="text-[11px] text-slate-400 font-normal">Pilih yang relevan</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {COMMON_SKILLS.map(skill => {
                          const isChecked = record.skillsPracticed.includes(skill);
                          return (
                            <button
                              key={skill}
                              onClick={() => handleToggleSkill(student.id, skill)}
                              className={`text-[11px] px-2.5 py-1 rounded-md transition-colors cursor-pointer text-left ${
                                isChecked
                                  ? 'bg-sky-600 text-white font-medium'
                                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                              }`}
                            >
                              {isChecked ? '✓ ' : '+ '}{skill}
                            </button>
                          );
                        })}
                      </div>

                      {/* Star Rating for discipline & enthusiasm */}
                      <div className="pt-2 flex items-center gap-2">
                        <span className="text-xs font-medium text-slate-600">Performa Hari Ini:</span>
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map(star => (
                            <button
                              key={star}
                              onClick={() => handleRatingChange(student.id, star)}
                              className="focus:outline-none cursor-pointer"
                            >
                              <Star 
                                className={`w-4 h-4 ${
                                  star <= record.starRating 
                                    ? 'fill-amber-400 text-amber-400' 
                                    : 'text-slate-300'
                                }`} 
                              />
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Coach Notes with Quick Preset Snippets */}
                    <div className="space-y-2 lg:col-span-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-700">Catatan & Evaluasi Pelatih untuk Wali</span>
                        <span className="text-slate-400 text-[11px]">Teks ini akan masuk ke chat WhatsApp</span>
                      </div>

                      {/* Quick snippets */}
                      <div className="flex items-center gap-1 overflow-x-auto pb-1 text-[11px]">
                        <span className="text-slate-400 shrink-0">Preset Cepat:</span>
                        {QUICK_NOTES.slice(0, 3).map((snippet, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleNotesChange(student.id, snippet)}
                            className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-0.5 rounded whitespace-nowrap shrink-0 transition-colors cursor-pointer"
                          >
                            Template {idx + 1}
                          </button>
                        ))}
                      </div>

                      <textarea
                        rows={3}
                        value={record.coachNotes}
                        onChange={(e) => handleNotesChange(student.id, e.target.value)}
                        placeholder="Contoh: Ananda Arkan latihan pernapasan gaya bebas 25m, posisi kepala sudah stabil dan berani tanpa papan..."
                        className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 focus:outline-none"
                      />
                    </div>
                  </div>
                )}

                {/* Footer Action Strip for this student */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2">
                    {isSent ? (
                      <span className="text-emerald-700 font-medium flex items-center gap-1.5 bg-emerald-50 px-2.5 py-1 rounded-md">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Laporan terkirim ke WhatsApp wali ({record.whatsappSentAt})</span>
                      </span>
                    ) : (
                      <span className="text-slate-500 flex items-center gap-1.5">
                        <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
                        <span>Laporan WhatsApp belum dikirim ke orang tua</span>
                      </span>
                    )}

                    {student.remainingSessions <= 1 && (
                      <span className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3 text-amber-600" />
                        <span>Auto-Notice: Pengingat kuota aktif</span>
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setPreviewStudentId(previewStudentId === student.id ? null : student.id)}
                      className="px-2.5 py-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>{previewStudentId === student.id ? 'Tutup Preview' : 'Preview Pesan'}</span>
                    </button>

                    <button
                      onClick={() => handleCopyText(student)}
                      className="px-2.5 py-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      {copiedId === student.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-600">Tersalin!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Salin Teks</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => handleSendWhatsAppSingle(student)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-colors shadow-xs cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Kirim WA ke Wali Murid</span>
                    </button>
                  </div>
                </div>

                {/* Inline Message Preview Drawer */}
                {previewStudentId === student.id && activeSchedule && (
                  <div className="mt-3 p-4 bg-emerald-950 text-emerald-50 rounded-lg text-xs font-mono space-y-2 border border-emerald-900 shadow-inner">
                    <div className="flex items-center justify-between text-emerald-400 font-sans font-semibold">
                      <span>Simulasi Tampilan WhatsApp ({student.parentName} - {student.parentPhone})</span>
                      <span className="text-[11px] font-normal">wa.me link ready</span>
                    </div>
                    <pre className="whitespace-pre-wrap font-sans text-xs text-slate-100 leading-relaxed bg-black/20 p-3 rounded border border-emerald-800/40">
                      {generateAttendanceMessage(student, activeSchedule, record, settings)}
                    </pre>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Broadcast / Batch WhatsApp Modal */}
      {showBlastModal && activeSchedule && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 space-y-5 max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Kirim Notifikasi Absensi WhatsApp Sekaligus
                </h2>
                <p className="text-xs text-slate-500">
                  Sesi: {activeSchedule.title} · {formatDisplayDate(selectedDate)}
                </p>
              </div>
              <button
                onClick={() => setShowBlastModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                &times;
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Sistem telah merangkum laporan presensi dan catatan pelatih untuk masing-masing wali murid. Klik tombol <strong>Kirim</strong> di samping nama wali untuk langsung meluncurkan pesan ke WhatsApp mereka.
            </p>

            <div className="space-y-3 divide-y divide-slate-100">
              {enrolledStudents.map((st) => {
                const rec = sessionAttendance[st.id];
                const msg = generateAttendanceMessage(st, activeSchedule, rec, settings);
                const waUrl = buildWaUrl(st.parentPhone, msg);
                const isSent = rec?.whatsappSent;

                return (
                  <div key={st.id} className="pt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-900 text-xs">{st.name}</span>
                        <span className="text-slate-400 text-xs">({rec?.status})</span>
                        {isSent && (
                          <span className="text-[11px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-medium">
                            Sudah Terkirim
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-500">
                        Wali: {st.parentName} ({st.parentPhone}) · Sisa: {st.remainingSessions} sesi
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <a
                        href={waUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => {
                          const now = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
                          setSessionAttendance(prev => ({
                            ...prev,
                            [st.id]: { ...rec, whatsappSent: true, whatsappSentAt: `${selectedDate} ${now}` }
                          }));
                          onLogWaMessage({
                            id: `log-blast-${Date.now()}-${st.id}`,
                            recipientName: st.parentName,
                            recipientPhone: st.parentPhone,
                            studentName: st.name,
                            type: 'Absensi Latihan',
                            timestamp: `${selectedDate} ${now}`,
                            messageText: msg,
                            status: 'Terkirim'
                          });
                        }}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Kirim WA</span>
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                onClick={() => setShowBlastModal(false)}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-xs font-medium hover:bg-slate-200 transition-colors"
              >
                Selesai
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
