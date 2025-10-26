import React, { useState } from 'react';
import type { Report, ReportInput } from '../types';
import { CloseIcon } from './icons/CloseIcon';
import { BookOpenIcon } from './icons/BookOpenIcon';
import { PlusIcon } from './icons/PlusIcon';
import { TrashIcon } from './icons/TrashIcon';
import AddReportModal from './AddReportModal';

interface ReportsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  reports: Report[];
  onAddReport: (reportInput: ReportInput) => void;
  onDeleteReport: (reportId: string) => void;
}

const ReportItem: React.FC<{ report: Report; onDelete: (id: string) => void }> = ({ report, onDelete }) => {
    const { data, timestamp, _id, status } = report;
    const { region, analysis_period_hours, final_assessment } = data;

    const statusClasses = {
        completed: 'bg-green-500',
        processing: 'bg-yellow-500 animate-pulse',
        failed: 'bg-red-500',
    };

    const statusText = {
        completed: 'تکمیل شده',
        processing: 'در حال پردازش',
        failed: 'ناموفق',
    };

    const assessmentStatusText = {
        safe: 'ایمن',
        caution: 'احتیاط',
        unsafe: 'ناامن',
    };

     const assessmentStatusColor = {
        safe: 'text-green-400',
        caution: 'text-yellow-400',
        unsafe: 'text-red-400',
    };

    return (
        <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 space-y-3">
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-sm text-gray-400">شناسه گزارش</p>
                    <p className="font-mono text-xs">{_id}</p>
                </div>
                <button 
                    onClick={() => onDelete(_id)} 
                    className="text-gray-400 hover:text-red-500 transition-colors p-1"
                    title="حذف گزارش"
                >
                    <TrashIcon className="w-5 h-5" />
                </button>
            </div>
            <div className="text-sm space-y-2">
                <p>
                    <span className="text-gray-400">محدوده:</span>
                    <span className="font-mono text-xs ml-2" dir="ltr">
                        [{region.coordinates.lat1.toFixed(2)}, {region.coordinates.lng1.toFixed(2)}] to [{region.coordinates.lat2.toFixed(2)}, {region.coordinates.lng2.toFixed(2)}]
                    </span>
                </p>
                <p><span className="text-gray-400">دوره تحلیل:</span> {analysis_period_hours.toLocaleString('fa-IR')} ساعت</p>
                <p><span className="text-gray-400">تاریخ ایجاد:</span> {new Date(timestamp).toLocaleString('fa-IR')}</p>
                 {status === 'completed' && (
                    <p>
                        <span className="text-gray-400">ارزیابی نهایی:</span> 
                        <span className={`font-bold ${assessmentStatusColor[final_assessment.overall_status]}`}>
                            {` ${assessmentStatusText[final_assessment.overall_status]}`}
                        </span>
                    </p>
                )}
            </div>
             <div className="flex items-center justify-end">
                <div className={`flex items-center gap-2 text-xs font-bold px-2 py-1 rounded-full text-white ${statusClasses[status]}`}>
                    <span className="w-2 h-2 rounded-full bg-white/50"></span>
                    <span>{statusText[status]}</span>
                </div>
            </div>
        </div>
    );
};


const ReportsDrawer: React.FC<ReportsDrawerProps> = ({ isOpen, onClose, reports, onAddReport, onDeleteReport }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleAddReport = (reportInput: ReportInput) => {
        onAddReport(reportInput);
        setIsModalOpen(false);
    };

  return (
    <>
    <div
      className={`fixed inset-0 bg-gray-900 z-40 transition-opacity duration-300 ease-in-out ${
        isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
    >
      <div className="flex flex-col h-full text-white p-4 max-w-7xl mx-auto w-full">
        {/* Header */}
        <div className="flex-shrink-0 flex items-center justify-between pb-4 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <BookOpenIcon className="w-6 h-6 text-cyan-400" />
            <h2 className="text-xl font-bold">گزارشات</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <CloseIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Add Report Button */}
        <div className="flex-shrink-0 py-4">
            <button
                onClick={() => setIsModalOpen(true)}
                className="w-full flex items-center justify-center gap-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 px-4 rounded-md transition-colors"
            >
                <PlusIcon className="w-5 h-5" />
                <span>افزودن گزارش جدید</span>
            </button>
        </div>

        {/* Reports List */}
        <div className="flex-grow space-y-4 overflow-y-auto pb-4">
          {reports.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 text-center">
                <BookOpenIcon className="w-16 h-16 opacity-20" />
                <p className="mt-4">هیچ گزارشی یافت نشد.</p>
                <p className="text-sm">برای شروع، یک گزارش جدید اضافه کنید.</p>
            </div>
          ) : (
            reports.map(report => (
                <ReportItem key={report._id} report={report} onDelete={onDeleteReport} />
            ))
          )}
        </div>
      </div>
    </div>

    <AddReportModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdd={handleAddReport}
    />
    </>
  );
};

export default ReportsDrawer;