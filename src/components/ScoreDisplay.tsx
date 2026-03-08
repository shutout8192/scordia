interface ScoreDisplayProps {
  score: number;
  correct: number;
  total: number;
  accuracyRate: number;
}

export function ScoreDisplay({ score, correct, total, accuracyRate }: ScoreDisplayProps) {
  const scoreColor =
    score >= 700 ? 'text-yellow-500' :
    score >= 500 ? 'text-blue-500' :
    'text-gray-500';

  return (
    <div className="p-6 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-center">
      <div className={`text-6xl font-bold mb-2 ${scoreColor}`}>{score}</div>
      <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
        予測TOEICスコア ※Part1のみ基準。実際のスコアと異なる場合があります
      </p>
      <div className="mb-3">
        <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
          <span>正答率</span>
          <span>{Math.round(accuracyRate * 100)}%</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div
            className="bg-blue-500 h-2 rounded-full transition-all"
            style={{ width: `${accuracyRate * 100}%` }}
          />
        </div>
      </div>
      <p className="text-sm text-gray-600 dark:text-gray-400">
        {correct} / {total} 問正解
      </p>
    </div>
  );
}
