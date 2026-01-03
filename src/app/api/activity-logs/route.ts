
import { NextResponse } from 'next/server';
import { activityLogService } from '@/services/activityLogService';
import { getSession } from '@/lib/auth';

export async function GET(request: Request) {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const employeeId = searchParams.get('employeeId');

        let activityLogs;
        if (employeeId) {
            activityLogs = await activityLogService.getActivityLogsByEmployee(employeeId);
        } else {
            activityLogs = await activityLogService.getAllActivityLogs();
        }

        return NextResponse.json(activityLogs);
    } catch (error) {
        console.error('Error fetching activity logs:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const data = await request.json();

        // Force use of session user ID for security and integrity
        // Cast session to any or define a type, knowing it has userId and name from login
        const payload = session as any;

        const activityLog = await activityLogService.createActivityLog({
            ...data,
            employeeId: payload.userId,
            employeeName: payload.name || data.employeeName // Fallback to provided name or lookup in service
        });

        return NextResponse.json(activityLog, { status: 201 });
    } catch (error: any) {
        console.error('Error creating activity log:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
