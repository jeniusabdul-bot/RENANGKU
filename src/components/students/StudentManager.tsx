import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  Plus, 
  Edit3, 
  Trash2, 
  Eye, 
  MessageSquare, 
  Phone, 
  AlertCircle, 
  Award, 
  Activity, 
  Calendar,
  CheckCircle2
} from 'lucide-react';
import { 
  Student, 
  PackagePlan, 
  AttendanceRecord, 
  PaymentInvoice, 
  StudentLevel 
} from '../../types';
import { formatDisplayDate, buildWaUrl, formatRupiah } from '../../utils/whatsapp';

interface StudentManagerProps {
  students: Student[];
  packages: PackagePlan[];
  attendance: AttendanceRecord[];
  invoices: PaymentInvoice[];
  onAddStudent: (student: Student) => void;
  onUpdateStudent: (student: Student) => void;
  onDeleteStudent: (studentId: string) => void;
}

const STUDENT_LEVELS: StudentLevel[] = [
  'Pemula (Water Safety & Meluncur)',
  'Dasar (Gaya Dada & Bebas)',
  'Lanjutan (Gaya Punggung & Kupu)',
  'Prestasi & Tim Kompetisi'
];

export const StudentManager: React.FC<StudentManagerProps> = ({
  students,
  packages,
  attendance,
  invoices,
  onAddStudent,
  onUpdateStudent,
  onDeleteStudent
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [levelFilter, setLevelFilter] = useState('Semua');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [viewingStudent, setViewingStudent] = useState<Student | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [nickname, setNickname] = useState('');
  const [birthDate, setBirthDate] = useState('2016-05-15');
  const [gender, setGender] = useState<'L' | 'P'>('L');
  const [level, setLevel] = useState<StudentLevel>('Pemula (Water Safety & Meluncur)');
  const [parentName, setParentName] = useState('');
  const [parentPhone, setParentPhone] = useState('628');
  const [parentRelation, setParentRelation] = useState<'Ayah' | 'Ibu' | 'Wali'>('Ayah');
  const [medicalNotes, setMedicalNotes] = useState('Kondisi sehat.');
  const [packageId, setPackageId] = useState(packages[0]?.id || '');
  const [remainingSessions, setRemainingSessions] = useState(8);
  const [status, setStatus] = useState<'Aktif' | 'Cuti' | 'Selesai'>('Aktif');

  const filteredStudents = students.filter(st => {
    const matchesSearch = !searchTerm || 
      st.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      st.nickname.toLowerCase().includes(searchTerm.toLowerCase()) ||
      st.parentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      st.parentPhone.includes(searchTerm);

    const matchesLevel = levelFilter === 'Semua' || st.level === levelFilter;
    return matchesSearch && matchesLevel;
  });

  const handleOpenAdd = () => {
    setEditingStudent(null);
    setName('');
    setNickname('');
    setBirthDate('2016-05-15');
    setGender('L');
    setLevel('Pemula (Water Safety & Meluncur)');
    setParentName('');
    setParentPhone('628');
    setParentRelation('Ayah');
    setMedicalNotes('Tidak ada riwayat asma atau alergi khusus.');
    setPackageId(packages[0]?.id || '');
    setRemainingSessions(packages[0]?.sessionsCount || 8);
    setStatus('Aktif');
    setModalOpen(true);
  };

  const handleOpenEdit = (st: Student) => {
    setEditingStudent(st);
    setName(st.name);
    setNickname(st.nickname);
    setBirthDate(st.birthDate);
    setGender(st.gender);
    setLevel(st.level);
    setParentName(st.parentName);
    setParentPhone(st.parentPhone);
    setParentRelation(st.parentRelation);
    setMedicalNotes(st.medicalNotes);
    setPackageId(st.packageId);
    setRemainingSessions(st.remainingSessions);
    setStatus(st.status);
    setModalOpen(true);
  };

  const handleSaveStudent = (e: React.FormEvent) => {
    e.preventDefault();

    const selectedPkg = packages.find(p => p.id === packageId);
    const bgColors = ['bg-sky-500', 'bg-emerald-500', 'bg-indigo-500', 'bg-rose-500', 'bg-teal-500', 'bg-amber-500'];
    const randomBg = bgColors[Math.floor(Math.random() * bgColors.length)];

    const studentData: Student = {
      id: editingStudent ? editingStudent.id : `std-${Date.now()}`,
      name,
      nickname,
      birthDate,
      gender,
      level,
      parentName,
      parentPhone,
      parentRelation,
      medicalNotes,
      joinedDate: editingStudent ? editingStudent.joinedDate : new Date().toISOString().split('T')[0],
      packageId,
      totalSessions: selectedPkg ? selectedPkg.sessionsCount : 8,
      remainingSessions: Number(remainingSessions),
      status,
      avatarBg: editingStudent ? editingStudent.avatarBg : randomBg
    };

    if (editingStudent) {
      onUpdateStudent(studentData);
    } else {
      onAddStudent(studentData);
    }

    setModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">
            Database Murid & Data Wali
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Data profil perenang, riwayat medis, alokasi paket, dan kontak WhatsApp wali murid.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-4 py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-semibold transition-colors shadow-xs cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>+ Daftarkan Murid Baru</span>
        </button>
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setLevelFilter('Semua')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
              levelFilter === 'Semua' ? 'bg-slate-900 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Semua Tingkat ({students.length})
          </button>
          {STUDENT_LEVELS.map(lvl => {
            const shortName = lvl.split(' ')[0];
            return (
              <button
                key={lvl}
                onClick={() => setLevelFilter(lvl)}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                  levelFilter === lvl ? 'bg-slate-900 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {shortName}
              </button>
            );
          })}
        </div>

        <div className="w-full md:w-72">
          <input
            type="text"
            placeholder="Cari murid, nama wali, atau no telepon..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 rounded-lg border border-slate-200 focus:outline-none focus:border-sky-500 text-xs"
          />
        </div>
      </div>

      {/* Student Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredStudents.map(student => {
          const pkg = packages.find(p => p.id === student.packageId);
          const isLowQuota = student.remainingSessions <= 1;

          return (
            <div 
              key={student.id}
              className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between space-y-4 hover:border-slate-300 transition-all"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-11 h-11 rounded-full ${student.avatarBg} text-white font-bold flex items-center justify-center text-sm shadow-xs`}>
                      {student.nickname.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm leading-tight">{student.name}</h3>
                      <div className="text-xs text-slate-500 mt-0.5">
                        Panggilan: <strong>{student.nickname}</strong> · {student.gender === 'L' ? 'Laki-laki' : 'Perempuan'}
                      </div>
                    </div>
                  </div>

                  <span className={`text-[11px] px-2 py-0.5 rounded font-mono font-medium ${
                    student.status === 'Aktif' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {student.status}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs text-slate-600 pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Tingkat Kemampuan:</span>
                    <span className="font-medium text-slate-800 text-right">{student.level.split('(')[0]}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Kontak Wali:</span>
                    <span className="text-slate-800 text-right">{student.parentRelation} {student.parentName}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">WhatsApp:</span>
                    <a 
                      href={buildWaUrl(student.parentPhone, `Halo ${student.parentName}, salam dari pengelola les renang.`)}
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sky-600 hover:text-sky-800 font-mono-data font-semibold flex items-center gap-1"
                    >
                      <Phone className="w-3 h-3 text-emerald-600" />
                      <span>{student.parentPhone}</span>
                    </a>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-slate-400">Sisa Kuota Sesi:</span>
                    <span className={`font-mono-data tabular-nums font-bold ${
                      isLowQuota ? 'text-rose-600' : 'text-slate-900'
                    }`}>
                      {student.remainingSessions} / {student.totalSessions} Sesi
                    </span>
                  </div>

                  {/* Quota warning */}
                  {isLowQuota && (
                    <div className="p-2 bg-amber-50 border border-amber-200 rounded-md text-[11px] text-amber-800 flex items-center gap-1.5 mt-1">
                      <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span>Sisa sesi hampir habis, perlu renewal!</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom Card Actions */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  onClick={() => setViewingStudent(student)}
                  className="px-3 py-1.5 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs font-medium transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Detail Profil</span>
                </button>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEdit(student)}
                    className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
                    title="Edit Profil Murid"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Hapus murid "${student.name}" dari sistem?`)) {
                        onDeleteStudent(student.id);
                      }
                    }}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
                    title="Hapus Murid"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal: Tambah / Edit Murid */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto shadow-xl text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-base font-bold text-slate-900">
                {editingStudent ? 'Edit Data Murid & Kuota' : 'Pendaftaran Murid Les Baru'}
              </h2>
              <button 
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSaveStudent} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Nama Lengkap Murid *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Contoh: Arkan Daniswara"
                    className="w-full p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Nama Panggilan *</label>
                  <input
                    type="text"
                    required
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    placeholder="Contoh: Arkan"
                    className="w-full p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tanggal Lahir *</label>
                  <input
                    type="date"
                    required
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Jenis Kelamin *</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value as any)}
                    className="w-full p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-sky-500"
                  >
                    <option value="L">Laki-laki</option>
                    <option value="P">Perempuan</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Tingkat Kemampuan Renang *</label>
                <select
                  value={level}
                  onChange={(e) => setLevel(e.target.value as StudentLevel)}
                  className="w-full p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-sky-500"
                >
                  {STUDENT_LEVELS.map(lvl => (
                    <option key={lvl} value={lvl}>{lvl}</option>
                  ))}
                </select>
              </div>

              <div className="pt-2 border-t border-slate-100">
                <span className="font-semibold text-slate-900 block mb-2">Informasi Wali & WhatsApp</span>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-slate-600 mb-1">Hubungan</label>
                    <select
                      value={parentRelation}
                      onChange={(e) => setParentRelation(e.target.value as any)}
                      className="w-full p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-sky-500"
                    >
                      <option value="Ayah">Ayah</option>
                      <option value="Ibu">Ibu</option>
                      <option value="Wali">Wali</option>
                    </select>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-slate-600 mb-1">Nama Orang Tua / Wali *</label>
                    <input
                      type="text"
                      required
                      value={parentName}
                      onChange={(e) => setParentName(e.target.value)}
                      placeholder="Contoh: Hendra Daniswara"
                      className="w-full p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-sky-500"
                    />
                  </div>
                </div>

                <div className="mt-2">
                  <label className="block text-slate-600 mb-1">
                    No. WhatsApp Wali (format 628...) *
                  </label>
                  <input
                    type="text"
                    required
                    value={parentPhone}
                    onChange={(e) => setParentPhone(e.target.value)}
                    placeholder="Contoh: 6281234567890"
                    className="w-full p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-sky-500 font-mono-data"
                  />
                  <span className="text-[11px] text-slate-400 mt-0.5 block">
                    Digunakan untuk kirim laporan evaluasi latihan & bukti bayar
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100">
                <span className="font-semibold text-slate-900 block mb-2">Paket Les & Kuota Sesi</span>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-600 mb-1">Pilihan Paket Awal</label>
                    <select
                      value={packageId}
                      onChange={(e) => {
                        setPackageId(e.target.value);
                        const p = packages.find(pkg => pkg.id === e.target.value);
                        if (p && !editingStudent) setRemainingSessions(p.sessionsCount);
                      }}
                      className="w-full p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-sky-500"
                    >
                      {packages.map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-600 mb-1">Saldo Sesi Tersisa</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={remainingSessions}
                      onChange={(e) => setRemainingSessions(Number(e.target.value))}
                      className="w-full p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-sky-500 font-mono-data"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Catatan Medis / Riwayat Alergi</label>
                <textarea
                  rows={2}
                  value={medicalNotes}
                  onChange={(e) => setMedicalNotes(e.target.value)}
                  placeholder="Contoh: Ada riwayat asma ringan, telinga sensitif gunakan earplug..."
                  className="w-full p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-medium"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg font-semibold"
                >
                  Simpan Data Murid
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Detail Profil Murid & Riwayat Latihan */}
      {viewingStudent && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 space-y-5 max-h-[90vh] overflow-y-auto shadow-xl text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full ${viewingStudent.avatarBg} text-white font-bold flex items-center justify-center text-sm shadow-xs`}>
                  {viewingStudent.nickname.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">{viewingStudent.name}</h2>
                  <p className="text-xs text-slate-500">{viewingStudent.level}</p>
                </div>
              </div>
              <button 
                onClick={() => setViewingStudent(null)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                &times;
              </button>
            </div>

            {/* Quick Specs Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-100">
              <div>
                <span className="text-slate-400 block text-[11px]">Sisa Sesi</span>
                <span className="font-mono-data font-bold text-base text-slate-900">
                  {viewingStudent.remainingSessions} / {viewingStudent.totalSessions}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Bergabung</span>
                <span className="font-mono-data text-slate-800">{viewingStudent.joinedDate}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Wali Murid</span>
                <span className="text-slate-800 font-medium">{viewingStudent.parentName}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">WhatsApp</span>
                <a 
                  href={buildWaUrl(viewingStudent.parentPhone, 'Halo')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-700 font-mono-data font-bold"
                >
                  {viewingStudent.parentPhone}
                </a>
              </div>
            </div>

            {/* Medical notes callout */}
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-900">
              <span className="font-semibold block mb-0.5">Catatan Medis & Instruksi:</span>
              <span>{viewingStudent.medicalNotes}</span>
            </div>

            {/* Riwayat Absensi & Catatan Pelatih */}
            <div className="space-y-3">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Activity className="w-4 h-4 text-sky-600" />
                <span>Riwayat Latihan & Catatan Pelatih</span>
              </h3>

              {attendance.filter(a => a.studentId === viewingStudent.id).length === 0 ? (
                <p className="text-slate-400 text-xs italic">Belum ada catatan presensi latihan.</p>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {attendance
                    .filter(a => a.studentId === viewingStudent.id)
                    .map(rec => (
                      <div key={rec.id} className="p-3 bg-white rounded-lg border border-slate-200 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-mono-data font-semibold text-slate-800">{rec.date}</span>
                          <span className={`px-2 py-0.5 rounded text-[11px] font-medium ${
                            rec.status === 'Hadir' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'
                          }`}>
                            {rec.status}
                          </span>
                        </div>
                        <p className="text-slate-600 text-xs leading-relaxed italic">
                          "{rec.coachNotes}"
                        </p>
                        {rec.skillsPracticed.length > 0 && (
                          <div className="flex flex-wrap gap-1 pt-1">
                            {rec.skillsPracticed.map(s => (
                              <span key={s} className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded">
                                {s}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setViewingStudent(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
