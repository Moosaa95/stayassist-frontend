import { apiSlice } from "@/states/services/apiSlice";

interface Host {
    host__first_name: string;
    host__last_name: string;
    host__email: string;
}

export interface Listing {
    id: string;
    title: string;
    description: string;
    price_per_night: string;
    city: string;
    photos: string[];
    host__first_name: string;
    host__last_name: string;
    host__email: string;
    created_at: string;
    updated_at: string;
    max_guests: number;
}

export interface ListingDetail extends Listing {
    total_bookings: number;
}

interface FetchListingsRequest {
    filters?: {
        city?: string;
        check_in?: string;
        check_out?: string;
    };
    count?: number;
}

interface FetchListingsResponse {
    status: boolean;
    message: string;
    data: Listing[];
}

interface ListingDetailRequest {
    id: string;
}

interface ListingDetailResponse {
    status: boolean;
    message: string;
    data: ListingDetail;
}

const listingsApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        fetchListings: builder.mutation<FetchListingsResponse, FetchListingsRequest | void>({
            query: (body = {}) => ({
                url: '/stay/listings/',
                method: 'POST',
                body,
            }),
        }),
        fetchListingDetail: builder.mutation<ListingDetailResponse, ListingDetailRequest>({
            query: (body) => ({
                url: '/stay/get_listing/',
                method: 'POST',
                body,
            }),
        }),
    }),
});

export const {
    useFetchListingsMutation,
    useFetchListingDetailMutation,
} = listingsApiSlice;
