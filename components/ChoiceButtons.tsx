import React from 'react';

interface ChoiceButtonsProps {
  choices: string[];
  onChoice: (choice: string) => void;
  disabled: boolean;
}

const ChoiceButtons: React.FC<ChoiceButtonsProps> = ({ choices, onChoice, disabled }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 animate-fade-in">
      {choices.map((choice, index) => (
        <button
          key={index}
          onClick={() => onChoice(choice)}
          disabled={disabled}
          className="w-full text-left p-4 bg-gray-800 text-gray-200 rounded-md border border-gray-700 hover:bg-yellow-500 hover:text-black hover:border-yellow-500 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-yellow-400 disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed"
        >
          {choice}
        </button>
      ))}
    </div>
  );
};

export default ChoiceButtons;
