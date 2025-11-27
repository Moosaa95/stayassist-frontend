import { createSlice, PayloadAction } from "@reduxjs/toolkit"

interface User {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
}

interface AuthState {
    isAuthenticated: boolean;
    isLoading: boolean;
    user: User | null;
}


const initialState = {
    isAuthenticated: false,
    isLoading: true,
    user: null,
} as AuthState


const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        setAuth: (state, action: PayloadAction<User | undefined>) => {
            state.isAuthenticated = true;
            if (action.payload) {
                state.user = action.payload;
            }
            if (typeof window !== 'undefined') {
                localStorage.setItem("isAuthenticated", JSON.stringify(true));
            }
        },
        logout: state => {
            state.isAuthenticated = false
            state.user = null
            if (typeof window !== 'undefined') {
                localStorage.setItem("isAuthenticated", JSON.stringify(false));
            }
        },
        finishInitialLoad: state => {
            state.isLoading = false;
        }
    }
})


export const {
    setAuth,
    logout,
    finishInitialLoad,
} = authSlice.actions;

export default authSlice.reducer;


export const selectIsAuthenticated = (state: any) => state.auth.isAuthenticated;
export const selectIsLoading = (state: any) => state.auth.isLoading;
export const selectCurrentUser = (state: any) => state.auth.user;