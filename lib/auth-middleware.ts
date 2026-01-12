import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';

export interface AuthenticatedRequest extends NextRequest {
  user?: {
    userId: string;
    iat: number;
    exp: number;
  };
}

export const authenticate = (req: NextRequest) => {
  try {
    // Try both lowercase and capitalized Authorization header (Next.js should handle case-insensitive, but be safe)
    const authHeader = req.headers.get('authorization') || req.headers.get('Authorization');
    
    if (!authHeader) {
      console.warn('[Auth] No Authorization header found');
      return null;
    }

    // Extract token from "Bearer <token>" format
    const parts = authHeader.split(' ');
    const token = parts.length > 1 ? parts[1] : parts[0];
    
    if (!token) {
      console.warn('[Auth] No token found in Authorization header');
      return null;
    }

    if (!process.env.JWT_SECRET) {
        console.error('[Auth] JWT_SECRET is not defined');
        throw new Error("JWT_SECRET is not defined");
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET) as { userId: string; iat: number; exp: number };
    return decoded;
  } catch (error: any) {
    // Log specific error types for debugging (without exposing sensitive info)
    if (error.name === 'TokenExpiredError') {
      console.warn('[Auth] Token has expired');
    } else if (error.name === 'JsonWebTokenError') {
      console.warn('[Auth] Invalid token:', error.message);
    } else if (error.name === 'NotBeforeError') {
      console.warn('[Auth] Token not active yet');
    } else {
      console.error('[Auth] Authentication error:', error.message);
    }
    return null;
  }
};



