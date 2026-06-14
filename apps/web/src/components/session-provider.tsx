'use client';

import React, { useEffect } from 'react';
import { useGetMeQuery } from '@/store/services/authApi';
import { useDispatch, useSelector } from 'react-redux';
import { setCredentials, logoutState, setLoading } from '@/store/slices/authSlice';
import type { RootState } from '@/store';

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  
  // Try to load the user on mount if we're not authenticated.
  // If we have no accessToken, baseQueryWithReauth will attempt to refresh
  // via HTTP-only cookie automatically.
  const { data, isLoading, isError, isSuccess, isFetching } = useGetMeQuery(undefined, {
    skip: isAuthenticated,
  });

  useEffect(() => {
    // If we're already authenticated, nothing to do
    if (isAuthenticated) return;

    if (isLoading || isFetching) {
      dispatch(setLoading(true));
    } else if (isSuccess && data?.success && data?.data) {
      dispatch(setCredentials({
        user: data.data.user,
        // accessToken is optional now, and handled by updateAccessToken in baseQueryWithReauth
      }));
    } else if (isError) {
      dispatch(logoutState());
    }
  }, [isLoading, isFetching, isSuccess, isError, data, dispatch, isAuthenticated]);

  return <>{children}</>;
}
