'use client';

import { useState } from 'react';
import { pocQuestions } from '@/data/poc-questions';
import { QuestionCard } from '@/components/QuestionCard';

export default function PracticePage() {
  const [index, setIndex] = useState(0);
  const [answered, setAnswered] = useState<'A' | 'B' | 'C' | 'D' | null>(null);
  const question = pocQuestions[index];

  return (
    <div className="max-w-2xl mx-auto p-4">
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
        問題 {index + 1} / {pocQuestions.length}
      </p>
      <QuestionCard
        question={question}
        onAnswer={(c) => setAnswered(c)}
        answered={answered}
      />
      {answered && (
        <div
          className={`mt-4 p-4 rounded-lg ${
            answered === question.answer
              ? 'bg-green-50 dark:bg-green-900/20'
              : 'bg-red-50 dark:bg-red-900/20'
          }`}
        >
          <p className="font-semibold text-gray-900 dark:text-gray-100">
            {answered === question.answer
              ? '✅ 正解！'
              : `❌ 不正解 (正解: ${question.answer})`}
          </p>
          <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
            {question.explanation[question.answer]}
          </p>
        </div>
      )}
      {answered && (
        <button
          onClick={() => {
            setIndex((i) => (i + 1) % pocQuestions.length);
            setAnswered(null);
          }}
          className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          次の問題 →
        </button>
      )}
    </div>
  );
}
