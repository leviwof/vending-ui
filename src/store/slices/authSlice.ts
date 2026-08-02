import { createSlice, PayloadAction } from '@reduxjs/toolkit';

type AuthState = {
  accessToken?: string;
  role?: string;
};

const initialState: AuthState = {};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setSession(state, action: PayloadAction<AuthState>) {
      state.accessToken = action.payload.accessToken;
      state.role = action.payload.role;
    },
    clearSession(state) {
      state.accessToken = undefined;
      state.role = undefined;
    },
  },
});

export const { setSession, clearSession } = authSlice.actions;
export default authSlice.reducer;
