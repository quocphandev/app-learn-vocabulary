import { Rating, type Grade } from 'ts-fsrs';

const OPTIONS: { grade: Grade; label: string; className: string }[] = [
  { grade: Rating.Again, label: 'Quên', className: 'rating-button--again' },
  { grade: Rating.Hard, label: 'Khó', className: 'rating-button--hard' },
  { grade: Rating.Good, label: 'Nhớ', className: 'rating-button--good' },
  { grade: Rating.Easy, label: 'Dễ', className: 'rating-button--easy' },
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
          {opt.label}
        </button>
      ))}
    </div>
  );
}
