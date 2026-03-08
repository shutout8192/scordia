'use client';

import Image from 'next/image';
import { Question } from '@/types/question';
import { ChoiceButton } from './ChoiceButton';

interface QuestionCardProps {
  question: Question;
  onAnswer: (choice: 'A' | 'B' | 'C' | 'D') => void;
  answered?: 'A' | 'B' | 'C' | 'D' | null;
}

export function QuestionCard({ question, onAnswer, answered }: QuestionCardProps) {
  const getState = (choice: 'A' | 'B' | 'C' | 'D') => {
    if (!answered) return 'idle';
    if (choice === question.answer) return 'correct';
    if (choice === answered) return 'wrong';
    return 'disabled';
  };

  return (
    <div className="rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
      <div className="relative w-full" style={{ aspectRatio: '800/533' }}>
        <Image
          src={question.image_url}
          alt={question.scene}
          width={800}
          height={533}
          className="object-cover w-full h-full"
          priority
        />
      </div>
      <div className="p-4 flex flex-col gap-2">
        {(['A', 'B', 'C', 'D'] as const).map((choice) => (
          <ChoiceButton
            key={choice}
            choice={choice}
            text={question.choices[choice]}
            state={getState(choice)}
            onClick={() => onAnswer(choice)}
          />
        ))}
      </div>
    </div>
  );
}
