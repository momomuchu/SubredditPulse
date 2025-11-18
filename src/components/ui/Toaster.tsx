'use client';

import { Toaster as SonnerToaster } from 'sonner';

/**
 * Toast Notification Component
 *
 * A centralized toast notification system using Sonner.
 * Add this component to your layout to enable toast notifications throughout your app.
 *
 * Features:
 * - Success, error, warning, info, and loading states
 * - Dark mode support
 * - Customizable position and duration
 * - Rich content support (JSX elements)
 * - Promise-based toasts
 * - Action buttons
 *
 * @example
 * import { Toaster } from '@/components/ui/Toaster';
 *
 * export default function Layout({ children }) {
 *   return (
 *     <html>
 *       <body>
 *         {children}
 *         <Toaster />
 *       </body>
 *     </html>
 *   );
 * }
 */
export function Toaster() {
  return (
    <SonnerToaster
      position="top-right"
      closeButton
      richColors
      expand
      visibleToasts={5}
      toastOptions={{
        classNames: {
          toast: 'font-sans',
          title: 'font-semibold',
          description: 'text-sm opacity-90',
          actionButton: 'bg-primary text-primary-foreground hover:bg-primary/90',
          cancelButton: 'bg-muted text-muted-foreground hover:bg-muted/80',
          closeButton: 'bg-white/10 hover:bg-white/20',
        },
      }}
    />
  );
}
