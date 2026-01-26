
import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/lib/auth';
import { Role } from '@prisma/client';

export async function getAllEmployees(role?: Role) {
    const where = role ? { role } : {};
    const employees = await prisma.employee.findMany({
        where,
        orderBy: { createdAt: 'desc' },
    });

    // Fetch all active/existing locations to calculate portfolio size dynamically
    const activeLocations = await prisma.location.findMany({
        where: {
            status: {
                in: ['existing', 'active']
            }
        },
        select: {
            assignedEmployeeIds: true
        }
    });

    // Create a map of employee ID -> count
    const portfolioCounts: Record<string, number> = {};

    activeLocations.forEach(loc => {
        if (loc.assignedEmployeeIds && Array.isArray(loc.assignedEmployeeIds)) {
            loc.assignedEmployeeIds.forEach(id => {
                portfolioCounts[id] = (portfolioCounts[id] || 0) + 1;
            });
        }
    });

    // Remove passwords and attach calculated portfolio size
    return employees.map(emp => {
        const { password, ...rest } = emp;
        return {
            ...rest,
            portfolioSize: portfolioCounts[emp.id] || 0
        };
    });
}

export async function getEmployeeById(id: string) {
    const employee = await prisma.employee.findUnique({
        where: { id },
    });

    if (!employee) return null;

    const { password, ...rest } = employee;
    return rest;
}

export async function createEmployee(data: {
    name: string;
    email: string;
    phone: string;
    role: Role;
    username: string;
    password: string;
    avatar?: string;
    portfolioSize?: number;
}) {
    // Hash password before storing
    const hashedPassword = await hashPassword(data.password);

    const employee = await prisma.employee.create({
        data: {
            ...data,
            password: hashedPassword,
            portfolioSize: data.portfolioSize || 0,
        },
    });

    const { password, ...rest } = employee;
    return rest;
}

export async function updateEmployee(id: string, data: {
    name?: string;
    email?: string;
    phone?: string;
    role?: Role;
    username?: string;
    password?: string;
    avatar?: string;
    portfolioSize?: number;
}) {
    // If password is provided, hash it
    const updateData: any = { ...data };
    if (data.password) {
        updateData.password = await hashPassword(data.password);
    } else {
        // Don't update password if not provided
        delete updateData.password;
    }

    const employee = await prisma.employee.update({
        where: { id },
        data: updateData,
    });

    const { password, ...rest } = employee;
    return rest;
}

export async function deleteEmployee(id: string) {
    await prisma.employee.delete({
        where: { id },
    });

    return { success: true };
}
