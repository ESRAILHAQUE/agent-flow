import { configureStore } from '@reduxjs/toolkit';
import authReducer from '@/store/slices/authSlice';
import { authApi } from '@/store/services/authApi';
import { orgApi } from '@/store/services/orgApi';
import { agentApi } from '@/store/services/agentApi';
import { chatApi } from '@/store/services/chatApi';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    [authApi.reducerPath]: authApi.reducer,
    [orgApi.reducerPath]: orgApi.reducer,
    [agentApi.reducerPath]: agentApi.reducer,
    [chatApi.reducerPath]: chatApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(authApi.middleware, orgApi.middleware, agentApi.middleware, chatApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
