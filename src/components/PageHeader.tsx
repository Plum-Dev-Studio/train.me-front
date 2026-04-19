interface PageHeaderProps {
  title: string
  description?: string
}

export function PageHeader({ title, description }: PageHeaderProps) {
  return (
    <div className="border-b border-[var(--border-standard)] px-8 py-5">
      <h1 className="font-display text-[22px] font-bold text-[var(--text-primary)]">
        {title}
      </h1>
      {description ? (
        <p className="mt-1 text-[14px] text-[var(--text-secondary)]">
          {description}
        </p>
      ) : null}
    </div>
  )
}
