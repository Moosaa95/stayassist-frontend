import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"
import type {
    BaseQueryFn,
    FetchArgs,
    FetchBaseQueryError
} from "@reduxjs/toolkit/query"

import { Mutex } from "async-mutex"
import { logout, setAuth } from "../features/slices/auth/authSlice";


function getCookie(name: string): string | null {
    if (typeof window === 'undefined') {
        return null;
    }
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

const mutex = new Mutex(); // to prevent race conditions

const baseQuery = fetchBaseQuery({
    baseUrl: `${process.env.NEXT_PUBLIC_HOST}/api`,
    credentials: 'include',
    prepareHeaders: async (headers, { getState }) => {

        const csrftoken = getCookie('csrftoken');
        if (csrftoken) {
            headers.set('X-CSRFToken', csrftoken);

        }


        return headers;
    },
})




const baseQueryWithReauth: BaseQueryFn<
    string | FetchArgs,
    unknown,
    FetchBaseQueryError
> = async (args, api, extraOptions) => {
    await mutex.waitForUnlock();
    let result = await baseQuery(args, api, extraOptions);
    console.log("API SLICE", result, result.error, args, api, extraOptions);

    if (result.error && result.error.status === 401) {
        console.log("401", result.error.status);

        if (!mutex.isLocked()) {
            const release = await mutex.acquire()
            try {
                const refreshResult = await baseQuery(
                    {
                        url: '/accounts/token/refresh/',
                        method: 'POST',

                    },
                    api,
                    extraOptions
                );
                console.log("REFRESH RESULT", refreshResult, refreshResult.data);

                if (refreshResult.data) {
                    api.dispatch(setAuth())

                    result = await baseQuery(args, api, extraOptions)
                } else {
                    api.dispatch(logout())
                }
            } finally {
                release()
            }
        } else {
            await mutex.waitForUnlock();
            result = await baseQuery(args, api, extraOptions)
        }
    }

    return result
}


export const apiSlice = createApi({
    reducerPath: 'api',
    baseQuery: baseQueryWithReauth,
    tagTypes: [],
    endpoints: builder => ({})
})