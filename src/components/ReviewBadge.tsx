interface ReviewBadgeProps {
  count: number;
}

export function ReviewBadge({ count }: ReviewBadgeProps) {
  if (count === 0) return null;
  return (
    <span className="absolute -top-1 -right-2 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center font-bold">
      {count > 9 ? '9+' : count}
    </span>
  );
}
