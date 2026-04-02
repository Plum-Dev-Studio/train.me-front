import { describe, it, expect } from 'vitest'
import { planStatusLabel } from './plans'

describe('planStatusLabel', () => {
  it('maps plan statuses to Spanish', () => {
    expect(planStatusLabel('draft')).toBe('Borrador')
    expect(planStatusLabel('published')).toBe('Publicado')
    expect(planStatusLabel('archived')).toBe('Archivado')
  })
})
