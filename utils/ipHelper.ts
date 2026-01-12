import { NextRequest } from 'next/server';

export const getClientIp = (req: NextRequest) => {
  const forwarded = req.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0] : '127.0.0.1';
  return ip;
};



