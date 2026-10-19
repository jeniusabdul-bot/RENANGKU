import React, { useState } from 'react';
import { 
  MessageSquare, 
  Settings, 
  Send, 
  Check, 
  Copy, 
  Sparkles, 
  RotateCcw, 
  Smartphone,
  Info,
  CheckCheck
} from 'lucide-react';
import { AppSettings, Student, ScheduleSession, AttendanceRecord } from '../../types';
import { INITIAL_SETTINGS } from '../../data/initialData';
import { buildWaUrl } from '../../utils/whatsapp';

interface WhatsAppTemplateEditorProps {
  settings: AppSettings;
  onSaveSettings: (settings: AppSettings) => void;
  students: Student[];
  schedules: ScheduleSession[];
}

export const WhatsAppTemplateEditor: React.FC<WhatsAppTemplateEditorProps> = ({
  settings,
  onSaveSettings,
  students,
  schedules
}) => {
  const [activeTab, setActiveTab] = useState<'attendance' | 'paymentReminder' | 'receipt' | 'general'>('attendance');
  const [currentSettings, setCurrentSettings] = useState<AppSettings>(settings);
  const [testPhoneNumber, setTestPhoneNumber] = useState<string>('6281234567890');
  const [isSavedNotice, setIsSavedNotice] = useState<boolean>(false);

  const availableAttendanceTags = [
    { tag: '{wali_nama}', desc: 'Nama Wali Murid (Bpk/Ibu)' },
    { tag: '{murid_nama}', desc: 'Nama Lengkap Murid' },
    { tag: '{murid_panggilan}', desc: 'Nama Panggilan Murid' },
    { tag: '{akademi_nama}', desc: 'Nama Les Renang' },
    { tag: '{tanggal}', desc: 'Tanggal Sesi Latihan' },
    { tag: '{waktu}', desc: 'Jam Mulai - Selesai' },
    { tag: '{lokasi}', desc: 'Nama Kolam Renang' },
    { tag: '{pelatih_nama}', desc: 'Nama Pelatih (Coach)' },
    { tag: '{status_kehadiran}', desc: 'Hadir / Izin / Sakit' },
    { tag: '{catatan_pelatih}', desc: 'Catatan Evaluasi Pelatih' },
    { tag: '{keterampilan}', desc: 'Daftar Skill yang Dilatih' },
    { tag: '{sisa_sesi}', desc: 'Jumlah Sesi Tersisa' },
    { tag: '{peringatan_kuota}', desc: 'Peringatan otomatis jika sisa <= 1' }
  ];

  const availablePaymentTags = [
    { tag: '{wali_nama}', desc: 'Nama Wali' },
    { tag: '{murid_nama}', desc: 'Nama Murid' },
    { tag: '{nama_paket}', desc: 'Nama Paket Les' },
    { tag: '{no_invoice}', desc: 'Nomor Tagihan/Kuitansi' },
    { tag: '{nominal}', desc: 'Nominal Biaya' },
    { tag: '{jatuh_tempo}', desc: 'Tanggal Jatuh Tempo' },
    { tag: '{rekening_bank}', desc: 'Nomor Rekening Bank' },
    { tag: '{nama_pemilik_rekening}', desc: 'Atas Nama Rekening' },
    { tag: '{sisa_sesi}', desc: 'Sisa Kuota Sesi' }
  ];

  const insertTag = (tag: string) => {
    if (activeTab === 'attendance') {
      setCurrentSettings(prev => ({
        ...prev,
        attendanceWaTemplate: prev.attendanceWaTemplate + ' ' + tag
      }));
    } else if (activeTab === 'paymentReminder') {
      setCurrentSettings(prev => ({
        ...prev,
        paymentReminderTemplate: prev.paymentReminderTemplate + ' ' + tag
      }));
    } else if (activeTab === 'receipt') {
      setCurrentSettings(prev => ({
        ...prev,
        paymentReceiptTemplate: prev.paymentReceiptTemplate + ' ' + tag
      }));
    }
  };

  const handleSave = () => {
    onSaveSettings(currentSettings);
    setIsSavedNotice(true);
    setTimeout(() => setIsSavedNotice(false), 3000);
  };

  const handleResetDefaults = () => {
    if (confirm('Kembalikan format pesan WhatsApp ke template bawaan standar?')) {
      setCurrentSettings(INITIAL_SETTINGS);
      onSaveSettings(INITIAL_SETTINGS);
    }
  };

  // Preview generator for the phone screen
  const getRenderedPreview = (): string => {
    const sampleStudent = students[0] || {
      name: 'Arkan Daniswara',
      nickname: 'Arkan',
      parentName: 'Hendra Daniswara',
      parentRelation: 'Ayah',
      remainingSessions: 2
    };

    const sampleSchedule = schedules[0] || {
      startTime: '08:00',
      endTime: '09:30',
      poolLocation: 'Kolam Tirta Mas, Jalur 1',
      coachName: 'Coach Bagas'
    };

    let template = activeTab === 'attendance'
      ? currentSettings.attendanceWaTemplate
      : activeTab === 'paymentReminder'
      ? currentSettings.paymentReminderTemplate
      : currentSettings.paymentReceiptTemplate;

    const mockReplacements: Record<string, string> = {
      '{wali_nama}': `Bpk. ${sampleStudent.parentName}`,
      '{murid_nama}': sampleStudent.name,
      '{murid_panggilan}': sampleStudent.nickname,
      '{akademi_nama}': currentSettings.academyName,
      '{tanggal}': 'Sabtu, 18 Oktober 2026',
      '{waktu}': `${sampleSchedule.startTime} - ${sampleSchedule.endTime}`,
      '{lokasi}': sampleSchedule.poolLocation,
      '{pelatih_nama}': sampleSchedule.coachName,
      '{status_kehadiran}': 'Hadir',
      '{catatan_pelatih}': 'Ananda Arkan sangat fokus berlatih pernapasan gaya bebas 25m. Kayuhan tangan sudah stabil dan berani tanpa pelampung.',
      '{keterampilan}': '• Streamline Meluncur\n• Pernapasan Samping\n• Kicking 25m',
      '{sisa_sesi}': sampleStudent.remainingSessions.toString(),
      '{peringatan_kuota}': '',
      '{nama_paket}': 'Paket Reguler Anak (8 Pertemuan)',
      '{no_invoice}': 'INV/2026/X/001',
      '{nominal}': '650.000',
      '{jatuh_tempo}': 'Sabtu, 25 Oktober 2026',
      '{status_bayar}': 'Menunggu',
      '{rekening_bank}': currentSettings.bankAccount,
      '{nama_pemilik_rekening}': currentSettings.accountHolder,
      '{tanggal_lunas}': 'Sabtu, 18 Oktober 2026',
      '{jumlah_sesi}': '8',
      '{metode_bayar}': 'Transfer Bank'
    };

    for (const [k, v] of Object.entries(mockReplacements)) {
      template = template.replaceAll(k, v);
    }

    return template;
  };

  const handleTestSend = () => {
    const text = getRenderedPreview();
    const url = buildWaUrl(testPhoneNumber, text);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">
            Pengaturan Format Pesan WhatsApp & Akademi
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Kustomisasi template notifikasi otomatis yang dikirimkan ke WhatsApp orang tua murid setelah sesi latihan dan pembayaran.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleResetDefaults}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Template</span>
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-semibold transition-colors shadow-xs cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>Simpan Perubahan</span>
          </button>
        </div>
      </div>

      {isSavedNotice && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Pengaturan template WhatsApp berhasil diperbarui dan disimpan!</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('attendance')}
          className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
            activeTab === 'attendance' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Format Absensi Latihan Selesai
        </button>
        <button
          onClick={() => setActiveTab('paymentReminder')}
          className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
            activeTab === 'paymentReminder' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Format Tagihan & Pengingat SPP
        </button>
        <button
          onClick={() => setActiveTab('receipt')}
          className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
            activeTab === 'receipt' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Format Kuitansi Lunas
        </button>
        <button
          onClick={() => setActiveTab('general')}
          className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
            activeTab === 'general' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Profil Akademi & Rekening
        </button>
      </div>

      {/* Main Grid: Editor on Left, Live Phone Simulator on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Template Editor */}
        <div className="lg:col-span-7 space-y-5">
          {activeTab === 'general' ? (
            <div className="bg-white p-6 rounded-xl border border-slate-200 space-y-4 shadow-xs text-xs">
              <h3 className="text-sm font-bold text-slate-900 mb-2">Informasi Les Renang & Rekening Bank</h3>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nama Akademi / Les Renang</label>
                <input
                  type="text"
                  value={currentSettings.academyName}
                  onChange={(e) => setCurrentSettings(prev => ({ ...prev, academyName: e.target.value }))}
                  className="w-full p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Slogan / Tagline</label>
                <input
                  type="text"
                  value={currentSettings.tagline}
                  onChange={(e) => setCurrentSettings(prev => ({ ...prev, tagline: e.target.value }))}
                  className="w-full p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Nomor WhatsApp Resmi Admin</label>
                  <input
                    type="text"
                    value={currentSettings.phoneNumber}
                    onChange={(e) => setCurrentSettings(prev => ({ ...prev, phoneNumber: e.target.value }))}
                    className="w-full p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-sky-500 font-mono-data"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Email Resmi</label>
                  <input
                    type="email"
                    value={currentSettings.email}
                    onChange={(e) => setCurrentSettings(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Alamat Kolam / Kantor</label>
                <textarea
                  rows={2}
                  value={currentSettings.address}
                  onChange={(e) => setCurrentSettings(prev => ({ ...prev, address: e.target.value }))}
                  className="w-full p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-100">
                <span className="font-semibold text-slate-900 block mb-2">Rekening Pembayaran SPP</span>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-600 mb-1">Nama Bank & No. Rekening</label>
                    <input
                      type="text"
                      value={currentSettings.bankAccount}
                      onChange={(e) => setCurrentSettings(prev => ({ ...prev, bankAccount: e.target.value }))}
                      placeholder="BCA: 872-098-7651"
                      className="w-full p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-sky-500 font-mono-data"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 mb-1">Atas Nama Rekening</label>
                    <input
                      type="text"
                      value={currentSettings.accountHolder}
                      onChange={(e) => setCurrentSettings(prev => ({ ...prev, accountHolder: e.target.value }))}
                      placeholder="AkuatikPro Tirta Berjaya"
                      className="w-full p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-sky-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white p-6 rounded-xl border border-slate-200 space-y-4 shadow-xs text-xs">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-800">
                  {activeTab === 'attendance' && 'Template Laporan Selesai Latihan (Presensi)'}
                  {activeTab === 'paymentReminder' && 'Template Pengingat Tagihan SPP Murid'}
                  {activeTab === 'receipt' && 'Template Bukti Pembayaran / Kuitansi Resmi'}
                </span>
                <span className="text-[11px] text-slate-400">Gunakan tag variabel di bawah</span>
              </div>

              {/* Tag inserter */}
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 space-y-1.5">
                <span className="text-[11px] font-semibold text-slate-700 block">
                  Klik tag untuk disisipkan ke pesan:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {(activeTab === 'attendance' ? availableAttendanceTags : availablePaymentTags).map(item => (
                    <button
                      key={item.tag}
                      type="button"
                      onClick={() => insertTag(item.tag)}
                      title={item.desc}
                      className="bg-white hover:bg-sky-50 text-sky-700 border border-slate-200 hover:border-sky-300 font-mono-data text-[11px] px-2 py-0.5 rounded transition-colors cursor-pointer"
                    >
                      + {item.tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* Textarea */}
              <div>
                <textarea
                  rows={14}
                  value={
                    activeTab === 'attendance'
                      ? currentSettings.attendanceWaTemplate
                      : activeTab === 'paymentReminder'
                      ? currentSettings.paymentReminderTemplate
                      : currentSettings.paymentReceiptTemplate
                  }
                  onChange={(e) => {
                    const val = e.target.value;
                    if (activeTab === 'attendance') {
                      setCurrentSettings(prev => ({ ...prev, attendanceWaTemplate: val }));
                    } else if (activeTab === 'paymentReminder') {
                      setCurrentSettings(prev => ({ ...prev, paymentReminderTemplate: val }));
                    } else {
                      setCurrentSettings(prev => ({ ...prev, paymentReceiptTemplate: val }));
                    }
                  }}
                  className="w-full p-3 font-mono text-xs rounded-lg border border-slate-200 focus:outline-none focus:border-sky-500 leading-relaxed"
                />
              </div>

              {/* Test send tester */}
              <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-slate-500 text-[11px]">Uji kirim ke No. WA:</span>
                  <input
                    type="text"
                    value={testPhoneNumber}
                    onChange={(e) => setTestPhoneNumber(e.target.value)}
                    placeholder="628123456789"
                    className="p-1.5 px-2 bg-slate-50 border border-slate-200 rounded font-mono-data text-xs w-36"
                  />
                </div>
                <button
                  onClick={handleTestSend}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-medium cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Kirim Uji Coba WA</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Live Phone Mockup Preview */}
        <div className="lg:col-span-5">
          <div className="sticky top-24">
            <div className="text-xs font-semibold text-slate-700 mb-2 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Smartphone className="w-4 h-4 text-slate-500" />
                <span>Simulasi Layar WhatsApp Wali Murid</span>
              </span>
              <span className="text-[11px] text-slate-400">Live Preview</span>
            </div>

            {/* Smartphone casing */}
            <div className="w-full max-w-sm mx-auto bg-slate-900 p-3 rounded-[32px] shadow-2xl border-4 border-slate-800">
              {/* Screen */}
              <div className="bg-[#0b141a] rounded-[24px] overflow-hidden flex flex-col h-[540px]">
                {/* WhatsApp Chat Topbar */}
                <div className="bg-[#202c33] text-white p-3 flex items-center gap-2.5 border-b border-[#2a3942]">
                  <div className="w-7 h-7 rounded-full bg-sky-500 flex items-center justify-center text-xs font-bold text-white">
                    AP
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-xs text-slate-100 truncate">
                      {currentSettings.academyName}
                    </div>
                    <div className="text-[10px] text-emerald-400">online</div>
                  </div>
                </div>

                {/* WhatsApp Chat Body */}
                <div className="flex-1 p-3 overflow-y-auto space-y-2 bg-[#0b141a] bg-opacity-90">
                  <div className="text-center my-2">
                    <span className="bg-[#182229] text-[#8696a0] text-[10px] px-2 py-0.5 rounded-md">
                      HARI INI
                    </span>
                  </div>

                  {/* Incoming bubble from Academy */}
                  <div className="flex justify-start">
                    <div className="max-w-[92%] bg-[#005c4b] text-[#e9edef] rounded-lg p-3 text-xs leading-relaxed shadow-sm relative space-y-1">
                      <pre className="whitespace-pre-wrap font-sans text-xs break-words">
                        {getRenderedPreview()}
                      </pre>
                      <div className="flex items-center justify-end gap-1 text-[10px] text-[#8696a0] pt-1">
                        <span>{new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</span>
                        <CheckCheck className="w-3.5 h-3.5 text-[#53bdeb]" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Simulated Chat Input */}
                <div className="bg-[#202c33] p-2 flex items-center gap-2 text-[#8696a0] text-xs">
                  <div className="flex-1 bg-[#2a3942] rounded-full px-3 py-1.5 text-[11px] text-[#8696a0]">
                    Ketik pesan...
                  </div>
                  <div className="w-7 h-7 rounded-full bg-[#00a884] text-white flex items-center justify-center">
                    <Send className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
