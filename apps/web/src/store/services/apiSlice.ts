import { fetchBaseQuery, type BaseQueryFn, type FetchArgs, type FetchBaseQueryError } from '@reduxjs/toolkit/query/react';
import { logoutState, updateAccessToken } from '@/store/slices/authSlice';
import type { RootState } from '@/store';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

const baseQuery = fetchBaseQuery({
  baseUrl: API_BASE_URL,
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth.accessToken;
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  },
});

/**
 * Custom base query wrapper that handles automatic refresh tokens on 401 Unauthorized
 */
export const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);

  if (result.error && result.error.status === 401) {
    // Attempt token refresh
    try {
      const refreshResult = await baseQuery(
        {
          url: '/auth/refresh',
          method: 'POST',
        },
        api,
        extraOptions,
      );

      if (refreshResult.data) {
        const { accessToken } = (refreshResult.data as { data: { accessToken: string } }).data;
        api.dispatch(updateAccessToken(accessToken));
        
        // Retry initial request with new token
        result = await baseQuery(args, api, extraOptions);
      } else {
        // Refresh token invalid or expired
        api.dispatch(logoutState());
      }
    } catch (error) {
      api.dispatch(logoutState());
    }
  }

  return result;
};
