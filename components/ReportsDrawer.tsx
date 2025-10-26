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

const getStatusStyles = (status: "safe" | "caution" | "unsafe") => {
    switch (status) {
        case "safe":
            return {
                text: "ایمن",
                icon: "✅",
                color: "border-green-500/50 bg-green-500/10 text-green-300",
            };
        case "caution":
            return {
                text: "احتیاط",
                icon: "⚠️",
                color: "border-yellow-500/50 bg-yellow-500/10 text-yellow-300",
            };
        case "unsafe":
            return {
                text: "ناامن",
                icon: "❌",
                color: "border-red-500/50 bg-red-500/10 text-red-300",
            };
    }
};

const ReportCard: React.FC<{ report: Report; onDelete: (id: string) => void }> = ({ report, onDelete }) => {
    const assessment = report.data.final_assessment;
    const statusStyle = getStatusStyles(assessment.overall_status);
    const region = report.data.region;

    return (
        <div className={`bg-gray-800 rounded-lg p-4 border ${statusStyle.color} transition-all duration-300`}>
            <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                <div className="flex-1">
                    <div className="flex items-center gap-3">
                        <span className="text-2xl">{statusStyle.icon}</span>
                        <h3 className="text-lg font-bold">ارزیابی کلی: {statusStyle.text}</h3>
                    </div>
                     <p className="text-xs text-gray-400 mt-2">
                        شناسه تحلیل: <span className="font-mono text-gray-300">{report.analysis_id}</span>
                    </p>
                </div>
                <div className="flex-shrink-0 flex items-center gap-2 text-xs">
                    <span className={`px-2 py-1 font-medium rounded-full bg-gray-700`}>
                       اطمینان: {assessment.confidence_level}
                    </span>
                     <span className={`px-2 py-1 font-medium rounded-full ${report.status === 'completed' ? 'bg-blue-500/20 text-blue-300' : 'bg-gray-700'}`}>
                        وضعیت: {report.status}
                    </span>
                </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-700 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                    <p className="text-gray-400 text-xs">نقطه شروع</p>
                    <p className="font-mono text-cyan-300 text-xs">{region.coordinates.lat1.toFixed(2)}, {region.coordinates.lng1.toFixed(2)}</p>
                </div>
                 <div>
                    <p className="text-gray-400 text-xs">نقطه پایان</p>
                    <p className="font-mono text-cyan-300 text-xs">{region.coordinates.lat2.toFixed(2)}, {region.coordinates.lng2.toFixed(2)}</p>
                </div>
                <div>
                    <p className="text-gray-400 text-xs">مساحت منطقه</p>
                    <p className="font-mono text-cyan-300">{region.area_km2.toLocaleString('fa-IR')} km²</p>
                </div>
                 <div>
                    <p className="text-gray-400 text-xs">بازه زمانی</p>
                    <p className="font-mono text-cyan-300">{report.data.analysis_period_hours} ساعت</p>
                </div>
            </div>
            
             <div className="mt-3 pt-3 border-t border-gray-700 flex items-center justify-between text-xs">
                 <p className="text-gray-500">
                    ایجاد شده در: {new Date(report.timestamp).toLocaleString('fa-IR')}
                 </p>
                 <button
                    onClick={() => onDelete(report._id)}
                    className="text-gray-400 hover:text-red-400 transition-colors"
                    title="حذف گزارش"
                 >
                    <TrashIcon className="w-4 h-4" />
                 </button>
            </div>
        </div>
    );
};


const ReportsDrawer: React.FC<ReportsDrawerProps> = ({ isOpen, onClose, reports, onAddReport, onDeleteReport }) => {
    const [isAddModalOpen, setAddModalOpen] = useState(false);
    
    const handleAdd = (reportInput: ReportInput) => {
        onAddReport(reportInput);
        setAddModalOpen(false);
    };

    if (!isOpen) return null;

    return (
        <>
            <div className="fixed inset-0 bg-gray-900 z-40 flex flex-col animate-fade-in-fast" role="dialog" aria-modal="true">
                <div className="w-full max-w-6xl mx-auto flex flex-col h-full p-4 sm:p-6 lg:p-8">
                    {/* Header */}
                    <header className="flex-shrink-0 flex items-center justify-between pb-4 border-b border-gray-700">
                        <div className="flex items-center gap-3">
                            <BookOpenIcon className="w-6 h-6 text-cyan-400" />
                            <h2 className="text-xl font-bold">گزارشات پروازی</h2>
                        </div>
                        <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                            <CloseIcon className="w-6 h-6" />
                        </button>
                    </header>
                    
                    {/* Add Report Button */}
                    <div className="flex-shrink-0 py-4">
                         <button
                            onClick={() => setAddModalOpen(true)}
                            className="w-full flex items-center justify-center gap-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 px-4 rounded-md transition-colors"
                        >
                            <PlusIcon className="w-5 h-5" />
                            <span>افزودن گزارش جدید</span>
                        </button>
                    </div>

                    {/* Content */}
                    <main className="flex-grow overflow-y-auto pr-2 -mr-2">
                        {reports.length === 0 ? (
                             <div className="text-center text-gray-400 py-20">
                                <p>هیچ گزارشی یافت نشد.</p>
                                <p className="text-sm mt-1">برای شروع، یک گزارش جدید اضافه کنید.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {reports.map(report => (
                                    <ReportCard key={report._id} report={report} onDelete={onDeleteReport} />
                                ))}
                            </div>
                        )}
                    </main>
                </div>
            </div>
            <AddReportModal 
                isOpen={isAddModalOpen} 
                onClose={() => setAddModalOpen(false)}
                onAdd={handleAdd}
            />
        </>
    );
};

export default ReportsDrawer;