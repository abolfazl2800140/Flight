import React, { useState, useEffect } from 'react';
import { AirplaneIcon } from './icons/AirplaneIcon';
import { SparklesIcon } from './icons/SparklesIcon';
import { BookOpenIcon } from './icons/BookOpenIcon';
import { LogoutIcon } from './icons/LogoutIcon';

const Header: React.FC = () => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formattedTime = currentTime.toLocaleTimeString('fa-IR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });

  const timeZone = `( ${Intl.DateTimeFormat().resolvedOptions().timeZone.replace('/', ' / ')} )`;

  return (
    <header className="w-full bg-gray-900/80 backdrop-blur-sm border-b border-gray-700 z-40 px-6 py-3 flex items-center justify-between flex-shrink-0">
      {/* Right Side */}
      <div className="flex items-center gap-3">
        <AirplaneIcon className="w-8 h-8 text-cyan-400" />
        <h1 className="text-xl font-bold text-white tracking-wider hidden sm:block">
          رهیاب پرواز جمنای
        </h1>
      </div>

      {/* Center Side */}
      <div className="flex flex-col items-center">
        <div className="text-lg font-mono tracking-widest text-gray-200">{formattedTime}</div>
        <div className="text-xs text-gray-500">{timeZone}</div>
      </div>

      {/* Left Side */}
      <div className="flex items-center gap-2">
        <button className="flex items-center gap-2 p-2 rounded-md hover:bg-gray-700 transition-colors" aria-label="دستیار">
          <SparklesIcon className="w-5 h-5 text-yellow-400" />
          <span className="hidden md:inline text-sm font-medium">دستیار</span>
        </button>
        <button className="flex items-center gap-2 p-2 rounded-md hover:bg-gray-700 transition-colors" aria-label="قوانین">
          <BookOpenIcon className="w-5 h-5 text-gray-300" />
           <span className="hidden md:inline text-sm font-medium">قوانین</span>
        </button>
        <button className="flex items-center gap-2 p-2 rounded-md hover:bg-gray-700 transition-colors" aria-label="خروج">
          <LogoutIcon className="w-5 h-5 text-red-500" />
           <span className="hidden md:inline text-sm font-medium">خروج</span>
        </button>
      </div>
    </header>
  );
};

export default Header;
