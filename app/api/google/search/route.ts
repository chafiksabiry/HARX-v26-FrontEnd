
import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q');

    if (!query) {
        return NextResponse.json({ success: false, error: 'Query parameter "q" is required' }, { status: 400 });
    }

    try {
        // Determine the backend URL
        // We prioritize the same environment variables as used in the original client-side code
        const backendUrl = process.env.NEXT_PUBLIC_COMPANY_API_URL || process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL;

        if (!backendUrl) {
            console.error('Backend API URL is not defined');
            return NextResponse.json({ success: false, error: 'Server configuration error' }, { status: 500 });
        }

        // Forward the request to the backend
        // Note: We are using a GET request as per the original implementation
        const response = await axios.get(`${backendUrl}/google/search`, {
            params: { q: query },
            validateStatus: () => true // Handle all status codes manually
        });

        // Pass through the status and data
        return NextResponse.json(response.data, { status: response.status });

    } catch (error: any) {
        console.error('Proxy Error /google/search:', error.message);

        // Handle network errors (when backend is down)
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to contact search service',
                details: error.response?.data || error.message
            },
            { status: error.response?.status || 502 }
        );
    }
}
