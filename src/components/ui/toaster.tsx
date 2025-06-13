import { useToast } from "@/hooks/use-toast"
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"

export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, variant, ...props }) {
        let toastVariant: 'default' | 'destructive' | 'success' | 'warning' = 'success';
        if (variant === 'destructive') toastVariant = 'warning';
        else if (variant === 'success') toastVariant = 'success';
        else if (variant === 'warning') toastVariant = 'warning';
        return (
          <Toast key={id} variant={toastVariant} {...props}>
            <div className="grid gap-1">
              {title && <ToastTitle>{title}</ToastTitle>}
              {description && (
                <ToastDescription>{description}</ToastDescription>
              )}
            </div>
            {action}
            <ToastClose />
          </Toast>
        )
      })}
      <ToastViewport className="fixed top-4 right-4 left-auto bottom-auto" />
    </ToastProvider>
  )
}
