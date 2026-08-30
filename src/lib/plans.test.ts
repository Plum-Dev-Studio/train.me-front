import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  planStatusLabel,
  filenameFromContentDisposition,
  downloadPlanPdf,
  pickUserFacingPlan,
  createPlanFromTemplate,
  publishPlan,
  type PlanDto,
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

  it('appends section query for exercises or nutrition', async () => {
    const clickSpy = vi.fn()
    const realCreate = document.createElement.bind(document)
    vi.spyOn(document, 'createElement').mockImplementation((tag: string) => {
      if (tag === 'a') {
        const el = realCreate('a')
        el.click = clickSpy
        return el
      }
      return realCreate(tag)
    })

    await downloadPlanPdf('plan-uuid-1', 'exercises')

    expect(apiModule.apiFetchBlob).toHaveBeenCalledWith(
      '/plans/plan-uuid-1/pdf?section=exercises',
      { method: 'GET' },
    )
  })
})

describe('pickUserFacingPlan', () => {
  const base: PlanDto = {
    id: 'p-1',
    trainerId: 't-1',
    userId: 'u-1',
    templateId: null,
    status: 'draft',
    startDate: null,
    endDate: null,
    notes: null,
    nutrition: null,
    createdAt: '2026-08-01T00:00:00.000Z',
    updatedAt: '2026-08-01T00:00:00.000Z',
  }

  it('returns null for an empty list', () => {
    expect(pickUserFacingPlan([])).toBeNull()
  })

  it('prefers published over draft', () => {
    const picked = pickUserFacingPlan([
      {
        ...base,
        id: 'draft',
        status: 'draft',
        updatedAt: '2026-08-10T00:00:00.000Z',
      },
      {
        ...base,
        id: 'pub',
        status: 'published',
        updatedAt: '2026-08-02T00:00:00.000Z',
      },
    ])
    expect(picked?.id).toBe('pub')
  })
})

describe('createPlanFromTemplate', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('POSTs /plans', async () => {
    const created: PlanDto = {
      ...{
        id: 'plan-1',
        trainerId: 'tr-1',
        userId: 'u-1',
        templateId: 'pt-1',
        status: 'draft',
        startDate: null,
        endDate: null,
        notes: null,
        nutrition: null,
        createdAt: '2026-08-01T00:00:00.000Z',
        updatedAt: '2026-08-01T00:00:00.000Z',
      },
    }
    vi.spyOn(apiModule, 'apiFetch').mockResolvedValue(created)

    const result = await createPlanFromTemplate({
      trainerId: 'tr-1',
      userId: 'u-1',
      templateId: 'pt-1',
    })

    expect(apiModule.apiFetch).toHaveBeenCalledWith('/plans', {
      method: 'POST',
      body: JSON.stringify({
        trainerId: 'tr-1',
        userId: 'u-1',
        templateId: 'pt-1',
      }),
    })
    expect(result.id).toBe('plan-1')
  })

  it('POSTs optional startDate and endDate', async () => {
    vi.spyOn(apiModule, 'apiFetch').mockResolvedValue({
      id: 'plan-1',
      trainerId: 'tr-1',
      userId: 'u-1',
      templateId: 'pt-1',
      status: 'draft',
      startDate: '2026-09-01T00:00:00.000Z',
      endDate: '2026-12-01T00:00:00.000Z',
      notes: null,
      nutrition: null,
      createdAt: '2026-08-01T00:00:00.000Z',
      updatedAt: '2026-08-01T00:00:00.000Z',
    })

    await createPlanFromTemplate({
      trainerId: 'tr-1',
      userId: 'u-1',
      templateId: 'pt-1',
      startDate: '2026-09-01T00:00:00.000Z',
      endDate: '2026-12-01T00:00:00.000Z',
    })

    expect(apiModule.apiFetch).toHaveBeenCalledWith('/plans', {
      method: 'POST',
      body: JSON.stringify({
        trainerId: 'tr-1',
        userId: 'u-1',
        templateId: 'pt-1',
        startDate: '2026-09-01T00:00:00.000Z',
        endDate: '2026-12-01T00:00:00.000Z',
      }),
    })
  })
})

describe('publishPlan', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('POSTs /plans/:id/publish', async () => {
    vi.spyOn(apiModule, 'apiFetch').mockResolvedValue({
      id: 'plan-1',
      trainerId: 'tr-1',
      userId: 'u-1',
      templateId: 'pt-1',
      status: 'published',
      startDate: null,
      endDate: null,
      notes: null,
      nutrition: null,
      createdAt: '2026-08-01T00:00:00.000Z',
      updatedAt: '2026-08-01T00:00:00.000Z',
    })

    await publishPlan('plan-1')

    expect(apiModule.apiFetch).toHaveBeenCalledWith('/plans/plan-1/publish', {
      method: 'POST',
    })
  })
})
