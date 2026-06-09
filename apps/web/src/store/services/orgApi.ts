import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from './apiSlice';
import type { ApiResponse } from '@agentflow/shared';

export interface Workspace {
  id: string;
  name: string;
  orgId: string;
  createdAt: string;
  updatedAt: string;
  _count?: {
    members: number;
  };
}

export interface WorkspaceMember {
  id: string;
  role: string;
  teamId: string;
  userId: string;
  invitedEmail: string | null;
  inviteAccepted: boolean;
  user: {
    id: string;
    email: string;
    name: string;
    avatar: string | null;
    role: string;
  };
}

export interface OrganizationDetails {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
  plan: string;
  settings: any;
  createdAt: string;
  updatedAt: string;
  subscription?: {
    id: string;
    plan: string;
    status: string;
    currentPeriodEnd: string | null;
  } | null;
}

export const orgApi = createApi({
  reducerPath: 'orgApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Organization', 'Workspace', 'Member'],
  endpoints: (builder) => ({
    getOrganization: builder.query<ApiResponse<OrganizationDetails>, void>({
      query: () => '/org',
      providesTags: ['Organization'],
    }),
    updateOrganization: builder.mutation<ApiResponse<OrganizationDetails>, { name: string; slug?: string }>({
      query: (body) => ({
        url: '/org',
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['Organization'],
    }),
    getWorkspaces: builder.query<ApiResponse<Workspace[]>, void>({
      query: () => '/org/workspaces',
      providesTags: ['Workspace'],
    }),
    createWorkspace: builder.mutation<ApiResponse<Workspace>, { name: string }>({
      query: (body) => ({
        url: '/org/workspaces',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Workspace'],
    }),
    deleteWorkspace: builder.mutation<ApiResponse, string>({
      query: (id) => ({
        url: `/org/workspaces/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Workspace'],
    }),
    getWorkspaceMembers: builder.query<ApiResponse<WorkspaceMember[]>, string>({
      query: (teamId) => `/org/workspaces/${teamId}/members`,
      providesTags: ['Member'],
    }),
    inviteMember: builder.mutation<ApiResponse<WorkspaceMember>, { teamId: string; email: string; role?: string }>({
      query: ({ teamId, ...body }) => ({
        url: `/org/workspaces/${teamId}/invite`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Member'],
    }),
    acceptInvite: builder.mutation<ApiResponse, { token: string; name: string; password?: string }>({
      query: (body) => ({
        url: '/org/accept-invite',
        method: 'POST',
        body,
      }),
    }),
  }),
});

export const {
  useGetOrganizationQuery,
  useUpdateOrganizationMutation,
  useGetWorkspacesQuery,
  useCreateWorkspaceMutation,
  useDeleteWorkspaceMutation,
  useGetWorkspaceMembersQuery,
  useInviteMemberMutation,
  useAcceptInviteMutation,
} = orgApi;
