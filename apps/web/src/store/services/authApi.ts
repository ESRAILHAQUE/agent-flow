import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from '@/store/services/apiSlice';
import type { ApiResponse, RegisterInput, LoginInput, ForgotPasswordInput, ResetPasswordInput, UserProfile } from '@agentflow/shared';

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: baseQueryWithReauth,
  endpoints: (builder) => ({
    register: builder.mutation<ApiResponse<{ user: UserProfile; accessToken: string }>, RegisterInput>({
      query: (credentials) => ({
        url: '/auth/register',
        method: 'POST',
        body: credentials,
      }),
    }),
    login: builder.mutation<ApiResponse<{ user: UserProfile; accessToken: string }>, LoginInput>({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
    }),
    logout: builder.mutation<ApiResponse, void>({
      query: () => ({
        url: '/auth/logout',
        method: 'POST',
      }),
    }),
    forgotPassword: builder.mutation<ApiResponse, ForgotPasswordInput>({
      query: (body) => ({
        url: '/auth/forgot-password',
        method: 'POST',
        body,
      }),
    }),
    resetPassword: builder.mutation<ApiResponse, ResetPasswordInput>({
      query: (body) => ({
        url: '/auth/reset-password',
        method: 'POST',
        body,
      }),
    }),
    verifyEmail: builder.query<ApiResponse, string>({
      query: (token) => `/auth/verify-email/${token}`,
    }),
    getMe: builder.query<ApiResponse<{ user: UserProfile }>, void>({
      query: () => '/auth/me',
    }),
  }),
});

export const {
  useRegisterMutation,
  useLoginMutation,
  useLogoutMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useVerifyEmailQuery,
  useGetMeQuery,
} = authApi;
