"use client"
import { Provider } from "react-redux"
import { useRef, useEffect } from "react";
import { setupListeners } from "@reduxjs/toolkit/query"
import { AppStore, store } from "./stores";
import { useRetrieveUserQuery } from "./features/endpoints/auth/authApiSlice";
import { setAuth, finishInitialLoad } from "./features/slices/auth/authSlice";
import { useDispatch } from "react-redux";

interface Props {
    children: React.ReactNode;
}

function AuthInitializer({ children }: { children: React.ReactNode }) {
    const dispatch = useDispatch();
    const { data, isError, isSuccess } = useRetrieveUserQuery(undefined, {
        skip: typeof window === 'undefined' // Skip on server-side
    });

    useEffect(() => {
        if (isSuccess && data) {
            dispatch(setAuth(data));
        }

        if (isError || isSuccess) {
            dispatch(finishInitialLoad());
        }
    }, [data, isError, isSuccess, dispatch]);

    return <>{children}</>;
}

export default function CustomProvider({ children }: Props) {

    const storeRef = useRef<AppStore | null>(null);

    if (!storeRef.current) {
        storeRef.current = store;
        setupListeners(storeRef.current.dispatch)
    }
    return <Provider store={storeRef.current}>
        <AuthInitializer>
            {children}
        </AuthInitializer>
    </Provider>
}