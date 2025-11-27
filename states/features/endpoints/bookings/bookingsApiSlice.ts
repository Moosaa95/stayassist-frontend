import { apiSlice } from "@/states/services/apiSlice";

export interface CreateBookingRequest {
    listing_id: string;
    check_in: string; // YYYY-MM-DD
    check_out: string; // YYYY-MM-DD
    number_of_guests: number;
    user: string; // user ID
}

interface CreateBookingResponse {
    status: boolean;
    message: string;
}

const bookingsApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        createBooking: builder.mutation<CreateBookingResponse, CreateBookingRequest>({
            query: (body) => ({
                url: '/stay/bookings/',
                method: 'POST',
                body,
            }),
        }),
    }),
});

export const {
    useCreateBookingMutation,
} = bookingsApiSlice;
