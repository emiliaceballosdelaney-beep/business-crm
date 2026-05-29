import { ButtonHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

type Variant = 'primary' | 'secondary' | 'ghost' | 'outline' | 'destructive'
type Size = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
}

const VARIANT: Record<Variant, string> = {
  primary:     'text-white hover:opacity-90',
  secondary:   'hover:opacity-80',
  ghost:       'hover:bg-black/5',
  outline:     'border hover:bg-black/5',
  destructive: 'text-white hover:opacity-90',
}

const VARIANT_STYLE: Record<Variant, React.CSSProperties> = {
  primary:     { backgroundColor: 'var(--primary)', color: '#fff' },
  secondary:   { backgroundColor: 'var(--secondary)', color: 'var(--secondary-foreground)' },
  ghost:       { backgroundColor: 'transparent', color: 'var(--foreground)' },
  outline:     { backgroundColor: 'transparent', borderColor: 'var(--border)', color: 'var(--foreground)' },
  destructive: { backgroundColor: '#ef4444', color: '#fff' },
}

const SIZE: Record<Size, string> = {
  sm: 'h-7 px-3 text-xs',
  md: 'h-9 px-4 text-sm',
  lg: 'h-10 px-5 text-sm',
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', className, style, children, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-md font-medium transition-all disabled:opacity-50 disabled:pointer-events-none',
        VARIANT[variant],
        SIZE[size],
        className
      )}
      style={{ ...VARIANT_STYLE[variant], ...style }}
      {...props}
    >
      {children}
    </button>
  )
)
Button.displayName = 'Button'

export { Button }
