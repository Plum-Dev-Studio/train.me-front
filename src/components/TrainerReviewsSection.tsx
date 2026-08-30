import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ApiError } from '@/lib/api'
import {
  fetchPublicTrainerReviews,
  upsertMyTrainerReview,
  type TrainerReviewItem,
} from '@/lib/trainerReviews'
import { TrainerReviewStars } from '@/components/TrainerReviewStars'

interface TrainerReviewsSectionProps {
  trainerId: string
  summary: {
    averageRating: number | null
    reviewCount: number
  }
  canReview?: boolean
}

function ReviewItem({ review }: { review: TrainerReviewItem }) {
  return (
    <article className="rounded-xl border border-[var(--border-standard)] bg-[var(--bg-page)] p-4">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[14px] font-medium text-[var(--text-primary)]">
          {review.reviewerDisplayName}
        </p>
        <p className="text-[13px] text-[var(--text-secondary)]">
          {'★'.repeat(review.rating)}
          {'☆'.repeat(5 - review.rating)}
        </p>
      </div>
      {review.comment ? (
        <p className="mt-2 whitespace-pre-wrap text-[14px] text-[var(--text-secondary)]">
          {review.comment}
        </p>
      ) : null}
    </article>
  )
}

export function TrainerReviewsSection({
  trainerId,
  summary,
  canReview = false,
}: TrainerReviewsSectionProps) {
  const queryClient = useQueryClient()
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [message, setMessage] = useState<string | null>(null)

  const reviewsQuery = useQuery({
    queryKey: ['trainer-reviews', trainerId],
    queryFn: () => fetchPublicTrainerReviews(trainerId),
  })

  const saveMutation = useMutation({
    mutationFn: () =>
      upsertMyTrainerReview(trainerId, {
        rating,
        comment: comment.trim() === '' ? null : comment.trim(),
      }),
    onSuccess: async () => {
      setMessage('Reseña guardada.')
      await queryClient.invalidateQueries({
        queryKey: ['trainer-reviews', trainerId],
      })
      await queryClient.invalidateQueries({
        queryKey: ['public-trainer', trainerId],
      })
    },
    onError: (error) => {
      if (error instanceof ApiError && error.status === 403) {
        setMessage('Solo alumnos con suscripción pueden dejar una reseña.')
        return
      }
      setMessage('No pudimos guardar tu reseña.')
    },
  })

  const displaySummary = reviewsQuery.data ?? summary

  return (
    <section className="rounded-2xl border border-[var(--border-standard)] bg-[var(--bg-card)] p-6">
      <h2 className="font-display text-[20px] font-bold text-[var(--text-primary)]">
        Reseñas
      </h2>
      <div className="mt-2">
        <TrainerReviewStars
          averageRating={displaySummary.averageRating}
          reviewCount={displaySummary.reviewCount}
        />
      </div>

      {reviewsQuery.isPending ? (
        <p className="mt-4 text-[14px] text-[var(--text-secondary)]">
          Cargando…
        </p>
      ) : reviewsQuery.isError ? (
        <p className="mt-4 text-[14px] text-[var(--status-expired)]">
          No pudimos cargar las reseñas.
        </p>
      ) : (
        <div className="mt-4 flex flex-col gap-3">
          {reviewsQuery.data?.data.length ? (
            reviewsQuery.data.data.map((review) => (
              <ReviewItem key={review.id} review={review} />
            ))
          ) : (
            <p className="text-[14px] text-[var(--text-secondary)]">
              Todavía no hay reseñas.
            </p>
          )}
        </div>
      )}

      {canReview ? (
        <form
          className="mt-6 flex flex-col gap-3 border-t border-[var(--border-standard)] pt-4"
          onSubmit={(event) => {
            event.preventDefault()
            setMessage(null)
            saveMutation.mutate()
          }}
        >
          <p className="text-[14px] font-medium text-[var(--text-primary)]">
            Dejá tu reseña
          </p>
          <label className="flex flex-col gap-1 text-[13px] text-[var(--text-secondary)]">
            Puntuación
            <select
              value={rating}
              onChange={(e) => setRating(Number(e.target.value))}
              className="rounded-lg border border-[var(--border-standard)] bg-transparent px-3 py-2 text-[14px] text-[var(--text-primary)]"
            >
              {[5, 4, 3, 2, 1].map((value) => (
                <option key={value} value={value}>
                  {value} estrellas
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-[13px] text-[var(--text-secondary)]">
            Comentario (opcional)
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
              className="rounded-lg border border-[var(--border-standard)] bg-transparent px-3 py-2 text-[14px] text-[var(--text-primary)]"
            />
          </label>
          <button
            type="submit"
            disabled={saveMutation.isPending}
            className="self-start rounded-xl bg-[var(--accent-purple)] px-5 py-2.5 text-[14px] font-semibold text-white hover:opacity-90 disabled:opacity-50"
          >
            {saveMutation.isPending ? 'Guardando…' : 'Publicar reseña'}
          </button>
          {message ? (
            <p
              role="status"
              className="text-[13px] text-[var(--text-secondary)]"
            >
              {message}
            </p>
          ) : null}
        </form>
      ) : null}
    </section>
  )
}
