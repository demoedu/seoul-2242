
import React from 'react';

interface StartScreenProps {
  onStart: () => void;
}

const StartScreen: React.FC<StartScreenProps> = ({ onStart }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center animate-fade-in">
      <h2 className="text-4xl font-extrabold text-yellow-400 mb-4">
        생존에 오신 것을 환영합니다
      </h2>
      <p className="text-gray-300 mb-8 max-w-md">
        핵전쟁으로 황폐해진 서울. 당신의 모든 선택이 삶과 죽음을 가릅니다. 
        살아남기 위해 필요한 것을 가지고 있습니까?
      </p>
      <button
        onClick={onStart}
        className="px-8 py-3 bg-yellow-500 text-black font-bold text-lg rounded-lg shadow-lg hover:bg-yellow-400 hover:scale-105 transform transition-all duration-300 ease-in-out"
      >
        게임 시작
      </button>
    </div>
  );
};

export default StartScreen;
