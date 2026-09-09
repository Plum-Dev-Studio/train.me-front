import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { Sidebar } from './Sidebar'
import { useTrainerDashboard } from '@/contexts/useTrainerDashboard'

vi.mock('@/contexts/useTrainerDashboard', () => ({
  useTrainerDashboard: vi.fn(),
}))

function renderSidebar(initialPath: string) {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Sidebar />
    </MemoryRouter>,
  )
}

function activeLinkNames() {
  return screen
    .getAllByRole('link')
    .filter((link) => link.getAttribute('aria-current') === 'page')
    .map((link) => link.textContent?.trim())
}

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(useTrainerDashboard).mockReturnValue({
    data: { trainer: { displayName: 'Ana Gómez' } },
    isPending: false,
    isError: false,
  } as unknown as ReturnType<typeof useTrainerDashboard>)
})

describe('Sidebar active nav item', () => {
  it('marks only Panel as active on the index route', () => {
    renderSidebar('/app')

    expect(activeLinkNames()).toEqual(['Panel'])
  })

  it('marks only Ejercicios as active on /app/ejercicios', () => {
    renderSidebar('/app/ejercicios')

    expect(activeLinkNames()).toEqual(['Ejercicios'])
  })

  it('does not keep Panel active on other sections', () => {
    renderSidebar('/app/clientes')

    expect(activeLinkNames()).toEqual(['Clientes'])
  })

  it('keeps Plantillas active on the nested template editor route', () => {
    renderSidebar('/app/plantillas/template-1')

    expect(activeLinkNames()).toEqual(['Plantillas'])
  })
})
