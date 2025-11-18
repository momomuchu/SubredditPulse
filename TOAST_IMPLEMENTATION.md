# 🎉 Toast Notification System - Implementation Complete

A comprehensive toast notification system has been added to your Next.js boilerplate using [Sonner](https://sonner.emilkowal.ski/).

## ✅ What's Been Added

### 1. **Core Files**

- **`src/components/ui/Toaster.tsx`** - The toast container component (already added to your layout)
- **`src/utils/toast.ts`** - Utility functions for all toast operations
- **`src/components/ui/ToastExamples.tsx`** - Example component showing all toast patterns
- **`src/components/ui/FileUpload.tsx`** - Real-world example with file upload

### 2. **Package Installed**

```bash
npm install sonner
```

### 3. **Layout Updated**

The `Toaster` component has been added to `src/app/[locale]/layout.tsx` so toasts work globally across your app.

## 🚀 Quick Start

### Basic Usage

```tsx
import { toast } from '@/utils/toast';

// Success
toast.success('Profile updated!');

// Error
toast.error('Failed to save changes');

// Warning
toast.warning('This action cannot be undone');

// Info
toast.info('New features available');
```

### With Descriptions

```tsx
toast.error('Upload failed', {
  description: 'File size exceeds 10MB limit',
});
```

### Promise-based (Perfect for API calls)

```tsx
toast.promise(
  fetch('/api/data').then(r => r.json()),
  {
    loading: 'Loading data...',
    success: 'Data loaded successfully!',
    error: 'Failed to load data',
  }
);
```

### Error Handling

```tsx
try {
  await riskyOperation();
} catch (err) {
  toast.handleError(err); // Automatically handles Error objects and strings
}
```

## 📋 Available Functions

| Function | Description |
|----------|-------------|
| `toast.success(message, options?)` | Show success notification |
| `toast.error(message, options?)` | Show error notification |
| `toast.warning(message, options?)` | Show warning notification |
| `toast.info(message, options?)` | Show info notification |
| `toast.loading(message, options?)` | Show loading notification |
| `toast.promise(promise, messages)` | Promise-based toast with auto state |
| `toast.handleError(error, fallback?)` | Smart error handler |
| `toast.formError(title, errors)` | Display form validation errors |
| `toast.action(message, options)` | Toast with action button |
| `toast.dismiss(id?)` | Dismiss specific or all toasts |

## 🎯 Real-World Example

The **`CreditsPurchase`** component has been updated to use toasts:

**Before:**
```tsx
// Inline error state management
const [errorMessage, setErrorMessage] = useState<string | null>(null);
// ... error div in JSX
```

**After:**
```tsx
// Clean toast notifications
toast.promise(
  createCheckoutSession(packageId),
  {
    loading: 'Processing payment...',
    success: 'Redirecting to checkout...',
    error: err => `Payment failed: ${err.message}`,
  }
);
```

## 📚 Examples & Documentation

### View All Examples

To see all toast patterns in action, import and use the `ToastExamples` component:

```tsx
import { ToastExamples } from '@/components/ui/ToastExamples';

// Add to a page temporarily to test
<ToastExamples />;
```

### Complete Documentation

Full documentation available at: `docs/features/TOAST_NOTIFICATIONS.md`

## 🎨 Customization

### Change Position

Edit `src/components/ui/Toaster.tsx`:

```tsx
<Toaster
  position="bottom-right" // Change position
  // ... other props
/>;
```

**Available positions:**
- `top-left`, `top-center`, `top-right`
- `bottom-left`, `bottom-center`, `bottom-right`

### Custom Styling

Modify `toastOptions.classNames` in the Toaster component to customize appearance.

### Duration

```tsx
// 10 seconds
toast.success('Message', { duration: 10000 });

// Infinite (manual dismiss)
toast.info('Important', { duration: Infinity });
```

## 💡 Best Practices

### ✅ DO

- Use toasts for important user feedback (form submissions, errors, confirmations)
- Use `toast.promise()` for async operations
- Use `toast.handleError()` for consistent error handling
- Keep messages concise and actionable
- Use descriptions for additional context

### ❌ DON'T

- Show toasts for every user action
- Use toasts for navigation feedback
- Display sensitive information
- Create duplicate toasts (check before calling)
- Use extremely long messages

## 🔧 Common Patterns

### API Call with Error Handling

```tsx
async function saveData(data: FormData) {
  try {
    const response = await fetch('/api/save', {
      method: 'POST',
      body: data,
    });

    if (!response.ok) {
      const error = await response.json();
      toast.error(error.message);
      return;
    }

    toast.success('Data saved successfully!');
  } catch (err) {
    toast.handleError(err);
  }
}
```

### Form Submission

```tsx
async function handleSubmit(formData: FormData) {
  const toastId = toast.loading('Submitting form...');

  try {
    await submitForm(formData);
    toast.success('Form submitted!');
  } catch (err) {
    toast.error('Submission failed');
  } finally {
    toast.dismiss(toastId);
  }
}
```

### Server Action Integration

```tsx
'use client';

import { updateProfile } from '@/actions/profile';
import { toast } from '@/utils/toast';

export function ProfileForm() {
  async function handleSubmit(formData: FormData) {
    const result = await updateProfile(formData);

    if (result.error) {
      toast.error(result.error);
      return;
    }

    toast.success('Profile updated!');
  }

  return <form action={handleSubmit}>...</form>;
}
```

## 🎁 Bonus Features

### Action Buttons

```tsx
toast.action('Item deleted', {
  action: {
    label: 'Undo',
    onClick: () => restoreItem(),
  },
});
```

### Form Validation Errors

```tsx
const errors = validateForm(data);

if (Object.keys(errors).length > 0) {
  toast.formError('Please fix the errors:', errors);
}
```

### Rich Content (JSX)

```tsx
import { toast as sonnerToast } from 'sonner';

sonnerToast.custom(
  <div className="flex items-center gap-3">
    <img src="/icon.png" className="size-10" />
    <div>
      <strong>Welcome!</strong>
      <p>Your account is ready</p>
    </div>
  </div>
);
```

## 📱 Accessibility

Sonner toasts are fully accessible:
- ✅ ARIA attributes
- ✅ Keyboard navigation
- ✅ Screen reader support
- ✅ Focus management
- ✅ Close button for keyboard users

## 🔗 Resources

- [Sonner Documentation](https://sonner.emilkowal.ski/)
- [Full Feature Documentation](./docs/features/TOAST_NOTIFICATIONS.md)
- [Example Component](./src/components/ui/ToastExamples.tsx)
- [Real Implementation](./src/components/dashboard/CreditsPurchase.tsx)

## 🚀 Next Steps

1. **Test it out**: Import and use the `ToastExamples` component
2. **Update existing components**: Replace inline error states with toasts
3. **Add to forms**: Integrate with your form submission handlers
4. **Customize**: Adjust position, duration, and styling to match your brand
5. **Remove examples**: Delete `ToastExamples.tsx` when done testing

---

**Happy toasting! 🍞** Your users will appreciate the clean, consistent feedback system.
