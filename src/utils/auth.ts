import * as jwt from 'jsonwebtoken';

export const APP_SECRET = "GraphQL-is-aw3some";

export interface IAuthTokenPayload {
    userId: number
};

export function decodeAuthHeader(authHeader: string): IAuthTokenPayload | null {

    if (!authHeader.startsWith('Bearer ')) {
        return null;
    }

    const token = authHeader.replace('Bearer ', '');

    if (!token) return null;

    return jwt.verify(token, APP_SECRET) as IAuthTokenPayload;
}