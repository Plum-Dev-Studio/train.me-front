import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { TrainerReviewStars } from './TrainerReviewStars'

describe('TrainerReviewStars', () => {
  it('shows empty state when no reviews', () => {
    render(<TrainerReviewStars averageRating={null} reviewCount={0} />)
    expect(screen.getByText('Sin reseñas todavía')).toBeInTheDocument()
  })

  it('shows average and count', () => {
    render(<TrainerReviewStars averageRating={4.5} reviewCount={2} />)
    expect(screen.getByText('4.5')).toBeInTheDocument()
    expect(screen.getByText(/2 reseñas/)).toBeInTheDocument()
  })
})
