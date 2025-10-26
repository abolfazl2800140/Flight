import React, { useState, useEffect } from 'react';
import type { ReportInput } from '../types';
import { CloseIcon } from './icons/CloseIcon';

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

  useEffect(() => {
    // Reset form when modal is opened
    if (isOpen) {
      setFormData(INITIAL_STATE);
      setError(null);
    }
  }, [isOpen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    for (const key in formData) {
        if (formData[key as keyof ReportInput] === '') {
            setError('تمام فیلدها باید پر شوند.');
            return;
        }
        if (isNaN(Number(formData[key as keyof ReportInput]))) {
            setError('تمام مقادیر باید عددی باشند.');
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

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-4 animate-fade-in-fast">
      <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-lg text-white border border-gray-700">
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h2 className="text-xl font-bold">افزودن گزارش جدید</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <CloseIcon className="w-6 h-6" />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4">
            <p className="text-sm text-gray-400">
              محدوده جغرافیایی و بازه زمانی مورد نظر برای دریافت گزارش پروازهای تاریخی را مشخص کنید.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="lat1" className="block text-sm font-medium text-gray-300 mb-1">عرض جغرافیایی نقطه ۱</label>
                    <input type="text" name="lat1" id="lat1" value={formData.lat1} onChange={handleInputChange} className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-cyan-500" placeholder="مثال: 35.68" />
                </div>
                 <div>
                    <label htmlFor="lng1" className="block text-sm font-medium text-gray-300 mb-1">طول جغرافیایی نقطه ۱</label>
                    <input type="text" name="lng1" id="lng1" value={formData.lng1} onChange={handleInputChange} className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-cyan-500" placeholder="مثال: 51.38" />
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="lat2" className="block text-sm font-medium text-gray-300 mb-1">عرض جغرافیایی نقطه ۲</label>
                    <input type="text" name="lat2" id="lat2" value={formData.lat2} onChange={handleInputChange} className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-cyan-500" placeholder="مثال: 29.60" />
                </div>
                 <div>
                    <label htmlFor="lng2" className="block text-sm font-medium text-gray-300 mb-1">طول جغرافیایی نقطه ۲</label>
                    <input type="text" name="lng2" id="lng2" value={formData.lng2} onChange={handleInputChange} className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-cyan-500" placeholder="مثال: 52.53" />
                </div>
            </div>
            <div>
                <label htmlFor="hours_back" className="block text-sm font-medium text-gray-300 mb-1">بازه زمانی (ساعت قبل)</label>
                <input type="text" name="hours_back" id="hours_back" value={formData.hours_back} onChange={handleInputChange} className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-cyan-500" placeholder="مثال: 24" />
            </div>
             {error && <p className="text-red-400 text-sm text-center">{error}</p>}
          </div>
          <div className="flex items-center justify-end p-4 border-t border-gray-700 space-x-3 space-x-reverse">
            <button type="button" onClick={onClose} className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-md transition-colors">
              انصراف
            </button>
            <button type="submit" className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 px-4 rounded-md transition-colors">
              افزودن گزارش
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddReportModal;
