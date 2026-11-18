import type { HTMLAttributes } from 'react'

export const Card = ({ className = '', children, ...resto }: HTMLAttributes<HTMLDivElement>) => (
  <div className={`rounded-xl border border-stone-200 bg-white p-5 shadow-sm ${className}`} {...resto}>
    {children}
  </div>
)
