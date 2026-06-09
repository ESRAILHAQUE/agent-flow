import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from './apiSlice';

export interface Agent {
  id: string;
  name: string;
  description?: string;
  persona: string;
  modelId: string;
  tools: any[];
  isActive: boolean;
  orgId: string;
  createdById: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: { name: string; email: string };
}

export const agentApi = createApi({
  reducerPath: 'agentApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Agent'],
  endpoints: (builder) => ({
    getAgents: builder.query<{ success: boolean; data: Agent[] }, void>({
      query: () => '/agents',
      providesTags: ['Agent'],
    }),
    getAgentById: builder.query<{ success: boolean; data: Agent }, string>({
      query: (id) => `/agents/${id}`,
      providesTags: (result, error, id) => [{ type: 'Agent', id }],
    }),
    createAgent: builder.mutation<{ success: boolean; data: Agent; message: string }, Partial<Agent>>({
      query: (body) => ({
        url: '/agents',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Agent'],
    }),
    updateAgent: builder.mutation<{ success: boolean; data: Agent; message: string }, { id: string; data: Partial<Agent> }>({
      query: ({ id, data }) => ({
        url: `/agents/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Agent', id }, 'Agent'],
    }),
    deleteAgent: builder.mutation<{ success: boolean; message: string }, string>({
      query: (id) => ({
        url: `/agents/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Agent'],
    }),
  }),
});

export const {
  useGetAgentsQuery,
  useGetAgentByIdQuery,
  useCreateAgentMutation,
  useUpdateAgentMutation,
  useDeleteAgentMutation,
} = agentApi;
