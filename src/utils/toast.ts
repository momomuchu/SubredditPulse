import type { ExternalToast } from 'sonner';
import { toast as sonnerToast } from 'sonner';

/**
 * Toast Utility Functions
 *
 * Centralized toast notification utilities for consistent error handling
 * and user feedback throughout the application.
 *
 * @example
 * import { toast } from '@/utils/toast';
 *
 * // Success message
 * toast.success('Profile updated successfully');
 *
 * // Error message
 * toast.error('Failed to save changes');
 *
 * // With custom options
 * toast.error('Session expired', {
 *   description: 'Please log in again',
 *   duration: 5000,
 * });
 *
 * // Promise-based toast
 * toast.promise(
 *   fetchData(),
 *   {
 *     loading: 'Loading data...',
 *     success: 'Data loaded successfully',
 *     error: 'Failed to load data',
 *   }
 * );
 */

export type ToastOptions = ExternalToast;

/**
 * Display a success toast notification
 */
function success(message: string, options?: ToastOptions) {
  return sonnerToast.success(message, {
    duration: 4000,
    ...options,
  });
}

/**
 * Display an error toast notification
 *
 * Automatically handles Error objects and provides helpful feedback
 */
function error(message: string | Error, options?: ToastOptions) {
  const errorMessage = message instanceof Error ? message.message : message;
  const description = message instanceof Error && message.cause
    ? String(message.cause)
    : options?.description;

  return sonnerToast.error(errorMessage, {
    duration: 5000,
    description,
    ...options,
  });
}

/**
 * Display an info toast notification
 */
function info(message: string, options?: ToastOptions) {
  return sonnerToast.info(message, {
    duration: 4000,
    ...options,
  });
}

/**
 * Display a warning toast notification
 */
function warning(message: string, options?: ToastOptions) {
  return sonnerToast.warning(message, {
    duration: 4500,
    ...options,
  });
}

/**
 * Display a loading toast notification
 *
 * Returns a toast ID that can be used to update or dismiss the toast
 */
function loading(message: string, options?: ToastOptions) {
  return sonnerToast.loading(message, options);
}

/**
 * Display a promise-based toast notification
 *
 * Automatically updates the toast based on promise state
 *
 * @example
 * toast.promise(
 *   updateProfile(data),
 *   {
 *     loading: 'Updating profile...',
 *     success: (result) => `Profile updated for ${result.name}`,
 *     error: (err) => `Failed: ${err.message}`,
 *   }
 * );
 */
function promise<T>(
  promiseOrFunction: Promise<T> | (() => Promise<T>),
  messages: {
    loading: string;
    success: string | ((data: T) => string);
    error: string | ((error: Error) => string);
  },
) {
  return sonnerToast.promise(promiseOrFunction, messages);
}

/**
 * Display a custom toast notification
 */
function custom(message: string, options?: ToastOptions) {
  return sonnerToast(message, options);
}

/**
 * Dismiss a specific toast or all toasts
 */
function dismiss(toastId?: string | number) {
  return sonnerToast.dismiss(toastId);
}

/**
 * Handle API errors and display appropriate toast messages
 *
 * Automatically parses common error formats and displays user-friendly messages
 *
 * @example
 * try {
 *   await updateUser(data);
 * } catch (err) {
 *   toast.handleError(err);
 * }
 */
function handleError(err: unknown, fallbackMessage = 'An error occurred') {
  console.error('Error:', err);

  if (err instanceof Error) {
    return error(err.message || fallbackMessage);
  }

  if (typeof err === 'string') {
    return error(err);
  }

  // Handle fetch/API errors
  if (err && typeof err === 'object' && 'message' in err) {
    return error(String(err.message) || fallbackMessage);
  }

  return error(fallbackMessage);
}

/**
 * Handle form validation errors
 *
 * @example
 * const formErrors = {
 *   email: 'Invalid email format',
 *   password: 'Password too short',
 * };
 * toast.formError('Please fix the following errors:', formErrors);
 */
function formError(
  title: string,
  errors: Record<string, string | string[]>,
) {
  const errorMessages = Object.entries(errors)
    .map(([field, message]) => {
      const msg = Array.isArray(message) ? message[0] : message;
      return `${field}: ${msg}`;
    })
    .join('\n');

  return error(title, {
    description: errorMessages,
    duration: 6000,
  });
}

/**
 * Display an action toast with a button
 *
 * @example
 * toast.action('Profile updated', {
 *   action: {
 *     label: 'View',
 *     onClick: () => router.push('/profile'),
 *   },
 * });
 */
function action(
  message: string,
  options: {
    action: {
      label: string;
      onClick: () => void;
    };
  } & ToastOptions,
) {
  const { action: actionConfig, ...restOptions } = options;
  return sonnerToast(message, {
    ...restOptions,
    action: {
      label: actionConfig.label,
      onClick: actionConfig.onClick,
    },
  });
}

export const toast = {
  success,
  error,
  info,
  warning,
  loading,
  promise,
  custom,
  dismiss,
  handleError,
  formError,
  action,
};
