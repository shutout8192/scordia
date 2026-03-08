import { Question } from '@/types/question';

interface ExplanationPanelProps {
  question: Question;
  userAnswer: 'A' | 'B' | 'C' | 'D';
}

export function ExplanationPanel({ question, userAnswer }: ExplanationPanelProps) {
  const isCorrect = userAnswer === question.answer;
  const choices = ['A', 'B', 'C', 'D'] as const;
  return (
    <div className="mt-4 p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
      <h3 className={`text-lg font-bold mb-3 ${isCorrect ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
        {isCorrect ? '✅ 正解！' : `❌ 不正解 — 正解: ${question.answer}`}
      </h3>
      <div className="space-y-2">
        {choices.map((c) => {
          const isAnswer = c === question.answer;
          const isUserWrong = c === userAnswer && !isCorrect;
          return (
            <div key={c} className={`p-3 rounded text-sm ${
              isAnswer ? 'bg-green-50 dark:bg-green-900/20 border border-green-300 dark:border-green-700' :
              isUserWrong ? 'bg-red-50 dark:bg-red-900/20 border border-red-300 dark:border-red-700' :
              'bg-gray-50 dark:bg-gray-700/50'
            }`}>
              <span className="font-semibold mr-2">{c}.</span>
              {question.explanation[c]}
            </div>
          );
        })}
      </div>
    </div>
  );
}
