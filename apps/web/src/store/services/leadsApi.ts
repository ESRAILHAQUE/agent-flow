import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from './apiSlice';

export interface Lead {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  status: 'NEW' | 'CONTACTED' | 'QUALIFIED' | 'CONVERTED' | 'LOST';
  source?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: { id: string; name: string; email: string };
}

export const leadsApi = createApi({
  reducerPath: 'leadsApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Lead'],
  endpoints: (builder) => ({
    getLeads: builder.query<{ success: boolean; data: Lead[] }, void>({
      query: () => '/leads',
      providesTags: ['Lead'],
    }),
    createLead: builder.mutation<{ success: boolean; data: Lead }, Partial<Lead>>({
      query: (body) => ({ url: '/leads', method: 'POST', body }),
      invalidatesTags: ['Lead'],
    }),
    updateLead: builder.mutation<{ success: boolean; data: Lead }, { id: string; data: Partial<Lead> }>({
      query: ({ id, data }) => ({ url: `/leads/${id}`, method: 'PUT', body: data }),
      invalidatesTags: ['Lead'],
    }),
    deleteLead: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({ url: `/leads/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Lead'],
    }),
  }),
});

export const {
  useGetLeadsQuery,
  useCreateLeadMutation,
  useUpdateLeadMutation,
  useDeleteLeadMutation,
} = leadsApi;
