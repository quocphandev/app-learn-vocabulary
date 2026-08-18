import { Rating, type Grade } from 'ts-fsrs';

const OPTIONS: { grade: Grade; label: string; icon: string; className: string }[] = [
  { grade: Rating.Again, label: 'Chưa nhớ', icon: '✕', className: 'rating-button--again' },
  { grade: Rating.Good, label: 'Đã nhớ', icon: '✓', className: 'rating-button--good' },
];

export function RatingButtons({ onRate }: { onRate: (grade: Grade) => void }) {
  return (
    <div className="rating-buttons">
      {OPTIONS.map((opt) => (
        <button
          key={opt.grade}
          className={`rating-button ${opt.className}`}
          onClick={() => onRate(opt.grade)}
        >
          <span className="rating-button__icon">{opt.icon}</span>
          {opt.label}
        </button>
      ))}
    </div>
  );
}
