import React from 'react';
import { Waves, Bell, CheckCircle2 } from 'lucide-react';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  pendingWaCount: number;
  onQuickAttendanceClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  pendingWaCount,
  onQuickAttendanceClick
}) => {
  const navItems = [
    { id: 'dashboard', label: 'Ringkasan' },
    { id: 'schedules', label: 'Jadwal & Sesi' },
    { id: 'attendance', label: 'Presensi & WA' },
    { id: 'payments', label: 'Pembayaran' },
    { id: 'students', label: 'Data Murid' },
    { id: 'templates', label: 'Template WA' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-16">
          {/* Zone 1: Single text wordmark */}
          <button 
            onClick={() => setActiveTab('dashboard')} 
            className="flex items-center gap-2.5 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 rounded-md"
          >
            <div className="w-9 h-9 rounded-lg bg-sky-600 flex items-center justify-center text-white shadow-sm">
              <Waves className="w-5 h-5" />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0">
              AkuatikPro
            </span>
          </button>

          {/* Zone 2: Concise single-line navigation links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`relative py-1 text-sm font-medium transition-colors whitespace-nowrap shrink-0 ${
                    isActive 
                      ? 'text-sky-600 font-semibold' 
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {item.label}
                  {item.id === 'attendance' && pendingWaCount > 0 && (
                    <span className="ml-1.5 px-1.5 py-0.2 bg-amber-100 text-amber-800 text-xs rounded-full font-mono font-medium">
                      {pendingWaCount}
                    </span>
                  )}
                  {isActive && (
                    <span className="absolute bottom-[-17px] left-0 right-0 h-0.5 bg-sky-600 rounded-full" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: Primary Action */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={onQuickAttendanceClick}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-sky-600 rounded-lg hover:bg-sky-700 transition-colors shadow-sm whitespace-nowrap shrink-0 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Input Presensi Kolam</span>
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile nav row */}
      <div className="md:hidden border-t border-slate-100 bg-slate-50 px-4 py-2 flex items-center gap-2 overflow-x-auto">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap shrink-0 transition-colors ${
              activeTab === item.id
                ? 'bg-sky-600 text-white'
                : 'text-slate-600 bg-white border border-slate-200'
            }`}
          >
            {item.label}
            {item.id === 'attendance' && pendingWaCount > 0 && ` (${pendingWaCount})`}
          </button>
        ))}
      </div>
    </header>
  );
};
