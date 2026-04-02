import { describe, it, expect } from 'vitest'
import {
  initialsFromFullName,
  mapTrainerClientStatus,
  planTypeLabel,
} from './trainerDashboard'

describe('initialsFromFullName', () => {
  it('returns two letters from first and last word', () => {
    expect(initialsFromFullName('Maria Lopez')).toBe('ML')
  })

  it('uppercases result', () => {
    expect(initialsFromFullName('juan pérez')).toBe('JP')
  })

  it('uses first two chars for a single word', () => {
    expect(initialsFromFullName('Madonna')).toBe('MA')
  })

  it('returns question mark for empty string', () => {
    expect(initialsFromFullName('')).toBe('?')
  })

  it('trims whitespace', () => {
    expect(initialsFromFullName('  Ana  Maria  Costa  ')).toBe('AM')
  })
})

describe('mapTrainerClientStatus', () => {
  it('maps known statuses to Spanish labels', () => {
    expect(mapTrainerClientStatus('active')).toEqual({
      ui: 'active',
      label: 'Activo',
    })
    expect(mapTrainerClientStatus('pending')).toEqual({
      ui: 'pending',
      label: 'Pendiente',
    })
    expect(mapTrainerClientStatus('expired')).toEqual({
      ui: 'expired',
      label: 'Vencido',
    })
    expect(mapTrainerClientStatus('canceled')).toEqual({
      ui: 'canceled',
      label: 'Cancelado',
    })
  })
})

describe('planTypeLabel', () => {
  it('returns Spanish labels or em dash', () => {
    expect(planTypeLabel('monthly')).toBe('Mensual')
    expect(planTypeLabel('annual')).toBe('Anual')
    expect(planTypeLabel(null)).toBe('—')
  })
})
