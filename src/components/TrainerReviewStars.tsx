interface TrainerReviewStarsProps {
  averageRating: number | null
  reviewCount: number
}

export function TrainerReviewStars({
  averageRating,
  reviewCount,
}: TrainerReviewStarsProps) {
  if (reviewCount === 0 || averageRating === null) {
    return (
      <p className="text-[14px] text-[var(--text-secondary)]">
        Sin reseñas todavía
      </p>
    )
  }

  return (
    <p className="text-[14px] text-[var(--text-primary)]">
      <span className="font-semibold">{averageRating.toFixed(1)}</span>
      <span className="text-[var(--text-secondary)]">
        {' '}
        · {reviewCount} {reviewCount === 1 ? 'reseña' : 'reseñas'}
      </span>
    </p>
  )
}
