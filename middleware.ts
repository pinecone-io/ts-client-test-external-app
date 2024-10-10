import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Retrieve the API key from headers
  const apiKey = request.headers.get('PINECONE_API_KEY');

  // Check if the API key is present
  if (!apiKey) {
    // If the API key is missing, return a 401 Unauthorized response
    return NextResponse.json(
      { error: 'PINECONE_API_KEY header is required' },
      { status: 401 }
    );
  }

  // Allow the request to proceed if the API key is present
  return NextResponse.next();
}
