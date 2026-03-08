import { DarkModeToggle } from '@/components/DarkModeToggle';
import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen bg-white dark:bg-gray-900">
      <div className="absolute top-4 right-4">
        <DarkModeToggle />
      </div>
      <div className="flex flex-col items-center justify-center min-h-screen gap-8">
        <h1 className="text-5xl font-bold text-gray-900 dark:text-gray-100">
          Scordia
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400">
          画像を見て英語のリスニング問題に挑戦しよう
        </p>
        <Link
          href="/api/auth/signin"
          className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
        >
          Googleでログイン
        </Link>
      </div>
    </main>
  );
}
