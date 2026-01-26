'use client';

import { ReactNode } from 'react';
import { useUserVerification } from '../hooks/useUserVerification';
import { LoadingSpinner } from './LoadingSpinner';

type ProtectedPageProps = {
  children: ReactNode;
  fallback?: ReactNode;
};

export const ProtectedPage = ({ children, fallback }: ProtectedPageProps) => {
  const { isVerified, loading } = useUserVerification();

  if (loading || isVerified === null || isVerified === false) {
    return fallback || <LoadingSpinner />;
  }

  return <>{children}</>;
};
