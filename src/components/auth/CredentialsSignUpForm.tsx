'use client';

import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { useState, useTransition } from 'react';
import { registerUser } from '@/actions/register-user';

type CredentialsSignUpFormProps = {
  redirectPath: string;
  labels: {
    heading: string;
    helper: string;
    name: string;
    email: string;
    password: string;
    submit: string;
    errorTaken: string;
    errorGeneric: string;
  };
};

export const CredentialsSignUpForm = ({
  redirectPath,
  labels,
}: CredentialsSignUpFormProps) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  const calculatePasswordStrength = (pwd: string) => {
    let strength = 0;
    if (pwd.length >= 8) {
      strength += 1;
    }
    if (pwd.length >= 12) {
      strength += 1;
    }
    if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) {
      strength += 1;
    }
    if (/\d/.test(pwd)) {
      strength += 1;
    }
    if (/[^a-z\d]/i.test(pwd)) {
      strength += 1;
    }
    return Math.min(strength, 4);
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    setPasswordStrength(calculatePasswordStrength(value));
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength === 0) {
      return 'bg-gray-500/20';
    }
    if (passwordStrength <= 2) {
      return 'bg-red-500';
    }
    if (passwordStrength === 3) {
      return 'bg-yellow-500';
    }
    return 'bg-green-500';
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength === 0) {
      return '';
    }
    if (passwordStrength <= 2) {
      return 'Weak';
    }
    if (passwordStrength === 3) {
      return 'Good';
    }
    return 'Strong';
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    startTransition(async () => {
      const result = await registerUser({
        name: name || undefined,
        email,
        password,
      });

      if (!result.success) {
        if (result.code === 'ACCOUNT_EXISTS') {
          setError(labels.errorTaken);
          return;
        }

        if (result.code === 'INVALID_INPUT') {
          setError(labels.errorGeneric);
          return;
        }

        setError(labels.errorGeneric);
        return;
      }

      const signInResult = await signIn('credentials', {
        email,
        password,
        redirect: false,
        redirectTo: redirectPath,
      });

      if (signInResult?.error) {
        setError(labels.errorGeneric);

        return;
      }

      if (signInResult?.url) {
        window.location.assign(signInResult.url);
      }
    });
  };

  return (
    <div className="group hover:shadow-3xl rounded-2xl border border-slate-200/60 bg-white/95 p-8 shadow-2xl backdrop-blur-sm transition-all hover:border-slate-300/80 dark:border-slate-700/30 dark:bg-slate-800/95">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
          {labels.heading}
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          {labels.helper}
        </p>
      </div>

      <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300" htmlFor="signup-name">
            <svg xmlns="http://www.w3.org/2000/svg" className="size-4 opacity-70" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
            </svg>
            {labels.name}
          </label>
          <div className="relative">
            <input
              id="signup-name"
              name="name"
              type="text"
              autoComplete="name"
              placeholder="John Doe"
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 placeholder-slate-400 transition-all focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-50 dark:placeholder-slate-500 dark:focus:border-violet-400 dark:focus:ring-violet-400/20"
              value={name}
              onChange={event => setName(event.target.value)}
              disabled={isPending}
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300" htmlFor="signup-email">
            <svg xmlns="http://www.w3.org/2000/svg" className="size-4 opacity-70" viewBox="0 0 20 20" fill="currentColor">
              <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
              <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
            </svg>
            {labels.email}
          </label>
          <div className="relative">
            <input
              id="signup-email"
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder="name@example.com"
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 placeholder-slate-400 transition-all focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-50 dark:placeholder-slate-500 dark:focus:border-violet-400 dark:focus:ring-violet-400/20"
              value={email}
              onChange={event => setEmail(event.target.value)}
              disabled={isPending}
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300" htmlFor="signup-password">
            <svg xmlns="http://www.w3.org/2000/svg" className="size-4 opacity-70" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
            </svg>
            {labels.password}
          </label>
          <div className="relative">
            <input
              id="signup-password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              required
              autoComplete="new-password"
              minLength={8}
              placeholder="••••••••"
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 pr-10 text-slate-900 placeholder-slate-400 transition-all focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-50 dark:placeholder-slate-500 dark:focus:border-violet-400 dark:focus:ring-violet-400/20"
              value={password}
              onChange={event => handlePasswordChange(event.target.value)}
              disabled={isPending}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute top-1/2 right-3 -translate-y-1/2 text-slate-400 transition-colors hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
              tabIndex={-1}
            >
              {showPassword
                ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="size-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                      <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                    </svg>
                  )
                : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="size-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                      <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                    </svg>
                  )}
            </button>
          </div>

          {password && (
            <div className="space-y-1">
              <div className="flex gap-1">
                {[...Array.from({ length: 4 })].map((_, i) => (
                  <div
                    key={i}
                    className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                      i < passwordStrength ? getPasswordStrengthColor() : 'bg-slate-300/30 dark:bg-slate-600/30'
                    }`}
                  />
                ))}
              </div>
              {passwordStrength > 0 && (
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Password strength:
                  {' '}
                  <span className="font-medium">{getPasswordStrengthText()}</span>
                </p>
              )}
            </div>
          )}
        </div>

        {error
          ? (
              <div className="animate-shake flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="size-5 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span>{error}</span>
              </div>
            )
          : null}

        <button
          className="group/btn relative w-full overflow-hidden rounded-xl bg-violet-600 px-6 py-3 font-semibold text-white shadow-lg shadow-violet-500/25 transition-all hover:bg-violet-700 hover:shadow-xl hover:shadow-violet-500/40 focus:ring-2 focus:ring-violet-500/50 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 dark:bg-violet-500 dark:shadow-violet-500/20 dark:hover:bg-violet-600"
          type="submit"
          disabled={isPending}
        >
          {isPending
            ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="size-5 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Creating account...</span>
                </span>
              )
            : (
                <span className="flex items-center justify-center gap-2">
                  {labels.submit}
                  <svg xmlns="http://www.w3.org/2000/svg" className="size-5 transform transition-transform group-hover/btn:translate-x-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </span>
              )}
        </button>

        <div className="mt-6 text-center">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Already have an account?
            {' '}
            <Link
              href="/sign-in/"
              className="font-semibold text-violet-600 transition-colors hover:text-violet-700 dark:text-violet-400 dark:hover:text-violet-300"
            >
              Sign in
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
};
