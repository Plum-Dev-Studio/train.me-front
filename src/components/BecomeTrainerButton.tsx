import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router'
import { registerAsTrainer } from '@/lib/trainerProfiles'

type BecomeTrainerButtonProps = {
  className?: string
  variant?: 'primary' | 'menu'
}

export function BecomeTrainerButton({
  className,
  variant = 'primary',
}: BecomeTrainerButtonProps) {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  const mutation = useMutation({
    mutationFn: registerAsTrainer,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['currentUser'] })
      navigate('/app')
    },
  })

  const baseClassName =
    variant === 'menu'
      ? 'rounded-lg px-3 py-2 text-left text-[14px] text-[var(--text-primary)] hover:bg-[var(--bg-page)] disabled:opacity-50'
      : 'rounded-xl bg-[var(--accent-purple)] px-4 py-2 text-[14px] font-semibold text-white hover:opacity-90 disabled:opacity-50'

  return (
    <button
      type="button"
      onClick={() => mutation.mutate()}
      disabled={mutation.isPending}
      className={className ?? baseClassName}
    >
      {mutation.isPending ? 'Activando…' : 'Soy entrenador'}
    </button>
  )
}
