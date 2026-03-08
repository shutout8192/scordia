'use client';

interface ChoiceButtonProps {
  choice: 'A' | 'B' | 'C' | 'D';
  text: string;
  state: 'idle' | 'correct' | 'wrong' | 'disabled';
  onClick: () => void;
}

export function ChoiceButton({ choice, text, state, onClick }: ChoiceButtonProps) {
  const speak = () => {
    if (typeof window === 'undefined') return;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  };

  const stateStyles = {
    idle: 'bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer',
    correct: 'bg-green-100 dark:bg-green-900 cursor-default',
    wrong: 'bg-red-100 dark:bg-red-900 cursor-default',
    disabled: 'bg-gray-50 dark:bg-gray-800 opacity-50 cursor-not-allowed',
  };

  return (
    <button
      onClick={state === 'idle' ? onClick : undefined}
      disabled={state === 'disabled'}
      className={`w-full flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-600 transition-colors ${stateStyles[state]}`}
    >
      <span className="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-full bg-gray-200 dark:bg-gray-600 text-sm font-bold text-gray-700 dark:text-gray-200">
        {choice}
      </span>
      <span className="flex-1 text-left text-sm text-gray-800 dark:text-gray-100">{text}</span>
      <button
        onClick={(e) => {
          e.stopPropagation();
          speak();
        }}
        className="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors p-1"
        aria-label={`Read choice ${choice} aloud`}
      >
        🔊
      </button>
    </button>
  );
}
