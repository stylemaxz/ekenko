
import { NextResponse } from 'next/server';
import { companyService } from '@/services/companyService';

export async function GET() {
    try {
        const companies = await companyService.getAllCompanies();
        return NextResponse.json(companies);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        // In a real app, validate body using Zod here
        const newCompany = await companyService.createCompany(body);
        return NextResponse.json(newCompany, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}
