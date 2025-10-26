import React, { useState, useEffect } from 'react';
import { SparklesIcon } from './icons/SparklesIcon';
import { BookOpenIcon } from './icons/BookOpenIcon';
import { LogoutIcon } from './icons/LogoutIcon';
import { FilterIcon } from './icons/FilterIcon';
import { AirplaneIcon } from './icons/AirplaneIcon';

interface HeaderProps {
  onToggleAssistant: () => void;
  onToggleFilters: () => void;
  flightCount: number;
}

const Header: React.FC<HeaderProps> = ({ onToggleAssistant, onToggleFilters, flightCount }) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const timeZone = new Intl.DateTimeFormat('fa-IR', { timeZoneName: 'short' }).formatToParts(currentTime).find(part => part.type === 'timeZoneName')?.value;

  return (
    <header className="fixed top-0 left-0 right-0 bg-gray-900/70 backdrop-blur-sm h-16 z-30 flex items-center justify-between px-4 border-b border-gray-700">
      {/* Right Section: Logo and Title */}
      <div className="flex items-center gap-3">
        <AirplaneIcon className="w-8 h-8 text-cyan-400 transform -rotate-45" />
        <h1 className="text-xl font-bold whitespace-nowrap">رهیاب پرواز جمنای</h1>
      </div>

      {/* Center Section: Time */}
      <div className="hidden md:flex flex-col items-center">
        <div className="font-mono text-lg tracking-wider">
          {currentTime.toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
        </div>
        <div className="text-xs text-gray-400">{timeZone} (به وقت محلی)</div>
      </div>

      {/* Left Section: Actions */}
      <div className="flex items-center gap-2">
         <button onClick={onToggleFilters} className="flex items-center gap-2 p-2 text-gray-300 hover:bg-gray-700 hover:text-white rounded-md transition-colors" title="فیلترها">
          <FilterIcon className="w-5 h-5" />
          <span className="hidden sm:inline">فیلتر</span>
          <span className="bg-cyan-500 text-white text-xs font-bold rounded-full px-2 py-0.5">{flightCount.toLocaleString('fa-IR')}</span>
        </button>
        <button onClick={onToggleAssistant} className="flex items-center gap-1 p-2 text-gray-300 hover:bg-gray-700 hover:text-white rounded-md transition-colors" title="دستیار">
          <SparklesIcon className="w-5 h-5" />
          <span className="hidden sm:inline">دستیار</span>
        </button>
        <button className="p-2 text-gray-300 hover:bg-gray-700 hover:text-white rounded-md transition-colors" title="قوانین">
          <BookOpenIcon className="w-5 h-5" />
        </button>
        <button className="p-2 text-gray-300 hover:bg-gray-700 hover:text-white rounded-md transition-colors" title="خروج">
          <LogoutIcon className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
};

export default Header;