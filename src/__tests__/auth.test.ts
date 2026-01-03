import { hashPassword, verifyPassword, signJWT, verifyJWT } from '@/lib/auth';

describe('Auth Utilities', () => {
    describe('Password Hashing', () => {
        it('should hash password correctly', async () => {
            const password = 'testPassword123';
            const hash = await hashPassword(password);

            expect(hash).toBeDefined();
            expect(hash).not.toBe(password);
            expect(hash.length).toBeGreaterThan(0);
        });

        it('should verify correct password', async () => {
            const password = 'testPassword123';
            const hash = await hashPassword(password);
            const isValid = await verifyPassword(password, hash);

            expect(isValid).toBe(true);
        });

        it('should reject incorrect password', async () => {
            const password = 'testPassword123';
            const wrongPassword = 'wrongPassword';
            const hash = await hashPassword(password);
            const isValid = await verifyPassword(wrongPassword, hash);

            expect(isValid).toBe(false);
        });
    });

    describe('JWT', () => {
        it('should create and verify JWT token', async () => {
            const payload = {
                userId: 'test123',
                username: 'testuser',
                role: 'manager',
            };

            const token = await signJWT(payload);
            expect(token).toBeDefined();
            expect(typeof token).toBe('string');

            const verified = await verifyJWT(token);
            expect(verified).toBeDefined();
            expect(verified?.userId).toBe(payload.userId);
            expect(verified?.username).toBe(payload.username);
            expect(verified?.role).toBe(payload.role);
        });

        it('should return null for invalid token', async () => {
            const invalidToken = 'invalid.token.here';
            const verified = await verifyJWT(invalidToken);

            expect(verified).toBeNull();
        });
    });
});
