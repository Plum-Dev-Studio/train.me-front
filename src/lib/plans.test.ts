import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  planStatusLabel,
  filenameFromContentDisposition,
  downloadPlanPdf,
} from './plans'
import * as apiModule from './api'

describe('planStatusLabel', () => {
  it('maps plan statuses to Spanish', () => {
    expect(planStatusLabel('draft')).toBe('Borrador')
    expect(planStatusLabel('published')).toBe('Publicado')
    expect(planStatusLabel('archived')).toBe('Archivado')
  })
})

describe('filenameFromContentDisposition', () => {
  it('parses quoted filename', () => {
    expect(
      filenameFromContentDisposition('attachment; filename="plan-xyz.pdf"'),
    ).toBe('plan-xyz.pdf')
  })

  it('returns null when header missing', () => {
    expect(filenameFromContentDisposition(null)).toBeNull()
  })
})

describe('downloadPlanPdf', () => {
  beforeEach(() => {
    vi.spyOn(apiModule, 'apiFetchBlob').mockResolvedValue({
      blob: new Blob(['x'], { type: 'application/pdf' }),
      contentDisposition: 'attachment; filename="plan-id.pdf"',
    })
    vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:mock')
    vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('fetches /plans/:id/pdf with encoded id and uses filename from header', async () => {
    const clickSpy = vi.fn()
    let anchor: HTMLAnchorElement | undefined
    const realCreate = document.createElement.bind(document)
    vi.spyOn(document, 'createElement').mockImplementation((tag: string) => {
      if (tag === 'a') {
        const el = realCreate('a')
        el.click = clickSpy
        anchor = el as HTMLAnchorElement
        return el
      }
      return realCreate(tag)
    })

    await downloadPlanPdf('plan-uuid-1')

    expect(apiModule.apiFetchBlob).toHaveBeenCalledWith(
      '/plans/plan-uuid-1/pdf',
      {
        method: 'GET',
      },
    )
    expect(clickSpy).toHaveBeenCalled()
    expect(anchor).toBeDefined()
    expect(anchor!.download).toBe('plan-id.pdf')
  })
})
