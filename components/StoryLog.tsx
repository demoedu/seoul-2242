
import React, { useEffect, useRef } from 'react';

interface StoryLogProps {
  log: string[];
}

const StoryLog: React.FC<StoryLogProps> = ({ log }) => {
  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [log]);

  return (
    <div className="flex-grow bg-black/30 rounded-lg p-4 overflow-y-auto h-96 border border-gray-700 shadow-inner">
      <div className="text-gray-300 whitespace-pre-wrap leading-relaxed">
        {log.map((entry, index) => {
          if (entry.startsWith('\n>')) {
            return <p key={index} className="text-yellow-400 italic my-2">{entry.trim()}</p>;
          }
          return <p key={index} className="mb-4 animate-fade-in">{entry.trim()}</p>;
        })}
      </div>
      <div ref={logEndRef} />
    </div>
  );
};

export default StoryLog;
