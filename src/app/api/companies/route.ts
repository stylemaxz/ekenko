
import { NextResponse } from 'next/server';
import { companyService } from '@/services/companyService';
import { getSession } from '@/lib/auth';

export async function GET() {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const companies = await companyService.getAllCompanies();
        return NextResponse.json(companies);
    } catch (error) {
        console.error('Error fetching companies:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const session = await getSession();
        if (!session || !['manager', 'admin', 'sale', 'sales'].includes(session.role as string)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const data = await request.json();
        const company = await companyService.createCompany(data);

        return NextResponse.json(company, { status: 201 });
    } catch (error: any) {
        console.error('Error creating company:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
