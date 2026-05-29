'use client'

import * as Radix from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

const Dialog = Radix.Root
const DialogTrigger = Radix.Trigger
const DialogClose = Radix.Close

function DialogOverlay({ className }: { className?: string }) {
  return (
    <Radix.Overlay
      className={cn('fixed inset-0 z-50 bg-black/40 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0', className)}
    />
  )
}

function DialogContent({
  className,
  children,
  ...props
}: React.ComponentPropsWithoutRef<typeof Radix.Content>) {
  return (
    <Radix.Portal>
      <DialogOverlay />
      <Radix.Content
        className={cn(
          'fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-xl border p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
          className
        )}
        style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}
        {...props}
      >
        {children}
        <Radix.Close
          className="absolute right-4 top-4 rounded-md p-1 opacity-50 hover:opacity-100 transition-opacity"
          style={{ color: 'var(--foreground)' }}
        >
          <X size={16} />
        </Radix.Close>
      </Radix.Content>
    </Radix.Portal>
  )
}

function DialogHeader({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn('mb-5 flex flex-col gap-1', className)}>{children}</div>
}

function DialogTitle({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <Radix.Title
      className={cn('text-base font-semibold', className)}
      style={{ color: 'var(--foreground)' }}
    >
      {children}
    </Radix.Title>
  )
}

function DialogDescription({ children }: { children: React.ReactNode }) {
  return (
    <Radix.Description className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
      {children}
    </Radix.Description>
  )
}

export {
  Dialog, DialogTrigger, DialogContent, DialogClose,
  DialogHeader, DialogTitle, DialogDescription,
}
