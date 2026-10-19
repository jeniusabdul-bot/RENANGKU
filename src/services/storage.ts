import { 
  Student, 
  PackagePlan, 
  ScheduleSession, 
  AttendanceRecord, 
  PaymentInvoice, 
  AppSettings,
  WhatsAppMessageLog
} from '../types';
import { 
  INITIAL_STUDENTS, 
  INITIAL_PACKAGES, 
  INITIAL_SCHEDULES, 
  INITIAL_ATTENDANCE, 
  INITIAL_INVOICES, 
  INITIAL_SETTINGS,
  INITIAL_WA_LOGS 
} from '../data/initialData';

const STORAGE_KEYS = {
  STUDENTS: 'akuatik_students_v1',
  PACKAGES: 'akuatik_packages_v1',
  SCHEDULES: 'akuatik_schedules_v1',
  ATTENDANCE: 'akuatik_attendance_v1',
  INVOICES: 'akuatik_invoices_v1',
  SETTINGS: 'akuatik_settings_v1',
  WA_LOGS: 'akuatik_walogs_v1'
};

export const getStoredStudents = (): Student[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.STUDENTS);
    return raw ? JSON.parse(raw) : INITIAL_STUDENTS;
  } catch {
    return INITIAL_STUDENTS;
  }
};

export const setStoredStudents = (students: Student[]) => {
  localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));
};

export const getStoredPackages = (): PackagePlan[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PACKAGES);
    return raw ? JSON.parse(raw) : INITIAL_PACKAGES;
  } catch {
    return INITIAL_PACKAGES;
  }
};

export const setStoredPackages = (packages: PackagePlan[]) => {
  localStorage.setItem(STORAGE_KEYS.PACKAGES, JSON.stringify(packages));
};

export const getStoredSchedules = (): ScheduleSession[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SCHEDULES);
    return raw ? JSON.parse(raw) : INITIAL_SCHEDULES;
  } catch {
    return INITIAL_SCHEDULES;
  }
};

export const setStoredSchedules = (schedules: ScheduleSession[]) => {
  localStorage.setItem(STORAGE_KEYS.SCHEDULES, JSON.stringify(schedules));
};

export const getStoredAttendance = (): AttendanceRecord[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ATTENDANCE);
    return raw ? JSON.parse(raw) : INITIAL_ATTENDANCE;
  } catch {
    return INITIAL_ATTENDANCE;
  }
};

export const setStoredAttendance = (records: AttendanceRecord[]) => {
  localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(records));
};

export const getStoredInvoices = (): PaymentInvoice[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.INVOICES);
    return raw ? JSON.parse(raw) : INITIAL_INVOICES;
  } catch {
    return INITIAL_INVOICES;
  }
};

export const setStoredInvoices = (invoices: PaymentInvoice[]) => {
  localStorage.setItem(STORAGE_KEYS.INVOICES, JSON.stringify(invoices));
};

export const getStoredSettings = (): AppSettings => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    return raw ? JSON.parse(raw) : INITIAL_SETTINGS;
  } catch {
    return INITIAL_SETTINGS;
  }
};

export const setStoredSettings = (settings: AppSettings) => {
  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
};

export const getStoredWaLogs = (): WhatsAppMessageLog[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.WA_LOGS);
    return raw ? JSON.parse(raw) : INITIAL_WA_LOGS;
  } catch {
    return INITIAL_WA_LOGS;
  }
};

export const appendWaLog = (log: WhatsAppMessageLog) => {
  const current = getStoredWaLogs();
  const updated = [log, ...current];
  localStorage.setItem(STORAGE_KEYS.WA_LOGS, JSON.stringify(updated));
  return updated;
};

export const resetAllDataToDefault = () => {
  localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(INITIAL_STUDENTS));
  localStorage.setItem(STORAGE_KEYS.PACKAGES, JSON.stringify(INITIAL_PACKAGES));
  localStorage.setItem(STORAGE_KEYS.SCHEDULES, JSON.stringify(INITIAL_SCHEDULES));
  localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(INITIAL_ATTENDANCE));
  localStorage.setItem(STORAGE_KEYS.INVOICES, JSON.stringify(INITIAL_INVOICES));
  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(INITIAL_SETTINGS));
  localStorage.setItem(STORAGE_KEYS.WA_LOGS, JSON.stringify(INITIAL_WA_LOGS));
};
