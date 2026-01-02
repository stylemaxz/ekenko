
import { NextResponse } from 'next/server';
import { getAllEmployees, createEmployee } from '@/services/employeeService';
import { getSession } from '@/lib/auth';

export async function GET() {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const employees = await getAllEmployees();
        return NextResponse.json(employees);
    } catch (error) {
        console.error('Error fetching employees:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const session = await getSession();
        if (!session || session.role !== 'manager') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const data = await request.json();

        // Validate required fields
        if (!data.name || !data.email || !data.username || !data.password) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const employee = await createEmployee(data);
        return NextResponse.json(employee, { status: 201 });
    } catch (error: any) {
        console.error('Error creating employee:', error);

        // Handle unique constraint violations
        if (error.code === 'P2002') {
            return NextResponse.json({ error: 'Email or username already exists' }, { status: 409 });
        }

        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
