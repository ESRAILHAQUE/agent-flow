import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from './apiSlice';

export interface AdminStats {
  totalOrganizations: number;
  totalUsers: number;
  totalAgents: number;
  totalConversations: number;
  totalMessages: number;
  totalDocuments: number;
  recentOrgs: AdminOrg[];
}

export interface AdminOrg {
  id: string;
  name: string;
  slug: string;
  plan: string;
  createdAt: string;
  owner: { name: string; email: string };
  _count: { agents: number; conversations: number; documents: number };
  subscription: { plan: string; status: string } | null;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  emailVerified: boolean;
  isSuspended: boolean;
  suspendReason: string | null;
  createdAt: string;
  ownedOrgs: { id: string; name: string; plan: string }[];
}

export interface AdminSubscription {
  id: string;
  plan: string;
  status: string;
  createdAt: string;
  currentPeriodStart: string | null;
  currentPeriodEnd: string | null;
  organization: {
    id: string;
    name: string;
    owner: { email: string };
  };
}

export interface AdminPayment {
  id: string;
  amount: number;
  currency: string;
  status: string;
  createdAt: string;
  subscription: {
    plan: string;
    organization: { name: string };
  };
}

export const adminApi = createApi({
  reducerPath: 'adminApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['AdminStats', 'AdminOrg', 'AdminUser', 'AdminSubscription', 'AdminPayment'],
  endpoints: (builder) => ({
    getSystemStats: builder.query<{ success: boolean; data: AdminStats }, void>({
      query: () => '/admin/stats',
      providesTags: ['AdminStats'],
    }),
    getAllOrganizations: builder.query<{ success: boolean; data: AdminOrg[]; meta: any }, { page?: number }>({
      query: ({ page = 1 } = {}) => `/admin/organizations?page=${page}&limit=20`,
      providesTags: ['AdminOrg'],
    }),
    getAllUsers: builder.query<{ success: boolean; data: AdminUser[]; meta: any }, { page?: number }>({
      query: ({ page = 1 } = {}) => `/admin/users?page=${page}&limit=20`,
      providesTags: ['AdminUser'],
    }),
    getAllSubscriptions: builder.query<{ success: boolean; data: AdminSubscription[]; meta: any }, { page?: number }>({
      query: ({ page = 1 } = {}) => `/admin/subscriptions?page=${page}&limit=20`,
      providesTags: ['AdminSubscription'],
    }),
    getAllPayments: builder.query<{ success: boolean; data: AdminPayment[]; meta: any }, { page?: number }>({
      query: ({ page = 1 } = {}) => `/admin/payments?page=${page}&limit=20`,
      providesTags: ['AdminPayment'],
    }),
    deleteOrganization: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({ url: `/admin/organizations/${id}`, method: 'DELETE' }),
      invalidatesTags: ['AdminOrg', 'AdminStats', 'AdminSubscription'],
    }),
    updateOrgPlan: builder.mutation<{ success: boolean; data: any }, { id: string; plan: string }>({
      query: ({ id, plan }) => ({ url: `/admin/organizations/${id}/plan`, method: 'PUT', body: { plan } }),
      invalidatesTags: ['AdminOrg', 'AdminSubscription'],
    }),
    updateUserRole: builder.mutation<{ success: boolean; data: any }, { id: string; role: string }>({
      query: ({ id, role }) => ({ url: `/admin/users/${id}/role`, method: 'PUT', body: { role } }),
      invalidatesTags: ['AdminUser'],
    }),
    suspendUser: builder.mutation<{ success: boolean; data: any }, { id: string; reason?: string }>({
      query: ({ id, reason }) => ({ url: `/admin/users/${id}/suspend`, method: 'POST', body: { reason } }),
      invalidatesTags: ['AdminUser'],
    }),
    activateUser: builder.mutation<{ success: boolean; data: any }, string>({
      query: (id) => ({ url: `/admin/users/${id}/activate`, method: 'POST' }),
      invalidatesTags: ['AdminUser'],
    }),
    impersonateUser: builder.mutation<{ success: boolean; data: { accessToken: string; user: any }; message: string }, string>({
      query: (id) => ({ url: `/admin/users/${id}/impersonate`, method: 'POST' }),
    }),
    getSettings: builder.query<{ success: boolean; data: any[] }, void>({
      query: () => '/admin/settings',
      providesTags: ['AdminStats'],
    }),
    updateSetting: builder.mutation<{ success: boolean; data: any }, { key: string; value: any; description?: string }>({
      query: ({ key, ...body }) => ({ url: `/admin/settings/${key}`, method: 'PUT', body }),
      invalidatesTags: ['AdminStats'],
    }),
    getNotifications: builder.query<{ success: boolean; data: any[] }, void>({
      query: () => '/admin/notifications',
      providesTags: ['AdminStats'],
    }),
    createNotification: builder.mutation<{ success: boolean; data: any }, { title: string; message: string; type: string }>({
      query: (body) => ({ url: '/admin/notifications', method: 'POST', body }),
      invalidatesTags: ['AdminStats'],
    }),
    deleteNotification: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({ url: `/admin/notifications/${id}`, method: 'DELETE' }),
      invalidatesTags: ['AdminStats'],
    }),
  }),
});

export const {
  useGetSystemStatsQuery,
  useGetAllOrganizationsQuery,
  useGetAllUsersQuery,
  useGetAllSubscriptionsQuery,
  useGetAllPaymentsQuery,
  useDeleteOrganizationMutation,
  useUpdateOrgPlanMutation,
  useUpdateUserRoleMutation,
  useSuspendUserMutation,
  useActivateUserMutation,
  useImpersonateUserMutation,
  useGetSettingsQuery,
  useUpdateSettingMutation,
  useGetNotificationsQuery,
  useCreateNotificationMutation,
  useDeleteNotificationMutation,
} = adminApi;
