import React from 'react';
import type { Filters } from '../types';
import { CloseIcon } from './icons/CloseIcon';
import { FilterIcon } from './icons/FilterIcon';

interface FilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  filters: Filters;
  setFilters: React.Dispatch<React.SetStateAction<Filters>>;
  onReset: () => void;
}

const FilterDrawer: React.FC<FilterDrawerProps> = ({ isOpen, onClose, filters, setFilters, onReset }) => {
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

  return (
    <div
      className={`fixed top-0 right-0 h-full w-full max-w-sm bg-gray-900/80 backdrop-blur-sm shadow-2xl z-40 transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}
    >
      <div className="flex flex-col h-full text-white p-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <FilterIcon className="w-6 h-6 text-cyan-400" />
            <h2 className="text-xl font-bold">فیلتر پروازها</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <CloseIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Filters */}
        <div className="flex-grow py-4 space-y-6 overflow-y-auto">
            <div>
                <label htmlFor="airline" className="block text-sm font-medium text-gray-300 mb-2">شرکت هواپیمایی (IATA)</label>
                <input
                    type="text"
                    id="airline"
                    name="airline"
                    value={filters.airline}
                    onChange={handleInputChange}
                    placeholder="مثال: IR, W5, AA"
                    className="w-full bg-gray-800 border border-gray-600 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
            </div>
          <div>
            <label htmlFor="minAltitude" className="block text-sm font-medium text-gray-300 mb-2">حداقل ارتفاع (فوت)</label>
            <input
              type="range"
              id="minAltitude"
              name="minAltitude"
              min="0"
              max="50000"
              step="1000"
              value={filters.minAltitude}
              onChange={handleInputChange}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
            />
            <div className="text-center text-cyan-300 font-mono mt-1">{Number(filters.minAltitude).toLocaleString('fa-IR')} فوت</div>
          </div>

          <div>
            <label htmlFor="maxAltitude" className="block text-sm font-medium text-gray-300 mb-2">حداکثر ارتفاع (فوت)</label>
            <input
              type="range"
              id="maxAltitude"
              name="maxAltitude"
              min="0"
              max="50000"
              step="1000"
              value={filters.maxAltitude}
              onChange={handleInputChange}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
            />
             <div className="text-center text-cyan-300 font-mono mt-1">{Number(filters.maxAltitude).toLocaleString('fa-IR')} فوت</div>
          </div>
          
           <div>
            <label htmlFor="minSpeed" className="block text-sm font-medium text-gray-300 mb-2">حداقل سرعت (نات)</label>
            <input
              type="range"
              id="minSpeed"
              name="minSpeed"
              min="0"
              max="1000"
              step="50"
              value={filters.minSpeed}
              onChange={handleInputChange}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
            />
             <div className="text-center text-cyan-300 font-mono mt-1">{Number(filters.minSpeed).toLocaleString('fa-IR')} نات</div>
          </div>

           <div>
            <label htmlFor="maxSpeed" className="block text-sm font-medium text-gray-300 mb-2">حداکثر سرعت (نات)</label>
            <input
              type="range"
              id="maxSpeed"
              name="maxSpeed"
              min="0"
              max="1000"
              step="50"
              value={filters.maxSpeed}
              onChange={handleInputChange}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
            />
            <div className="text-center text-cyan-300 font-mono mt-1">{Number(filters.maxSpeed).toLocaleString('fa-IR')} نات</div>
          </div>
        </div>
        
        {/* Footer */}
        <div className="pt-4 border-t border-gray-700">
            <button
                onClick={onReset}
                className="w-full bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-md transition-colors"
            >
                بازنشانی فیلترها
            </button>
        </div>
      </div>
    </div>
  );
};

export default FilterDrawer;
