import { prisma } from '@/lib/prisma';
import {
    getAllEmployees,
    getEmployeeById,
    createEmployee,
    updateEmployee,
    deleteEmployee
} from '@/services/employeeService';

// Mock Prisma
jest.mock('@/lib/prisma', () => ({
    prisma: {
        employee: {
            findMany: jest.fn(),
            findUnique: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
        },
    },
}));

describe('Employee Service', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('getAllEmployees', () => {
        it('should return all employees without passwords', async () => {
            const mockEmployees = [
                { id: '1', name: 'John', email: 'john@test.com', password: 'hash1', role: 'sales' },
                { id: '2', name: 'Jane', email: 'jane@test.com', password: 'hash2', role: 'manager' },
            ];

            (prisma.employee.findMany as jest.Mock).mockResolvedValue(mockEmployees);

            const result = await getAllEmployees();

            expect(result).toHaveLength(2);
            expect(result[0]).not.toHaveProperty('password');
            expect(result[1]).not.toHaveProperty('password');
            expect(result[0].name).toBe('John');
        });
    });

    describe('getEmployeeById', () => {
        it('should return employee by id without password', async () => {
            const mockEmployee = {
                id: '1',
                name: 'John',
                email: 'john@test.com',
                password: 'hash1',
                role: 'sales',
            };

            (prisma.employee.findUnique as jest.Mock).mockResolvedValue(mockEmployee);

            const result = await getEmployeeById('1');

            expect(result).toBeDefined();
            expect(result).not.toHaveProperty('password');
            expect(result?.name).toBe('John');
        });

        it('should return null if employee not found', async () => {
            (prisma.employee.findUnique as jest.Mock).mockResolvedValue(null);

            const result = await getEmployeeById('999');

            expect(result).toBeNull();
        });
    });

    describe('createEmployee', () => {
        it('should create employee with hashed password', async () => {
            const newEmployee = {
                name: 'Test User',
                email: 'test@test.com',
                phone: '123456789',
                role: 'sales' as const,
                username: 'testuser',
                password: 'password123',
            };

            const mockCreated = {
                id: '3',
                ...newEmployee,
                password: 'hashed_password',
                portfolioSize: 0,
                avatar: null,
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            (prisma.employee.create as jest.Mock).mockResolvedValue(mockCreated);

            const result = await createEmployee(newEmployee);

            expect(result).toBeDefined();
            expect(result).not.toHaveProperty('password');
            expect(result.name).toBe(newEmployee.name);
            expect(prisma.employee.create).toHaveBeenCalled();
        });
    });

    describe('updateEmployee', () => {
        it('should update employee', async () => {
            const updateData = {
                name: 'Updated Name',
                email: 'updated@test.com',
            };

            const mockUpdated = {
                id: '1',
                ...updateData,
                password: 'hash',
                role: 'sales',
                phone: '123',
                username: 'test',
                portfolioSize: 0,
                avatar: null,
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            (prisma.employee.update as jest.Mock).mockResolvedValue(mockUpdated);

            const result = await updateEmployee('1', updateData);

            expect(result).toBeDefined();
            expect(result.name).toBe('Updated Name');
            expect(prisma.employee.update).toHaveBeenCalledWith({
                where: { id: '1' },
                data: expect.any(Object),
            });
        });
    });

    describe('deleteEmployee', () => {
        it('should delete employee', async () => {
            (prisma.employee.delete as jest.Mock).mockResolvedValue({ id: '1' });

            const result = await deleteEmployee('1');

            expect(result).toEqual({ success: true });
            expect(prisma.employee.delete).toHaveBeenCalledWith({
                where: { id: '1' },
            });
        });
    });
});
