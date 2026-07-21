'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { toast } from 'sonner';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        toast.error('Invalid email or password');
      } else {
        toast.success('Welcome back!');
        router.push('/dashboard');
        router.refresh();
      }
    } catch (error) {
      toast.error('Something went wrong');
    } finally {
      setLoading(false);
    }
  };


  const fillTestUser = (testEmail: string) => {
    setEmail(testEmail);
    setPassword('password123');
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-slate-50 to-indigo-50/50">
      
      {/* Main Card */}
      <div className="w-full max-w-[400px] animate-in fade-in zoom-in-95 duration-500">
        
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-600 text-white text-2xl font-bold shadow-lg shadow-indigo-200 mb-5">
            A
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Welcome to Ajaia Docs
          </h1>
          <p className="mt-2 text-sm text-slate-500 leading-relaxed">
            Sign in to your account to continue
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 p-8">
          <form className="space-y-5" onSubmit={handleSubmit}>
            
            {/* Email Field */}
            <div className="space-y-1.5">
              <label htmlFor="email" className="block text-sm font-medium text-slate-700">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                placeholder="name@company.com"
              />
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="block text-sm font-medium text-slate-700">
                  Password
                </label>
                <button type="button" className="text-xs font-medium text-indigo-600 hover:text-indigo-500">
                  Forgot password?
                </button>
              </div>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                placeholder="••••••••"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="relative w-full flex justify-center items-center rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-200 overflow-hidden"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                'Continue'
              )}
            </button>
          </form>

          {/* Separator */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-100" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-white px-3 text-slate-400 uppercase tracking-wider">
                Dev Environment
              </span>
            </div>
          </div>

          {/* Quick Login Buttons */}
          <div className="grid grid-cols-3 gap-2">
            {[
              { name: 'Alice', email: 'alice@ajaia.test', color: 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border-indigo-100' },
              { name: 'Bob', email: 'bob@ajaia.test', color: 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-100' },
              { name: 'Carol', email: 'carol@ajaia.test', color: 'bg-rose-50 text-rose-700 hover:bg-rose-100 border-rose-100' },
            ].map((user) => (
              <button
                key={user.email}
                type="button"
                onClick={() => fillTestUser(user.email)}
                className={`flex flex-col items-center justify-center py-2.5 px-2 rounded-lg border text-xs font-medium transition-colors duration-200 ${user.color}`}
              >
                <span className="font-bold">{user.name[0]}</span>
                <span className="mt-0.5 opacity-80">{user.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Footer Text */}
        <p className="mt-6 text-center text-xs text-slate-400">
          By continuing, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
}