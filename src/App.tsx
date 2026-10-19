import React, { useState, useEffect } from 'react';
import { 
  getStoredStudents, 
  setStoredStudents,
  getStoredPackages, 
  setStoredPackages,
  getStoredSchedules, 
  setStoredSchedules,
  getStoredAttendance, 
  setStoredAttendance,
  getStoredInvoices, 
  setStoredInvoices,
  getStoredSettings, 
  setStoredSettings,
  getStoredWaLogs, 
  appendWaLog,
  resetAllDataToDefault 
} from './services/storage';
import { 
  Student, 
  ScheduleSession, 
  AttendanceRecord, 
  PaymentInvoice, 
  PackagePlan, 
  AppSettings, 
  WhatsAppMessageLog 
} from './types';
import { Header } from './components/layout/Header';
import { DashboardOverview } from './components/dashboard/DashboardOverview';
import { ScheduleManager } from './components/schedules/ScheduleManager';
import { AttendanceSession } from './components/attendance/AttendanceSession';
import { PaymentManager } from './components/payments/PaymentManager';
import { StudentManager } from './components/students/StudentManager';
import { WhatsAppTemplateEditor } from './components/templates/WhatsAppTemplateEditor';
import { generatePaymentReminderMessage, buildWaUrl } from './utils/whatsapp';
import { Download, Upload, RotateCcw, ShieldCheck } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [targetScheduleId, setTargetScheduleId] = useState<string | undefined>(undefined);

  // Core domain state
  const [students, setStudents] = useState<Student[]>(getStoredStudents);
  const [packages, setPackages] = useState<PackagePlan[]>(getStoredPackages);
  const [schedules, setSchedules] = useState<ScheduleSession[]>(getStoredSchedules);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>(getStoredAttendance);
  const [invoices, setInvoices] = useState<PaymentInvoice[]>(getStoredInvoices);
  const [settings, setSettings] = useState<AppSettings>(getStoredSettings);
  const [waLogs, setWaLogs] = useState<WhatsAppMessageLog[]>(getStoredWaLogs);

  // Sync to localStorage whenever states change
  useEffect(() => {
    setStoredStudents(students);
  }, [students]);

  useEffect(() => {
    setStoredPackages(packages);
  }, [packages]);

  useEffect(() => {
    setStoredSchedules(schedules);
  }, [schedules]);

  useEffect(() => {
    setStoredAttendance(attendance);
  }, [attendance]);

  useEffect(() => {
    setStoredInvoices(invoices);
  }, [invoices]);

  useEffect(() => {
    setStoredSettings(settings);
  }, [settings]);

  // Navigation handlers
  const handleNavigate = (tab: string, contextId?: string) => {
    if (contextId) {
      setTargetScheduleId(contextId);
    }
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Student handlers
  const handleAddStudent = (student: Student) => {
    setStudents(prev => [student, ...prev]);
  };

  const handleUpdateStudent = (student: Student) => {
    setStudents(prev => prev.map(s => s.id === student.id ? student : s));
  };

  const handleDeleteStudent = (studentId: string) => {
    setStudents(prev => prev.filter(s => s.id !== studentId));
  };

  // Schedule handlers
  const handleAddSchedule = (schedule: ScheduleSession) => {
    setSchedules(prev => [...prev, schedule]);
  };

  const handleUpdateSchedule = (schedule: ScheduleSession) => {
    setSchedules(prev => prev.map(s => s.id === schedule.id ? schedule : s));
  };

  const handleDeleteSchedule = (scheduleId: string) => {
    setSchedules(prev => prev.filter(s => s.id !== scheduleId));
  };

  // Attendance handlers
  const handleSaveAttendance = (records: AttendanceRecord[], updatedStudents: Student[]) => {
    setAttendance(prev => {
      const map = new Map(prev.map(r => [r.id, r]));
      records.forEach(r => map.set(r.id, r));
      return Array.from(map.values());
    });
    setStudents(updatedStudents);
  };

  // Payment handlers
  const handleAddInvoice = (invoice: PaymentInvoice) => {
    setInvoices(prev => [invoice, ...prev]);
  };

  const handleUpdateInvoice = (invoice: PaymentInvoice) => {
    setInvoices(prev => prev.map(i => i.id === invoice.id ? invoice : i));
  };

  const handleRecordPayment = (
    invoiceId: string, 
    method: 'Transfer Bank' | 'QRIS' | 'Tunai / Cash', 
    note: string
  ) => {
    const targetInvoice = invoices.find(i => i.id === invoiceId);
    if (!targetInvoice) return;

    const todayStr = new Date().toISOString().split('T')[0];
    const updatedInvoice: PaymentInvoice = {
      ...targetInvoice,
      status: 'Lunas',
      paidDate: todayStr,
      paymentMethod: method,
      notes: note
    };

    setInvoices(prev => prev.map(i => i.id === invoiceId ? updatedInvoice : i));

    // Auto-replenish student remaining sessions based on package!
    const targetPackage = packages.find(p => p.id === targetInvoice.packageId);
    if (targetPackage) {
      setStudents(prev => prev.map(s => {
        if (s.id === targetInvoice.studentId) {
          return {
            ...s,
            remainingSessions: s.remainingSessions + targetPackage.sessionsCount
          };
        }
        return s;
      }));
    }
  };

  // WhatsApp logs handler
  const handleLogWaMessage = (log: WhatsAppMessageLog) => {
    const updated = appendWaLog(log);
    setWaLogs(updated);
  };

  // Direct trigger from dashboard for low quota students
  const handleSendWaReminder = (student: Student, invoice: PaymentInvoice) => {
    const pkg = packages.find(p => p.id === invoice.packageId);
    if (!pkg) return;

    const msg = generatePaymentReminderMessage(student, invoice, pkg.name, settings);
    const waUrl = buildWaUrl(student.parentPhone, msg);

    handleUpdateInvoice({
      ...invoice,
      whatsappSent: true
    });

    handleLogWaMessage({
      id: `log-dash-${Date.now()}`,
      recipientName: student.parentName,
      recipientPhone: student.parentPhone,
      studentName: student.name,
      type: 'Pengingat Pembayaran',
      timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      messageText: msg,
      status: 'Terkirim'
    });

    window.open(waUrl, '_blank', 'noopener,noreferrer');
  };

  // Export & Import backup JSON
  const handleExportData = () => {
    const fullBackup = {
      students,
      packages,
      schedules,
      attendance,
      invoices,
      settings,
      waLogs,
      exportedAt: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(fullBackup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup_les_renang_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.students) setStudents(parsed.students);
        if (parsed.schedules) setSchedules(parsed.schedules);
        if (parsed.attendance) setAttendance(parsed.attendance);
        if (parsed.invoices) setInvoices(parsed.invoices);
        if (parsed.settings) setSettings(parsed.settings);
        if (parsed.waLogs) setWaLogs(parsed.waLogs);
        alert('Data les renang berhasil dipulihkan dari file backup!');
      } catch (err) {
        alert('Format file JSON tidak valid.');
      }
    };
    reader.readAsText(file);
  };

  const handleResetData = () => {
    if (confirm('Kembalikan semua data les renang ke data demo bawaan? Data custom akan terhapus.')) {
      resetAllDataToDefault();
      setStudents(getStoredStudents());
      setPackages(getStoredPackages());
      setSchedules(getStoredSchedules());
      setAttendance(getStoredAttendance());
      setInvoices(getStoredInvoices());
      setSettings(getStoredSettings());
      setWaLogs(getStoredWaLogs());
    }
  };

  const pendingAttendanceWa = attendance.filter(a => !a.whatsappSent && a.status === 'Hadir').length;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-sky-500 selection:text-white">
      {/* Strict 3-zone Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={(t) => {
          setTargetScheduleId(undefined);
          setActiveTab(t);
        }}
        pendingWaCount={pendingAttendanceWa}
        onQuickAttendanceClick={() => {
          setTargetScheduleId(schedules[0]?.id);
          setActiveTab('attendance');
        }}
      />

      {/* Main Viewport Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        {activeTab === 'dashboard' && (
          <DashboardOverview
            students={students}
            schedules={schedules}
            attendance={attendance}
            invoices={invoices}
            packages={packages}
            waLogs={waLogs}
            settings={settings}
            onNavigate={handleNavigate}
            onSendWaReminder={handleSendWaReminder}
          />
        )}

        {activeTab === 'schedules' && (
          <ScheduleManager
            schedules={schedules}
            students={students}
            onAddSchedule={handleAddSchedule}
            onUpdateSchedule={handleUpdateSchedule}
            onDeleteSchedule={handleDeleteSchedule}
            onNavigateToAttendance={(schId) => handleNavigate('attendance', schId)}
          />
        )}

        {activeTab === 'attendance' && (
          <AttendanceSession
            students={students}
            schedules={schedules}
            attendance={attendance}
            settings={settings}
            preselectedScheduleId={targetScheduleId}
            onSaveAttendance={handleSaveAttendance}
            onLogWaMessage={handleLogWaMessage}
          />
        )}

        {activeTab === 'payments' && (
          <PaymentManager
            invoices={invoices}
            students={students}
            packages={packages}
            settings={settings}
            onAddInvoice={handleAddInvoice}
            onUpdateInvoice={handleUpdateInvoice}
            onRecordPayment={handleRecordPayment}
            onLogWaMessage={handleLogWaMessage}
          />
        )}

        {activeTab === 'students' && (
          <StudentManager
            students={students}
            packages={packages}
            attendance={attendance}
            invoices={invoices}
            onAddStudent={handleAddStudent}
            onUpdateStudent={handleUpdateStudent}
            onDeleteStudent={handleDeleteStudent}
          />
        )}

        {activeTab === 'templates' && (
          <WhatsAppTemplateEditor
            settings={settings}
            onSaveSettings={setSettings}
            students={students}
            schedules={schedules}
          />
        )}
      </main>

      {/* Quiet, Functional Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 mt-12 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">{settings.academyName}</span>
            <span>·</span>
            <span>Sistem Operasional Les Renang & WhatsApp Otomatis</span>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <button
              onClick={handleExportData}
              className="hover:text-slate-900 transition-colors flex items-center gap-1 cursor-pointer"
              title="Download cadangan data JSON"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Ekspor Backup</span>
            </button>

            <label className="hover:text-slate-900 transition-colors flex items-center gap-1 cursor-pointer">
              <Upload className="w-3.5 h-3.5" />
              <span>Impor Backup</span>
              <input 
                type="file" 
                accept=".json" 
                onChange={handleImportData} 
                className="hidden" 
              />
            </label>

            <button
              onClick={handleResetData}
              className="text-slate-400 hover:text-rose-600 transition-colors flex items-center gap-1 cursor-pointer"
              title="Kembalikan data ke awal demo"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Data Demo</span>
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
