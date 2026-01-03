// Mock implementation of jose for testing
export class SignJWT {
    private payload: any;

    constructor(payload: any) {
        this.payload = payload;
    }

    setProtectedHeader() {
        return this;
    }

    setIssuedAt() {
        return this;
    }

    setExpirationTime() {
        return this;
    }

    async sign() {
        // Return a fake JWT token
        return `mock.jwt.${Buffer.from(JSON.stringify(this.payload)).toString('base64')}`;
    }
}

export async function jwtVerify(token: string, key: any) {
    try {
        // Extract payload from mock token
        const parts = token.split('.');
        if (parts.length !== 3 || parts[0] !== 'mock') {
            throw new Error('Invalid token');
        }

        const payload = JSON.parse(Buffer.from(parts[2], 'base64').toString());
        return { payload };
    } catch {
        throw new Error('Invalid token');
    }
}
