import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { BarChart3, LogIn, Mail, Lock } from 'lucide-react';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Alert from '../../components/common/Alert';
import { useAuth } from '../../hooks/useAuth';

const Login: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { loginUser, error, clearError, isLoading } = useAuth();
  const [loginError, setLoginError] = useState<string | null>(null);
  
  // Create schema for form validation
  const schema = z.object({
    email: z.string().email({ message: t('auth.invalidEmail') }),
    password: z.string().min(1, { message: t('auth.requiredField') }),
  });
  
  // Set up form
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      email: '',
      password: '',
    },
  });
  
  const onSubmit = async (data: { email: string; password: string }) => {
    try {
      console.log('Starting login submission...');
      setLoginError(null);
      const result = await loginUser(data.email, data.password);
      console.log('Login result:', result);
      
      // If we get here, login was successful
      console.log('Login successful, navigating to dashboard...');
      navigate('/', { replace: true });
    } catch (err: unknown) {
      console.error('Login error:', err);
      if (err && typeof err === 'object' && 'message' in err) {
        setLoginError(err.message as string);
      } else {
        setLoginError('Login failed');
      }
    }
  };
  
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <BarChart3 className="h-12 w-12 text-primary-600" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          SubMonitor
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600 dark:text-slate-400">
          {t('auth.login')}
        </p>
      </div>
      
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-slate-800 py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {(error || loginError) && (
            <Alert
              variant="error"
              onClose={clearError}
              className="mb-4"
            >
              {error || loginError}
            </Alert>
          )}
          
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <Input
              id="email"
              label={t('auth.email')}
              type="email"
              autoComplete="email"
              leftIcon={<Mail className="h-5 w-5 text-slate-400" />}
              {...register('email')}
              error={errors.email?.message}
            />
            
            <Input
              id="password"
              label={t('auth.password')}
              type="password"
              autoComplete="current-password"
              leftIcon={<Lock className="h-5 w-5 text-slate-400" />}
              {...register('password')}
              error={errors.password?.message}
            />
            
            <div>
              <Button
                type="submit"
                fullWidth
                isLoading={isLoading}
                icon={<LogIn className="h-4 w-4" />}
              >
                {t('auth.login')}
              </Button>
            </div>
          </form>
          
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-300 dark:border-slate-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white dark:bg-slate-800 px-2 text-slate-500 dark:text-slate-400">
                  {t('auth.dontHaveAccount')}
                </span>
              </div>
            </div>
            
            <div className="mt-6">
              <Link
                to="/register"
                className="w-full inline-flex justify-center py-2 px-4 border border-slate-300 dark:border-slate-700 rounded-md shadow-sm bg-white dark:bg-slate-800 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
              >
                {t('auth.register')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;