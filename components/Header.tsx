
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="bg-gray-900/80 backdrop-blur-md sticky top-0 z-10 border-b border-gray-800 shadow-lg shadow-gray-900/50">
      <div className="container mx-auto px-4 py-3">
        <h1 className="text-2xl font-bold text-yellow-400 tracking-wider">
          서울 2242: 마지막 생존자
        </h1>
        <p className="text-sm text-gray-400">A Gemini-Powered Text Adventure</p>
      </div>
    </header>
  );
};

export default Header;
