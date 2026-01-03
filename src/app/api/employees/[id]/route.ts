
import { NextResponse } from 'next/server';
import { getEmployeeById, updateEmployee, deleteEmployee } from '@/services/employeeService';
import { getSession } from '@/lib/auth';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        // TODO: Re-enable auth when session is properly implemented
        // const session = await getSession();
        // if (!session) {
        //     return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        // }

        const { id } = await params;
        const employee = await getEmployeeById(id);

        if (!employee) {
            return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
        }

        return NextResponse.json(employee);
    } catch (error) {
        console.error('Error fetching employee:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getSession();
        if (!session || session.role !== 'manager') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        const data = await request.json();

        const employee = await updateEmployee(id, data);
        return NextResponse.json(employee);
    } catch (error: any) {
        console.error('Error updating employee:', error);

        if (error.code === 'P2025') {
            return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
        }

        if (error.code === 'P2002') {
            return NextResponse.json({ error: 'Email or username already exists' }, { status: 409 });
        }

        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getSession();
        if (!session || session.role !== 'manager') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        await deleteEmployee(id);

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Error deleting employee:', error);

        if (error.code === 'P2025') {
            return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
        }

        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
