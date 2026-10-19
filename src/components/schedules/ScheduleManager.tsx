import React, { useState } from 'react';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  MapPin, 
  User, 
  Plus, 
  Edit3, 
  Trash2, 
  Users, 
  CheckCircle2, 
  Filter,
  Check
} from 'lucide-react';
import { ScheduleSession, Student, DayOfWeek } from '../../types';

interface ScheduleManagerProps {
  schedules: ScheduleSession[];
  students: Student[];
  onAddSchedule: (schedule: ScheduleSession) => void;
  onUpdateSchedule: (schedule: ScheduleSession) => void;
  onDeleteSchedule: (scheduleId: string) => void;
  onNavigateToAttendance: (scheduleId: string) => void;
}

const DAYS_OF_WEEK: DayOfWeek[] = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];

export const ScheduleManager: React.FC<ScheduleManagerProps> = ({
  schedules,
  students,
  onAddSchedule,
  onUpdateSchedule,
  onDeleteSchedule,
  onNavigateToAttendance
}) => {
  const [selectedDayFilter, setSelectedDayFilter] = useState<string>('Semua');
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [editingSchedule, setEditingSchedule] = useState<ScheduleSession | null>(null);

  // Form states
  const [formTitle, setFormTitle] = useState('');
  const [formDay, setFormDay] = useState<DayOfWeek>('Sabtu');
  const [formStartTime, setFormStartTime] = useState('08:00');
  const [formEndTime, setFormEndTime] = useState('09:30');
  const [formLocation, setFormLocation] = useState('Kolam Renang Tirta Mas, Jalur 1');
  const [formCoachName, setFormCoachName] = useState('Coach Bagas Prasetyo');
  const [formCoachPhone, setFormCoachPhone] = useState('6281290908080');
  const [formCapacity, setFormCapacity] = useState<number>(5);
  const [formLevelBadge, setFormLevelBadge] = useState('Pemula');
  const [formStudentIds, setFormStudentIds] = useState<string[]>([]);

  const filteredSchedules = schedules.filter(s => {
    if (selectedDayFilter === 'Semua') return true;
    return s.dayOfWeek === selectedDayFilter;
  });

  const handleOpenAddModal = () => {
    setEditingSchedule(null);
    setFormTitle('Kelas Renang Anak');
    setFormDay('Sabtu');
    setFormStartTime('08:00');
    setFormEndTime('09:30');
    setFormLocation('Kolam Renang Tirta Mas, Jalur 1');
    setFormCoachName('Coach Bagas Prasetyo');
    setFormCoachPhone('6281290908080');
    setFormCapacity(5);
    setFormLevelBadge('Pemula');
    setFormStudentIds([]);
    setModalOpen(true);
  };

  const handleOpenEditModal = (sch: ScheduleSession) => {
    setEditingSchedule(sch);
    setFormTitle(sch.title);
    setFormDay(sch.dayOfWeek);
    setFormStartTime(sch.startTime);
    setFormEndTime(sch.endTime);
    setFormLocation(sch.poolLocation);
    setFormCoachName(sch.coachName);
    setFormCoachPhone(sch.coachPhone);
    setFormCapacity(sch.maxCapacity);
    setFormLevelBadge(sch.levelBadge);
    setFormStudentIds(sch.studentIds);
    setModalOpen(true);
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();

    const scheduleData: ScheduleSession = {
      id: editingSchedule ? editingSchedule.id : `sch-${Date.now()}`,
      title: formTitle,
      dayOfWeek: formDay,
      startTime: formStartTime,
      endTime: formEndTime,
      poolLocation: formLocation,
      coachName: formCoachName,
      coachPhone: formCoachPhone,
      studentIds: formStudentIds,
      maxCapacity: Number(formCapacity),
      levelBadge: formLevelBadge
    };

    if (editingSchedule) {
      onUpdateSchedule(scheduleData);
    } else {
      onAddSchedule(scheduleData);
    }

    setModalOpen(false);
  };

  const toggleStudentSelection = (stId: string) => {
    setFormStudentIds(prev => 
      prev.includes(stId) ? prev.filter(id => id !== stId) : [...prev, stId]
    );
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">
            Jadwal Latihan & Alokasi Sesi Murid
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Atur pembagian kelas renang, pelatih, lokasi kolam, dan daftar murid per sesi.
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="flex items-center gap-2 px-4 py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-semibold transition-colors shadow-xs cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>+ Tambah Sesi Kelas Baru</span>
        </button>
      </div>

      {/* Day Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        <button
          onClick={() => setSelectedDayFilter('Semua')}
          className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
            selectedDayFilter === 'Semua'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          Semua Hari ({schedules.length})
        </button>
        {DAYS_OF_WEEK.map(day => {
          const count = schedules.filter(s => s.dayOfWeek === day).length;
          return (
            <button
              key={day}
              onClick={() => setSelectedDayFilter(day)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
                selectedDayFilter === day
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {day} {count > 0 && `(${count})`}
            </button>
          );
        })}
      </div>

      {/* Schedules List Grid */}
      {filteredSchedules.length === 0 ? (
        <div className="bg-white p-12 rounded-xl border border-slate-200 text-center">
          <CalendarIcon className="w-10 h-10 text-slate-400 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-slate-800">Tidak ada jadwal untuk filter ini</h3>
          <p className="text-xs text-slate-500 mt-1 mb-4">Tambahkan sesi baru atau pilih hari lainnya.</p>
          <button
            onClick={handleOpenAddModal}
            className="px-4 py-2 bg-sky-600 text-white text-xs font-medium rounded-lg hover:bg-sky-700"
          >
            Buat Sesi Kelas Baru
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredSchedules.map((sch) => {
            const enrolled = students.filter(s => sch.studentIds.includes(s.id));
            const isFull = enrolled.length >= sch.maxCapacity;

            return (
              <div 
                key={sch.id}
                className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between space-y-4 hover:border-slate-300 transition-all"
              >
                <div className="space-y-3">
                  {/* Top line: Day and level badge */}
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-sky-700 bg-sky-50 px-2.5 py-1 rounded-md">
                      {sch.dayOfWeek}
                    </span>
                    <span className="text-slate-500 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                      {sch.levelBadge}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="font-bold text-slate-900 text-base leading-snug">
                    {sch.title}
                  </h3>

                  {/* Details */}
                  <div className="space-y-1.5 text-xs text-slate-600">
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span className="font-mono-data tabular-nums font-medium text-slate-800">
                        {sch.startTime} - {sch.endTime} WIB
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="line-clamp-1">{sch.poolLocation}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      <span>Pelatih: <strong className="text-slate-800">{sch.coachName}</strong></span>
                    </div>
                  </div>

                  {/* Capacity & Enrolled Students */}
                  <div className="pt-2 border-t border-slate-100 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500">Kuota Murid:</span>
                      <span className={`font-mono-data tabular-nums font-semibold ${isFull ? 'text-rose-600' : 'text-slate-700'}`}>
                        {enrolled.length} / {sch.maxCapacity} {isFull && '(Penuh)'}
                      </span>
                    </div>

                    {/* Progress bar */}
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${isFull ? 'bg-rose-500' : 'bg-sky-500'} rounded-full`}
                        style={{ width: `${Math.min(100, (enrolled.length / sch.maxCapacity) * 100)}%` }}
                      />
                    </div>

                    {/* Student chip list */}
                    <div className="flex flex-wrap gap-1 pt-1">
                      {enrolled.length === 0 ? (
                        <span className="text-xs text-slate-400 italic">Belum ada murid di sesi ini</span>
                      ) : (
                        enrolled.map(st => (
                          <span 
                            key={st.id}
                            className="text-[11px] bg-slate-50 border border-slate-200 text-slate-700 px-2 py-0.5 rounded"
                          >
                            {st.name} ({st.remainingSessions}s)
                          </span>
                        ))
                      )}
                    </div>
                  </div>
                </div>

                {/* Bottom Action strip */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEditModal(sch)}
                      className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
                      title="Edit Sesi"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Yakin ingin menghapus sesi "${sch.title}"?`)) {
                          onDeleteSchedule(sch.id);
                        }
                      }}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
                      title="Hapus Sesi"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <button
                    onClick={() => onNavigateToAttendance(sch.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-medium transition-colors cursor-pointer"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Presensi & WA</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Schedule Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-base font-bold text-slate-900">
                {editingSchedule ? 'Edit Sesi Latihan' : 'Tambah Sesi Latihan Baru'}
              </h2>
              <button 
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSaveForm} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Nama / Judul Sesi Kelas *
                </label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="Contoh: Kelas Pemula Anak Sesi Pagi"
                  className="w-full p-2.5 rounded-lg border border-slate-200 focus:border-sky-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Hari Latihan *
                  </label>
                  <select
                    value={formDay}
                    onChange={(e) => setFormDay(e.target.value as DayOfWeek)}
                    className="w-full p-2.5 rounded-lg border border-slate-200 focus:border-sky-500 focus:outline-none"
                  >
                    {DAYS_OF_WEEK.map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Kategori / Tingkat *
                  </label>
                  <select
                    value={formLevelBadge}
                    onChange={(e) => setFormLevelBadge(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-slate-200 focus:border-sky-500 focus:outline-none"
                  >
                    <option value="Pemula">Pemula (Water Safety)</option>
                    <option value="Dasar / Menengah">Dasar / Menengah</option>
                    <option value="Lanjutan">Lanjutan</option>
                    <option value="Prestasi">Prestasi / Tim</option>
                    <option value="Privat">Privat</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Jam Mulai (WIB) *
                  </label>
                  <input
                    type="time"
                    required
                    value={formStartTime}
                    onChange={(e) => setFormStartTime(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-slate-200 focus:border-sky-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Jam Selesai (WIB) *
                  </label>
                  <input
                    type="time"
                    required
                    value={formEndTime}
                    onChange={(e) => setFormEndTime(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-slate-200 focus:border-sky-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Lokasi Kolam Renang *
                </label>
                <input
                  type="text"
                  required
                  value={formLocation}
                  onChange={(e) => setFormLocation(e.target.value)}
                  placeholder="Contoh: Kolam Renang Tirta Mas, Jalur 1-2"
                  className="w-full p-2.5 rounded-lg border border-slate-200 focus:border-sky-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Nama Pelatih (Coach) *
                  </label>
                  <input
                    type="text"
                    required
                    value={formCoachName}
                    onChange={(e) => setFormCoachName(e.target.value)}
                    placeholder="Contoh: Coach Bagas Prasetyo"
                    className="w-full p-2.5 rounded-lg border border-slate-200 focus:border-sky-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Kapasitas Maksimal (Anak) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="30"
                    required
                    value={formCapacity}
                    onChange={(e) => setFormCapacity(Number(e.target.value))}
                    className="w-full p-2.5 rounded-lg border border-slate-200 focus:border-sky-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Student Multi-Select Checkboxes */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Alokasikan Murid ke Sesi Ini ({formStudentIds.length} Dipilih)
                </label>
                <div className="border border-slate-200 rounded-lg p-2 max-h-40 overflow-y-auto space-y-1">
                  {students.map(st => {
                    const isSelected = formStudentIds.includes(st.id);
                    return (
                      <div
                        key={st.id}
                        onClick={() => toggleStudentSelection(st.id)}
                        className={`p-2 rounded flex items-center justify-between cursor-pointer transition-colors ${
                          isSelected ? 'bg-sky-50 border border-sky-200' : 'hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {}}
                            className="rounded text-sky-600 focus:ring-sky-500"
                          />
                          <div>
                            <span className="font-semibold text-slate-800">{st.name}</span>
                            <span className="text-[11px] text-slate-400 ml-1.5">({st.level})</span>
                          </div>
                        </div>
                        <span className="text-[11px] font-mono text-slate-500">
                          Sisa {st.remainingSessions} sesi
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg font-medium transition-colors"
                >
                  Simpan Jadwal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
