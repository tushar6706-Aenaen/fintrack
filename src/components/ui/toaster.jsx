import { useToast } from "@/hooks/use-toast"
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"
import { CheckCircle, AlertCircle, XCircle, Info } from "lucide-react"
import { useEffect, useState } from "react"

export function Toaster() {
  const { toasts } = useToast()

  const getToastIcon = (variant) => {
    switch (variant) {
      case "success":
        return <CheckCircle className="h-5 w-5 text-emerald-400 flex-shrink-0 mt-0.5" />
      case "destructive":
        return <XCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
      default:
        return <Info className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" />
    }
  }

  const getProgressBarColor = (variant) => {
    switch (variant) {
      case "success":
        return "bg-emerald-400"
      case "destructive":
        return "bg-red-400"
      default:
        return "bg-blue-400"
    }
  }

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, variant, ...props }) {
        return (
          <Toast key={id} variant={variant} {...props}>
            {/* Progress bar */}
            <div className="absolute bottom-0 left-0 h-1 w-full bg-zinc-700/30 overflow-hidden">
              <div 
                className={`h-full ${getProgressBarColor(variant)} animate-pulse`}
                style={{
                  animation: "toast-progress 5s linear forwards"
                }}
              />
            </div>
            
            <div className="flex items-start gap-3 w-full">
              {getToastIcon(variant)}
              <div className="flex-1 grid gap-1">
                {title && <ToastTitle>{title}</ToastTitle>}
                {description && (
                  <ToastDescription>{description}</ToastDescription>
                )}
              </div>
            </div>
            {action}
            <ToastClose />
          </Toast>
        );
      })}
      <ToastViewport />
    </ToastProvider>
  );
}
