import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from './apiSlice';

export interface ChatMessageRequest {
  message: string;
}

export interface ChatMessageResponse {
  role: string;
  content: string;
  modelUsed: string;
}

export const chatApi = createApi({
  reducerPath: 'chatApi',
  baseQuery: baseQueryWithReauth,
  endpoints: (builder) => ({
    sendMessage: builder.mutation<{ success: boolean; data: ChatMessageResponse }, { agentId: string; data: ChatMessageRequest }>({
      query: ({ agentId, data }) => ({
        url: `/agents/${agentId}/chat`,
        method: 'POST',
        body: data,
      }),
    }),
  }),
});

export const { useSendMessageMutation } = chatApi;
