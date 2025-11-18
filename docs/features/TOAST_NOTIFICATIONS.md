# Toast Notifications

This boilerplate includes a comprehensive toast notification system using [Sonner](https://sonner.emilkowal.ski/), providing a modern, accessible, and highly customizable way to show user feedback.

## Features

- ✅ **Multiple types**: success, error, warning, info, loading
- 🎨 **Automatic dark mode support**
- ⚡ **Promise-based toasts** for async operations
- 🎯 **Action buttons** for interactive notifications
- 📝 **Rich content support** (JSX elements)
- 🔔 **Customizable position and duration**
- ♿ **Fully accessible**

## Quick Start

The toast system is already set up in your app. Simply import and use:

```tsx
import { toast } from '@/utils/toast';

// Success notification
toast.success('Profile updated successfully!');

// Error notification
toast.error('Failed to save changes');

// Warning
toast.warning('Your session is about to expire');

// Info
toast.info('New features available');
```

## Basic Usage

### Success Toast

```tsx
import { toast } from '@/utils/toast';

function updateProfile() {
  try {
    // ... update logic
    toast.success('Profile updated successfully');
  } catch (error) {
    toast.error('Failed to update profile');
  }
}
```

### Error Toast

```tsx
import { toast } from '@/utils/toast';

// Simple error message
toast.error('Something went wrong');

// Error with description
toast.error('Failed to save', {
  description: 'Please check your internet connection',
});

// Automatic Error object handling
try {
  throw new Error('API request failed');
} catch (err) {
  toast.error(err); // Automatically extracts the message
}
```

### Custom Duration

```tsx
// Show for 10 seconds
toast.success('This will stay for 10 seconds', {
  duration: 10000,
});

// Show indefinitely (must be manually dismissed)
toast.info('Read this carefully', {
  duration: Infinity,
});
```

## Advanced Usage

### Promise-based Toasts

Perfect for async operations like API calls:

```tsx
import { toast } from '@/utils/toast';

async function uploadFile(file: File) {
  toast.promise(
    fetch('/api/upload', {
      method: 'POST',
      body: file,
    }),
    {
      loading: 'Uploading file...',
      success: 'File uploaded successfully!',
      error: 'Failed to upload file',
    }
  );
}

// With dynamic messages based on result
toast.promise(
  updateUser(userId, data),
  {
    loading: 'Updating user...',
    success: user => `${user.name}'s profile updated`,
    error: err => `Error: ${err.message}`,
  }
);
```

### Action Buttons

Add interactive buttons to your toasts:

```tsx
import { useRouter } from 'next/navigation';
import { toast } from '@/utils/toast';

function MyComponent() {
  const router = useRouter();

  const handleUpdate = () => {
    toast.action('Profile updated successfully', {
      action: {
        label: 'View Profile',
        onClick: () => router.push('/profile'),
      },
    });
  };

  return <button onClick={handleUpdate}>Update</button>;
}
```

### Loading States

For manual control over loading toasts:

```tsx
import { toast } from '@/utils/toast';

async function processData() {
  const toastId = toast.loading('Processing data...');

  try {
    await someAsyncOperation();

    // Update to success
    toast.success('Data processed successfully');
    toast.dismiss(toastId);
  } catch (error) {
    // Update to error
    toast.error('Failed to process data');
    toast.dismiss(toastId);
  }
}
```

## Error Handling Utilities

### Handle Any Error

Automatically handles different error types:

```tsx
import { toast } from '@/utils/toast';

async function fetchData() {
  try {
    const response = await fetch('/api/data');
    if (!response.ok) {
      throw new Error('Failed to fetch');
    }
    const data = await response.json();
    return data;
  } catch (err) {
    toast.handleError(err); // Automatically shows appropriate error message
  }
}
```

### Form Validation Errors

Display multiple form errors in one toast:

```tsx
import { toast } from '@/utils/toast';

function handleSubmit(formData) {
  const errors = validateForm(formData);

  if (Object.keys(errors).length > 0) {
    toast.formError('Please fix the following errors:', {
      email: 'Invalid email format',
      password: 'Password must be at least 8 characters',
    });
  }

  // Continue with submission...
}
```

## Server Actions Integration

Use toasts with Next.js Server Actions:

```tsx
'use client';

import { updateProfileAction } from '@/actions/profile';
import { toast } from '@/utils/toast';

export function ProfileForm() {
  async function handleSubmit(formData: FormData) {
    try {
      const result = await updateProfileAction(formData);

      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success('Profile updated successfully!');
    } catch (err) {
      toast.handleError(err);
    }
  }

  return (
    <form action={handleSubmit}>
      {/* form fields */}
    </form>
  );
}
```

## API Route Error Handling

Example of consistent error handling in API routes:

```tsx
// app/api/users/route.ts
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const data = await request.json();

    // Validation
    if (!data.email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Process...

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Client-side usage
async function createUser(data) {
  try {
    const response = await fetch('/api/users', {
      method: 'POST',
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      toast.error(result.error);
      return;
    }

    toast.success('User created successfully!');
  } catch (err) {
    toast.handleError(err);
  }
}
```

## Customization

### Position

Change the toast position globally in `src/components/ui/Toaster.tsx`:

```tsx
<Toaster
  position="top-right" // Options: top-left, top-right, bottom-left, bottom-right, top-center, bottom-center
  // ... other props
/>;
```

### Styling

Customize toast appearance in `src/components/ui/Toaster.tsx`:

```tsx
<Toaster
  toastOptions={{
    classNames: {
      toast: 'font-sans',
      title: 'font-semibold',
      description: 'text-sm opacity-90',
      // ... customize as needed
    },
  }}
/>;
```

## Best Practices

1. **Be concise**: Keep messages short and actionable
   ```tsx
   ✅ toast.success('Profile saved');
   ❌ toast.success('Your profile has been successfully saved to the database');
   ```

2. **Provide context for errors**: Use descriptions for more details
   ```tsx
   toast.error('Failed to upload', {
     description: 'File size exceeds 10MB limit',
   });
   ```

3. **Use promise toasts for async operations**: Better UX for loading states
   ```tsx
   toast.promise(saveData(), {
     loading: 'Saving...',
     success: 'Saved!',
     error: 'Failed to save',
   });
   ```

4. **Don't overuse**: Only show toasts for important user feedback
   - ✅ Form submission success/failure
   - ✅ Important state changes
   - ❌ Every button click
   - ❌ Navigation events

5. **Handle errors consistently**: Use `toast.handleError()` for a unified approach
   ```tsx
   try {
     await riskyOperation();
   } catch (err) {
     toast.handleError(err, 'Operation failed');
   }
   ```

## Accessibility

Sonner toasts are fully accessible and include:

- Proper ARIA attributes
- Keyboard navigation support
- Screen reader announcements
- Focus management
- Close buttons for keyboard users

## Examples in This Boilerplate

Check these files for real-world examples:

- Authentication forms: `src/components/auth/`
- Dashboard actions: `src/components/dashboard/`
- Server actions: `src/actions/`

## API Reference

### `toast.success(message, options?)`
Display a success notification.

### `toast.error(message, options?)`
Display an error notification. Accepts `Error` objects.

### `toast.info(message, options?)`
Display an info notification.

### `toast.warning(message, options?)`
Display a warning notification.

### `toast.loading(message, options?)`
Display a loading notification. Returns toast ID.

### `toast.promise(promise, messages)`
Display promise-based notification with loading, success, and error states.

### `toast.handleError(error, fallbackMessage?)`
Automatically handle any error type and display appropriate message.

### `toast.formError(title, errors)`
Display form validation errors.

### `toast.action(message, options)`
Display notification with action button.

### `toast.dismiss(toastId?)`
Dismiss a specific toast or all toasts.

## Related

- [Sonner Documentation](https://sonner.emilkowal.ski/)
- [Error Handling Guide](./ERROR_HANDLING.md)
- [Form Validation](./FORM_VALIDATION.md)
