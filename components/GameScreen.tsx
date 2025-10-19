import React, { useState } from 'react';
import { Scene } from '../types';
import StoryLog from './StoryLog';
import ChoiceButtons from './ChoiceButtons';
import LoadingSpinner from './LoadingSpinner';

const PlayerInput: React.FC<{ onSubmit: (text: string) => void; disabled: boolean }> = ({ onSubmit, disabled }) => {
    const [inputValue, setInputValue] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (inputValue.trim() && !disabled) {
            onSubmit(inputValue.trim());
            setInputValue('');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="mt-4 animate-fade-in">
            <div className="flex gap-2">
                <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    disabled={disabled}
                    placeholder="직접 행동을 입력하세요..."
                    className="flex-grow bg-gray-800 text-gray-200 rounded-md border border-gray-700 p-3 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all duration-200 disabled:bg-gray-700 disabled:cursor-not-allowed"
                    aria-label="Custom action input"
                />
                <button
                    type="submit"
                    disabled={disabled || !inputValue.trim()}
                    className="px-6 py-2 bg-yellow-500 text-black font-bold rounded-lg hover:bg-yellow-400 transition-colors disabled:bg-gray-600 disabled:text-gray-400 disabled:cursor-not-allowed"
                >
                    입력
                </button>
            </div>
        </form>
    );
};


interface GameScreenProps {
  storyLog: string[];
  scene: Scene | null;
  onChoice: (choice: string) => void;
  onTextInput: (text: string) => void;
  isLoading: boolean;
}

const GameScreen: React.FC<GameScreenProps> = ({ storyLog, scene, onChoice, onTextInput, isLoading }) => {
  return (
    <div className="flex flex-col h-full">
      <StoryLog log={storyLog} />
      <div className="mt-auto pt-4">
        {isLoading ? (
          <div className="flex justify-center items-center h-48">
            <LoadingSpinner />
          </div>
        ) : (
          scene && (
            <>
              <ChoiceButtons choices={scene.choices} onChoice={onChoice} disabled={isLoading} />
              <PlayerInput onSubmit={onTextInput} disabled={isLoading} />
            </>
          )
        )}
      </div>
    </div>
  );
};

export default GameScreen;
