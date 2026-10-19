import React, { useState } from 'react';
import { 
  CreditCard, 
  Send, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Plus, 
  Printer, 
  Download, 
  Filter, 
  Share2, 
  Check, 
  User, 
  FileText 
} from 'lucide-react';
import { 
  PaymentInvoice, 
  Student, 
  PackagePlan, 
  AppSettings, 
  PaymentStatus,
  WhatsAppMessageLog 
} from '../../types';
import { 
  formatRupiah, 
  formatDisplayDate, 
  buildWaUrl, 
  generatePaymentReminderMessage, 
  generatePaymentReceiptMessage 
} from '../../utils/whatsapp';

interface PaymentManagerProps {
  invoices: PaymentInvoice[];
  students: Student[];
  packages: PackagePlan[];
  settings: AppSettings;
  onAddInvoice: (invoice: PaymentInvoice) => void;
  onUpdateInvoice: (invoice: PaymentInvoice) => void;
  onRecordPayment: (invoiceId: string, method: 'Transfer Bank' | 'QRIS' | 'Tunai / Cash', note: string) => void;
  onLogWaMessage: (log: WhatsAppMessageLog) => void;
}

export const PaymentManager: React.FC<PaymentManagerProps> = ({
  invoices,
  students,
  packages,
  settings,
  onAddInvoice,
  onUpdateInvoice,
  onRecordPayment,
  onLogWaMessage
}) => {
  const [filterStatus, setFilterStatus] = useState<string>('Semua');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [newInvoiceModalOpen, setNewInvoiceModalOpen] = useState<boolean>(false);
  const [payModalInvoice, setPayModalInvoice] = useState<PaymentInvoice | null>(null);
  const [receiptModalInvoice, setReceiptModalInvoice] = useState<PaymentInvoice | null>(null);

  // Form states for new invoice
  const [formStudentId, setFormStudentId] = useState<string>(students[0]?.id || '');
  const [formPackageId, setFormPackageId] = useState<string>(packages[0]?.id || '');
  const [formDueDate, setFormDueDate] = useState<string>(
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [formNotes, setFormNotes] = useState<string>('Perpanjangan paket les renang');

  // Form states for paying invoice
  const [payMethod, setPayMethod] = useState<'Transfer Bank' | 'QRIS' | 'Tunai / Cash'>('Transfer Bank');
  const [payNote, setPayNote] = useState<string>('Transfer via BCA');

  // Metrics
  const totalPaid = invoices
    .filter(i => i.status === 'Lunas')
    .reduce((sum, i) => sum + i.amount, 0);

  const totalPending = invoices
    .filter(i => i.status === 'Menunggu')
    .reduce((sum, i) => sum + i.amount, 0);

  const totalOverdue = invoices
    .filter(i => i.status === 'Jatuh Tempo')
    .reduce((sum, i) => sum + i.amount, 0);

  const filteredInvoices = invoices.filter(inv => {
    const student = students.find(s => s.id === inv.studentId);
    const matchesFilter = filterStatus === 'Semua' || inv.status === filterStatus;
    const matchesSearch = !searchTerm || 
      inv.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (student && student.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (student && student.parentName.toLowerCase().includes(searchTerm.toLowerCase()));

    return matchesFilter && matchesSearch;
  });

  const handleCreateInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    const pkg = packages.find(p => p.id === formPackageId);
    if (!pkg) return;

    const todayStr = new Date().toISOString().split('T')[0];
    const newInvoice: PaymentInvoice = {
      id: `inv-${Date.now()}`,
      invoiceNumber: `INV/${new Date().getFullYear()}/${new Date().getMonth() + 1}/${Math.floor(100 + Math.random() * 900)}`,
      studentId: formStudentId,
      packageId: formPackageId,
      amount: pkg.price,
      status: 'Menunggu',
      issueDate: todayStr,
      dueDate: formDueDate,
      notes: formNotes,
      whatsappSent: false
    };

    onAddInvoice(newInvoice);
    setNewInvoiceModalOpen(false);
  };

  const handleConfirmPayment = () => {
    if (!payModalInvoice) return;
    onRecordPayment(payModalInvoice.id, payMethod, payNote);

    // Prompt to open receipt modal
    const updated = {
      ...payModalInvoice,
      status: 'Lunas' as PaymentStatus,
      paidDate: new Date().toISOString().split('T')[0],
      paymentMethod: payMethod
    };

    setPayModalInvoice(null);
    setReceiptModalInvoice(updated);
  };

  const handleSendWaReminder = (invoice: PaymentInvoice) => {
    const student = students.find(s => s.id === invoice.studentId);
    const pkg = packages.find(p => p.id === invoice.packageId);
    if (!student || !pkg) return;

    const message = generatePaymentReminderMessage(student, invoice, pkg.name, settings);
    const waUrl = buildWaUrl(student.parentPhone, message);

    onUpdateInvoice({
      ...invoice,
      whatsappSent: true
    });

    onLogWaMessage({
      id: `log-pay-${Date.now()}`,
      recipientName: student.parentName,
      recipientPhone: student.parentPhone,
      studentName: student.name,
      type: 'Pengingat Pembayaran',
      timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      messageText: message,
      status: 'Terkirim'
    });

    window.open(waUrl, '_blank', 'noopener,noreferrer');
  };

  const handleSendWaReceipt = (invoice: PaymentInvoice) => {
    const student = students.find(s => s.id === invoice.studentId);
    const pkg = packages.find(p => p.id === invoice.packageId);
    if (!student || !pkg) return;

    const message = generatePaymentReceiptMessage(student, invoice, pkg.name, pkg.sessionsCount, settings);
    const waUrl = buildWaUrl(student.parentPhone, message);

    onLogWaMessage({
      id: `log-rcpt-${Date.now()}`,
      recipientName: student.parentName,
      recipientPhone: student.parentPhone,
      studentName: student.name,
      type: 'Kuitansi Pembayaran',
      timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      messageText: message,
      status: 'Terkirim'
    });

    window.open(waUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">
            Pembayaran Murid & Kuitansi SPP
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Pantau tagihan les renang, catat pembayaran lunas, dan kirimkan kuitansi atau tagihan langsung ke WhatsApp wali.
          </p>
        </div>

        <button
          onClick={() => setNewInvoiceModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-semibold transition-colors shadow-xs cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>+ Buat Tagihan / Invoice Baru</span>
        </button>
      </div>

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500 mb-2">
            <span>Total Pembayaran Lunas</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono-data tabular-nums">
            {formatRupiah(totalPaid)}
          </div>
          <p className="text-xs text-emerald-600 font-medium mt-1">
            {invoices.filter(i => i.status === 'Lunas').length} transaksi berhasil
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500 mb-2">
            <span>Menunggu Pembayaran</span>
            <Clock className="w-4 h-4 text-sky-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono-data tabular-nums">
            {formatRupiah(totalPending)}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {invoices.filter(i => i.status === 'Menunggu').length} tagihan aktif
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500 mb-2">
            <span>Tunggakan Jatuh Tempo</span>
            <AlertCircle className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-bold text-rose-600 font-mono-data tabular-nums">
            {formatRupiah(totalOverdue)}
          </div>
          <p className="text-xs text-rose-600 font-medium mt-1">
            {invoices.filter(i => i.status === 'Jatuh Tempo').length} tagihan perlu diingatkan
          </p>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          {['Semua', 'Lunas', 'Menunggu', 'Jatuh Tempo'].map(status => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                filterStatus === status
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        <div className="w-full md:w-72">
          <input
            type="text"
            placeholder="Cari no. invoice, nama murid, atau wali..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 rounded-lg border border-slate-200 focus:outline-none focus:border-sky-500 text-xs"
          />
        </div>
      </div>

      {/* Invoice Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-medium">
                <th className="py-3 px-4">No. Invoice & Tanggal</th>
                <th className="py-3 px-4">Murid & Wali</th>
                <th className="py-3 px-4">Paket Les Renang</th>
                <th className="py-3 px-4 text-right">Nominal</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-center">Aksi & WhatsApp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    Tidak ada data tagihan yang sesuai dengan filter.
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((inv) => {
                  const student = students.find(s => s.id === inv.studentId);
                  const pkg = packages.find(p => p.id === inv.packageId);

                  return (
                    <tr key={inv.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4 font-mono-data">
                        <div className="font-semibold text-slate-900">{inv.invoiceNumber}</div>
                        <div className="text-[11px] text-slate-400 font-sans mt-0.5">
                          Dibuat: {inv.issueDate} · JT: {inv.dueDate}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900">{student?.name || 'Murid'}</div>
                        <div className="text-slate-500 text-[11px]">
                          Wali: {student?.parentName} ({student?.parentPhone})
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-medium text-slate-800">{pkg?.name || 'Paket'}</div>
                        <div className="text-slate-400 text-[11px]">
                          {pkg?.sessionsCount} Sesi · Kuota sisa: {student?.remainingSessions} sesi
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-right font-mono-data tabular-nums">
                        <span className="font-bold text-slate-900">{formatRupiah(inv.amount)}</span>
                        {inv.paidDate && (
                          <div className="text-[11px] text-emerald-600 font-sans">
                            Lunas {inv.paidDate}
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <span className={`inline-block px-2.5 py-1 rounded-md text-[11px] font-medium font-mono ${
                          inv.status === 'Lunas'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : inv.status === 'Menunggu'
                            ? 'bg-sky-50 text-sky-700 border border-sky-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}>
                          {inv.status}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {inv.status === 'Lunas' ? (
                            <>
                              <button
                                onClick={() => setReceiptModalInvoice(inv)}
                                className="px-2.5 py-1.5 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors flex items-center gap-1 cursor-pointer"
                                title="Lihat Kuitansi"
                              >
                                <FileText className="w-3.5 h-3.5 text-slate-600" />
                                <span>Kuitansi</span>
                              </button>
                              <button
                                onClick={() => handleSendWaReceipt(inv)}
                                className="px-2.5 py-1.5 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-md transition-colors flex items-center gap-1 cursor-pointer"
                                title="Kirim Bukti Pembayaran ke WhatsApp"
                              >
                                <Send className="w-3.5 h-3.5" />
                                <span>WA</span>
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => setPayModalInvoice(inv)}
                                className="px-2.5 py-1.5 text-white bg-slate-900 hover:bg-slate-800 rounded-md transition-colors flex items-center gap-1 cursor-pointer"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Catat Bayar</span>
                              </button>
                              <button
                                onClick={() => handleSendWaReminder(inv)}
                                className="px-2.5 py-1.5 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-md transition-colors flex items-center gap-1 cursor-pointer"
                                title="Kirim Tagihan ke WhatsApp"
                              >
                                <Send className="w-3.5 h-3.5" />
                                <span>Tagih WA</span>
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Catat Pembayaran */}
      {payModalInvoice && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-base font-bold text-slate-900">Konfirmasi Pelunasan Tagihan</h2>
              <button 
                onClick={() => setPayModalInvoice(null)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                &times;
              </button>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-100 space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-500">No. Tagihan:</span>
                <span className="font-mono-data font-bold text-slate-800">{payModalInvoice.invoiceNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Murid:</span>
                <span className="font-semibold text-slate-800">
                  {students.find(s => s.id === payModalInvoice.studentId)?.name}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Total Nominal:</span>
                <span className="font-mono-data font-bold text-sky-700 text-sm">
                  {formatRupiah(payModalInvoice.amount)}
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Metode Pembayaran *</label>
                <select
                  value={payMethod}
                  onChange={(e) => setPayMethod(e.target.value as any)}
                  className="w-full p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-sky-500"
                >
                  <option value="Transfer Bank">Transfer Bank (BCA / Mandiri / BNI)</option>
                  <option value="QRIS">QRIS Kasir Kolam</option>
                  <option value="Tunai / Cash">Tunai Langsung / Cash</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Catatan Transaksi / Referensi</label>
                <input
                  type="text"
                  value={payNote}
                  onChange={(e) => setPayNote(e.target.value)}
                  placeholder="Contoh: Transfer BCA an. Hendra"
                  className="w-full p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="p-3 bg-sky-50 border border-sky-200 text-sky-800 rounded-lg text-[11px] leading-relaxed">
                ℹ️ Mencatat lunas tagihan ini akan <strong>secara otomatis menambahkan kuota sesi</strong> ke saldo latihan murid terkait.
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                onClick={() => setPayModalInvoice(null)}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-medium"
              >
                Batal
              </button>
              <button
                onClick={handleConfirmPayment}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold"
              >
                Konfirmasi Lunas & Buka Kuitansi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Kuitansi Digital Resmi */}
      {receiptModalInvoice && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-sky-600" />
                <h2 className="text-base font-bold text-slate-900">Kuitansi Pembayaran Les Renang</h2>
              </div>
              <button 
                onClick={() => setReceiptModalInvoice(null)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                &times;
              </button>
            </div>

            {/* Printable Receipt Canvas */}
            <div id="printable-receipt" className="p-5 rounded-xl border border-slate-200 bg-white space-y-4 text-xs font-sans">
              <div className="flex justify-between items-start border-b border-slate-200 pb-3">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">{settings.academyName}</h3>
                  <p className="text-[11px] text-slate-500 max-w-xs">{settings.address}</p>
                  <p className="text-[11px] text-slate-500">WA: {settings.phoneNumber}</p>
                </div>
                <div className="text-right font-mono-data">
                  <div className="text-emerald-700 font-bold px-2 py-0.5 bg-emerald-50 border border-emerald-200 rounded inline-block text-[11px]">
                    LUNAS
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">{receiptModalInvoice.invoiceNumber}</div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">Nama Murid:</span>
                  <span className="font-bold text-slate-900">
                    {students.find(s => s.id === receiptModalInvoice.studentId)?.name}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Wali Murid:</span>
                  <span className="text-slate-700">
                    {students.find(s => s.id === receiptModalInvoice.studentId)?.parentName}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Paket Renang:</span>
                  <span className="text-slate-800">
                    {packages.find(p => p.id === receiptModalInvoice.packageId)?.name}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Metode Bayar:</span>
                  <span className="text-slate-800">{receiptModalInvoice.paymentMethod || 'Transfer'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Tanggal Bayar:</span>
                  <span className="font-mono-data text-slate-800">{receiptModalInvoice.paidDate || receiptModalInvoice.issueDate}</span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-between items-center">
                <span className="font-bold text-slate-700 text-sm">Total Dibayarkan:</span>
                <span className="text-base font-bold text-slate-900 font-mono-data tabular-nums">
                  {formatRupiah(receiptModalInvoice.amount)}
                </span>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
              <button
                onClick={() => window.print()}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Cetak / Cetak PDF</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleSendWaReceipt(receiptModalInvoice)}
                  className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Kirim Kuitansi ke WhatsApp Wali</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Buat Tagihan Baru */}
      {newInvoiceModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-base font-bold text-slate-900">Buat Tagihan Les Renang Baru</h2>
              <button 
                onClick={() => setNewInvoiceModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleCreateInvoice} className="space-y-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Pilih Murid *</label>
                <select
                  value={formStudentId}
                  onChange={(e) => setFormStudentId(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-sky-500"
                >
                  {students.map(st => (
                    <option key={st.id} value={st.id}>
                      {st.name} · Sisa: {st.remainingSessions} sesi · Wali: {st.parentName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Pilih Paket Les *</label>
                <select
                  value={formPackageId}
                  onChange={(e) => setFormPackageId(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-sky-500"
                >
                  {packages.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} — {formatRupiah(p.price)} ({p.sessionsCount} Sesi)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Batas Tanggal Jatuh Tempo *</label>
                <input
                  type="date"
                  required
                  value={formDueDate}
                  onChange={(e) => setFormDueDate(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Catatan Tambahan</label>
                <input
                  type="text"
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="Contoh: Perpanjangan Paket Reguler 8 Sesi"
                  className="w-full p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setNewInvoiceModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-medium"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg font-semibold"
                >
                  Buat Tagihan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
