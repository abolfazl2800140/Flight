import React, { useState, useEffect } from 'react';
import type { ReportInput } from '../types';
import { CloseIcon } from './icons/CloseIcon';
import { InfoIcon } from './icons/InfoIcon';
import { PlusIcon } from './icons/PlusIcon';

interface AddReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (reportInput: ReportInput) => void;
}

const INITIAL_STATE: ReportInput = {
    lat1: '',
    lng1: '',
    lat2: '',
    lng2: '',
    hours_back: '',
};

const AddReportModal: React.FC<AddReportModalProps> = ({ isOpen, onClose, onAdd }) => {
  const [formData, setFormData] = useState<ReportInput>(INITIAL_STATE);
  const [error, setError] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsMounted(true);
      setFormData(INITIAL_STATE);
      setError(null);
    } else {
      setIsMounted(false);
    }
  }, [isOpen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    // Allow only numbers and a single decimal point
    if (/^[0-9.-]*$/.test(value)) {
        setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    for (const key in formData) {
        if (formData[key as keyof ReportInput] === '') {
            setError('تمام فیلدها باید پر شوند.');
            return;
        }
        if (isNaN(Number(formData[key as keyof ReportInput]))) {
            setError(`مقدار "${key}" باید یک عدد معتبر باشد.`);
            return;
        }
    }

    const reportData: ReportInput = {
        lat1: Number(formData.lat1),
        lng1: Number(formData.lng1),
        lat2: Number(formData.lat2),
        lng2: Number(formData.lng2),
        hours_back: Number(formData.hours_back),
    };
    
    setError(null);
    onAdd(reportData);
  };
  
  if (!isOpen && !isMounted) {
    return null;
  }

  return (
    <div 
        className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity duration-300 ${isMounted && isOpen ? 'opacity-100' : 'opacity-0'}`}
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)' }}
        onClick={onClose}
        role="dialog"
        aria-modal="true"
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className={`bg-gray-800 rounded-xl shadow-xl w-full max-w-lg text-white border border-gray-700 transition-all duration-300 ease-in-out ${isMounted && isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h2 className="text-xl font-bold">ایجاد گزارش جدید</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <CloseIcon className="w-6 h-6" />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-6">
            <div className="flex items-start gap-3 bg-gray-900/50 p-3 rounded-lg">
                <InfoIcon className="w-8 h-8 text-cyan-400 mt-1 flex-shrink-0" />
                <p className="text-sm text-gray-300">
                    محدوده جغرافیایی و بازه زمانی مورد نظر برای دریافت گزارش پروازهای تاریخی را مشخص کنید.
                </p>
            </div>
            
            <fieldset className="border border-gray-700 rounded-lg p-4">
              <legend className="px-2 text-sm font-medium text-cyan-400">نقطه شروع</legend>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                <div>
                    <label htmlFor="lat1" className="block text-xs font-medium text-gray-400 mb-1">عرض جغرافیایی</label>
                    <input type="text" name="lat1" id="lat1" value={formData.lat1} onChange={handleInputChange} className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-cyan-500" placeholder="مثال: 35.68" />
                </div>
                 <div>
                    <label htmlFor="lng1" className="block text-xs font-medium text-gray-400 mb-1">طول جغرافیایی</label>
                    <input type="text" name="lng1" id="lng1" value={formData.lng1} onChange={handleInputChange} className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-cyan-500" placeholder="مثال: 51.38" />
                </div>
              </div>
            </fieldset>

            <fieldset className="border border-gray-700 rounded-lg p-4">
              <legend className="px-2 text-sm font-medium text-cyan-400">نقطه پایان</legend>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                <div>
                    <label htmlFor="lat2" className="block text-xs font-medium text-gray-400 mb-1">عرض جغرافیایی</label>
                    <input type="text" name="lat2" id="lat2" value={formData.lat2} onChange={handleInputChange} className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-cyan-500" placeholder="مثال: 29.60" />
                </div>
                 <div>
                    <label htmlFor="lng2" className="block text-xs font-medium text-gray-400 mb-1">طول جغرافیایی</label>
                    <input type="text" name="lng2" id="lng2" value={formData.lng2} onChange={handleInputChange} className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-cyan-500" placeholder="مثال: 52.53" />
                </div>
              </div>
            </fieldset>

            <div>
                <label htmlFor="hours_back" className="block text-sm font-medium text-gray-300 mb-1">بازه زمانی (ساعت قبل)</label>
                <input type="text" name="hours_back" id="hours_back" value={formData.hours_back} onChange={handleInputChange} className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-cyan-500" placeholder="مثال: 24" />
            </div>

             {error && <p className="text-red-400 text-sm text-center animate-shake">{error}</p>}
          </div>
          <div className="flex items-center justify-end p-4 border-t border-gray-700 space-x-3 space-x-reverse bg-gray-900/50 rounded-b-xl">
            <button type="button" onClick={onClose} className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-5 rounded-md transition-colors">
              انصراف
            </button>
            <button type="submit" className="flex items-center gap-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 px-5 rounded-md transition-colors">
              <PlusIcon className="w-5 h-5" />
              <span>ایجاد گزارش</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddReportModal;