import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { BarChart3, UserPlus, Mail, Lock, User } from 'lucide-react';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Alert from '../../components/common/Alert';
import { useAuth } from '../../hooks/useAuth';

const Register: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { registerUser, error, clearError, isLoading } = useAuth();
  const [registerError, setRegisterError] = useState<string | null>(null);
  
  // Create schema for form validation
  const schema = z
    .object({
      email: z.string().email({ message: t('auth.invalidEmail') }),
      password: z.string().min(8, { message: t('auth.passwordMinLength') }),
      confirmPassword: z.string().min(1, { message: t('auth.requiredField') }),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: t('auth.passwordsMustMatch'),
      path: ['confirmPassword'],
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
      confirmPassword: '',
    },
  });
  
  const onSubmit = async (data: { email: string; password: string; confirmPassword: string }) => {
    try {
      setRegisterError(null);
      await registerUser(data.email, data.password);
      navigate('/dashboard');
    } catch (err: any) {
      setRegisterError(err.message || 'Registration failed');
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
          {t('auth.register')}
        </p>
      </div>
      
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-slate-800 py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {(error || registerError) && (
            <Alert
              variant="error"
              onClose={clearError}
              className="mb-4"
            >
              {error || registerError}
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
              autoComplete="new-password"
              leftIcon={<Lock className="h-5 w-5 text-slate-400" />}
              {...register('password')}
              error={errors.password?.message}
            />
            
            <Input
              id="confirmPassword"
              label={t('auth.confirmPassword')}
              type="password"
              autoComplete="new-password"
              leftIcon={<Lock className="h-5 w-5 text-slate-400" />}
              {...register('confirmPassword')}
              error={errors.confirmPassword?.message}
            />
            
            <div>
              <Button
                type="submit"
                fullWidth
                isLoading={isLoading}
                icon={<UserPlus className="h-4 w-4" />}
              >
                {t('auth.register')}
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
                  {t('auth.alreadyHaveAccount')}
                </span>
              </div>
            </div>
            
            <div className="mt-6">
              <Link
                to="/login"
                className="w-full inline-flex justify-center py-2 px-4 border border-slate-300 dark:border-slate-700 rounded-md shadow-sm bg-white dark:bg-slate-800 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
              >
                {t('auth.login')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;