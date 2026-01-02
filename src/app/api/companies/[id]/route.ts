
import { NextResponse } from 'next/server';
import { companyService } from '@/services/companyService';
import { getSession } from '@/lib/auth';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        const company = await companyService.getCompanyById(id);

        if (!company) {
            return NextResponse.json({ error: 'Company not found' }, { status: 404 });
        }

        return NextResponse.json(company);
    } catch (error) {
        console.error('Error fetching company:', error);
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

        const company = await companyService.updateCompany(id, data);
        return NextResponse.json(company);
    } catch (error: any) {
        console.error('Error updating company:', error);

        if (error.code === 'P2025') {
            return NextResponse.json({ error: 'Company not found' }, { status: 404 });
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
        await companyService.deleteCompany(id);

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Error deleting company:', error);

        if (error.code === 'P2025') {
            return NextResponse.json({ error: 'Company not found' }, { status: 404 });
        }

        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
