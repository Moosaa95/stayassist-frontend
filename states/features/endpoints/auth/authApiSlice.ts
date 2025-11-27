import { apiSlice } from "@/states/services/apiSlice";


interface User {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
}



const authApiSlice = apiSlice.injectEndpoints({
    endpoints: builder => ({
        retrieveUser: builder.query<User, void>({
            query: () => '/accounts/me/',
        }),
        login: builder.mutation({
            query: ({ email, password }) => ({
                url: '/accounts/token/',
                method: 'POST',
                body: { email, password },
            }),
        }),
        register: builder.mutation({
            query: ({
                first_name,
                last_name,
                email,
                password,
            }) => ({
                url: '/accounts/register/',
                method: 'POST',
                body: { first_name, last_name, email, password },
            }),
        }),

        logout: builder.mutation({
            query: () => ({
                url: '/accounts/logout/',
                method: 'POST',
            }),
        }),
    }),
});

export const {
    useRetrieveUserQuery,
    useLoginMutation,
    useRegisterMutation,
    useLogoutMutation,
} = authApiSlice;
