
import React from 'react';

const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-3 text-yellow-400">이야기를 생성하는 중...</p>
    </div>
  );
};

export default LoadingSpinner;
