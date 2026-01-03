
import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getEmployeeById } from '@/services/employeeService';

export async function GET() {
    try {
        const session = await getSession();

        if (!session || !session.userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const employee = await getEmployeeById(session.userId as string);

        if (!employee) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        return NextResponse.json(employee);
    } catch (error) {
        console.error('Error fetching current user:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

import { updateEmployee } from '@/services/employeeService';

export async function PUT(request: Request) {
    try {
        const session = await getSession();

        if (!session || !session.userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const data = await request.json();
        const updatedEmployee = await updateEmployee(session.userId as string, data);

        return NextResponse.json(updatedEmployee);
    } catch (error) {
        console.error('Error updating current user:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
