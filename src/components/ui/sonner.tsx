// src/components/ui/sonner.tsx
import { Toaster as SonnerToaster } from "sonner"

export function Toaster(props: any) {
  return (
    <SonnerToaster
      className="toaster group"
      position="top-right"
      richColors
      closeButton
      {...props}
    />
  )
}
