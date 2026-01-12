declare module 'jsonwebtoken' {
  export interface SignOptions {
    expiresIn?: string | number;
    algorithm?: string;
    issuer?: string;
    subject?: string;
    audience?: string;
    [key: string]: any;
  }

  export interface VerifyOptions {
    algorithms?: string[];
    issuer?: string;
    subject?: string;
    audience?: string;
    [key: string]: any;
  }

  export interface DecodeOptions {
    complete?: boolean;
    json?: boolean;
  }

  export function sign(payload: string | object | Buffer, secretOrPrivateKey: string, options?: SignOptions): string;
  export function verify(token: string, secretOrPublicKey: string, options?: VerifyOptions): object | string;
  export function decode(token: string, options?: DecodeOptions): null | { [key: string]: any } | string;
}

