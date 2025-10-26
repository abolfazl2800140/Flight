import React from 'react';

const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white">
      <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-cyan-400" role="status">
        <span className="sr-only">Loading...</span>
      </div>
      <p className="mt-4 text-lg animate-pulse">در حال بارگذاری داده‌های پرواز...</p>
    </div>
  );
};

export default LoadingSpinner;
