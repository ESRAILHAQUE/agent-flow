import { configureStore } from '@reduxjs/toolkit';
import authReducer from '@/store/slices/authSlice';
import { authApi } from '@/store/services/authApi';
import { orgApi } from '@/store/services/orgApi';
import { agentApi } from '@/store/services/agentApi';
import { chatApi } from '@/store/services/chatApi';
import { workflowApi } from '@/store/services/workflowApi';
import { leadsApi } from '@/store/services/leadsApi';
import { adminApi } from '@/store/services/adminApi';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    [authApi.reducerPath]: authApi.reducer,
    [orgApi.reducerPath]: orgApi.reducer,
    [agentApi.reducerPath]: agentApi.reducer,
    [chatApi.reducerPath]: chatApi.reducer,
    [workflowApi.reducerPath]: workflowApi.reducer,
    [leadsApi.reducerPath]: leadsApi.reducer,
    [adminApi.reducerPath]: adminApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(authApi.middleware, orgApi.middleware, agentApi.middleware, chatApi.middleware, workflowApi.middleware, leadsApi.middleware, adminApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
