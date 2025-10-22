import React from 'react';

const NumericKeypad = ({ onNumberClick, onBackspace, mode = 'integer' }) => {
  // For decimal mode, show decimal point; for integer mode, show empty
  const numbers = [
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9],
    [mode === 'decimal' ? '.' : '', 0, 'backspace']
  ];

  const handleClick = (value) => {
    if (value === 'backspace') {
      onBackspace();
    } else if (value !== '') {
      onNumberClick(value);
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto">
      {numbers.map((row, rowIndex) => (
        <div key={rowIndex} className="flex justify-center gap-4 mb-4">
          {row.map((num, colIndex) => (
            <button
              key={colIndex}
              onClick={() => handleClick(num)}
              disabled={num === ''}
              className={`
                w-24 h-20 text-3xl font-medium rounded-lg
                flex items-center justify-center
                transition-all
                ${num === ''
                  ? 'invisible'
                  : num === 'backspace'
                    ? 'bg-gray-700 active:bg-gray-600 text-gray-200 border-2 border-gray-600 active:scale-95'
                    : 'bg-gray-800 active:bg-blue-500 active:text-white text-gray-100 border-2 border-gray-600 active:scale-95'
                }
              `}
            >
              {num === 'backspace' ? '⌫' : num}
            </button>
          ))}
        </div>
      ))}
    </div>
  );
};

export default NumericKeypad;
