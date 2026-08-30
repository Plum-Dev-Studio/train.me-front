import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { TrainerContactLinks } from './TrainerContactLinks'

describe('TrainerContactLinks', () => {
  it('renders nothing when all channels empty', () => {
    const { container } = render(
      <TrainerContactLinks whatsapp={null} email={null} instagram={null} />,
    )
    expect(container).toBeEmptyDOMElement()
  })

  it('renders only WhatsApp link', () => {
    render(<TrainerContactLinks whatsapp="5491123456789" />)
    const link = screen.getByRole('link', { name: 'WhatsApp' })
    expect(link).toHaveAttribute(
      'href',
      'https://wa.me/5491123456789?text=Hola%2C+te+contacto+desde+train.me.',
    )
  })

  it('renders all three channels', () => {
    render(
      <TrainerContactLinks
        whatsapp="54911"
        email="coach@test.com"
        instagram="coach"
      />,
    )
    expect(screen.getByRole('link', { name: 'WhatsApp' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Email' })).toHaveAttribute(
      'href',
      'mailto:coach@test.com',
    )
    expect(screen.getByRole('link', { name: 'Instagram' })).toHaveAttribute(
      'href',
      'https://instagram.com/coach',
    )
  })
})
