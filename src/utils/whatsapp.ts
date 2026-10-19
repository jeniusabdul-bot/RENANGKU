import { Student, ScheduleSession, AttendanceRecord, PaymentInvoice, AppSettings } from '../types';

export const cleanPhoneNumber = (phone: string): string => {
  let cleaned = phone.replace(/[^0-9]/g, '');
  if (cleaned.startsWith('0')) {
    cleaned = '62' + cleaned.substring(1);
  } else if (cleaned.startsWith('8')) {
    cleaned = '628' + cleaned.substring(1);
  }
  return cleaned;
};

export const formatRupiah = (num: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(num);
};

export const formatDisplayDate = (dateStr: string): string => {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch {
    return dateStr;
  }
};

export const generateAttendanceMessage = (
  student: Student,
  schedule: ScheduleSession,
  attendance: AttendanceRecord,
  settings: AppSettings
): string => {
  let template = settings.attendanceWaTemplate;

  const quotaWarning = student.remainingSessions <= 1 
    ? `\n⚠️ *Pemberitahuan Kuota:* Sisa sesi latihan ananda tersisa *${student.remainingSessions} sesi lagi*. Mohon dapat melakukan perpanjangan paket agar jadwal latihan ananda tetap terjamin.`
    : '';

  const skillsText = attendance.skillsPracticed.length > 0 
    ? attendance.skillsPracticed.map(s => `• ${s}`).join('\n')
    : '• Adaptasi air & penguatan stamina';

  const replacements: Record<string, string> = {
    '{wali_nama}': `${student.parentRelation === 'Ayah' ? 'Bpk.' : student.parentRelation === 'Ibu' ? 'Ibu' : 'Bpk/Ibu'} ${student.parentName}`,
    '{murid_nama}': student.name,
    '{murid_panggilan}': student.nickname,
    '{akademi_nama}': settings.academyName,
    '{tanggal}': formatDisplayDate(attendance.date),
    '{waktu}': `${schedule.startTime} - ${schedule.endTime}`,
    '{lokasi}': schedule.poolLocation,
    '{pelatih_nama}': schedule.coachName,
    '{status_kehadiran}': attendance.status,
    '{catatan_pelatih}': attendance.coachNotes || 'Ananda mengikuti latihan dengan sangat baik, bersemangat dan disiplin.',
    '{keterampilan}': skillsText,
    '{sisa_sesi}': student.remainingSessions.toString(),
    '{peringatan_kuota}': quotaWarning
  };

  for (const [key, val] of Object.entries(replacements)) {
    template = template.replaceAll(key, val);
  }

  return template;
};

export const generatePaymentReminderMessage = (
  student: Student,
  invoice: PaymentInvoice,
  packageName: string,
  settings: AppSettings
): string => {
  let template = settings.paymentReminderTemplate;

  const replacements: Record<string, string> = {
    '{wali_nama}': `${student.parentRelation === 'Ayah' ? 'Bpk.' : student.parentRelation === 'Ibu' ? 'Ibu' : 'Bpk/Ibu'} ${student.parentName}`,
    '{murid_nama}': student.name,
    '{nama_paket}': packageName,
    '{no_invoice}': invoice.invoiceNumber,
    '{nominal}': new Intl.NumberFormat('id-ID').format(invoice.amount),
    '{jatuh_tempo}': formatDisplayDate(invoice.dueDate),
    '{status_bayar}': invoice.status,
    '{rekening_bank}': settings.bankAccount,
    '{nama_pemilik_rekening}': settings.accountHolder,
    '{sisa_sesi}': student.remainingSessions.toString(),
    '{akademi_nama}': settings.academyName
  };

  for (const [key, val] of Object.entries(replacements)) {
    template = template.replaceAll(key, val);
  }

  return template;
};

export const generatePaymentReceiptMessage = (
  student: Student,
  invoice: PaymentInvoice,
  packageName: string,
  sessionsCount: number,
  settings: AppSettings
): string => {
  let template = settings.paymentReceiptTemplate;

  const replacements: Record<string, string> = {
    '{wali_nama}': `${student.parentRelation === 'Ayah' ? 'Bpk.' : student.parentRelation === 'Ibu' ? 'Ibu' : 'Bpk/Ibu'} ${student.parentName}`,
    '{murid_nama}': student.name,
    '{akademi_nama}': settings.academyName,
    '{no_invoice}': invoice.invoiceNumber,
    '{tanggal_lunas}': invoice.paidDate ? formatDisplayDate(invoice.paidDate) : formatDisplayDate(new Date().toISOString().split('T')[0]),
    '{nama_paket}': packageName,
    '{jumlah_sesi}': sessionsCount.toString(),
    '{metode_bayar}': invoice.paymentMethod || 'Transfer Bank',
    '{nominal}': new Intl.NumberFormat('id-ID').format(invoice.amount),
    '{sisa_sesi}': student.remainingSessions.toString()
  };

  for (const [key, val] of Object.entries(replacements)) {
    template = template.replaceAll(key, val);
  }

  return template;
};

export const buildWaUrl = (phone: string, text: string): string => {
  const cleaned = cleanPhoneNumber(phone);
  return `https://wa.me/${cleaned}?text=${encodeURIComponent(text)}`;
};
