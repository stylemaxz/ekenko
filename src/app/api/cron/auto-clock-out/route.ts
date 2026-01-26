
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic'; // Prevent caching

export async function GET() {
    try {
        // 1. Get all employees
        const employees = await prisma.employee.findMany({
            select: { id: true, name: true }
        });

        const results = [];

        // 2. Check status for each employee
        // Note: In high-scale systems, we would do this with raw SQL or optimized queries. 
        // For this size, looping is acceptable.
        for (const emp of employees) {
            const lastClockAction = await prisma.activityLog.findFirst({
                where: {
                    employeeId: emp.id,
                    type: { in: ['clock_in', 'clock_out'] }
                },
                orderBy: { timestamp: 'desc' }
            });

            // 3. If currently clocked in, clock them out
            if (lastClockAction && lastClockAction.type === 'clock_in') {

                // Determine timestamp: Midnight of the check-in day or just "now"?
                // Request: "Auto clockout at midnight". 
                // Assuming this runs shortly after midnight, we use the current time.

                await prisma.activityLog.create({
                    data: {
                        type: 'clock_out',
                        employeeId: emp.id,
                        employeeName: emp.name,
                        description: 'Auto Clock Out (System)',
                        metadata: {
                            isAuto: true,
                            relatedClockIn: lastClockAction.id
                        },
                        timestamp: new Date() // Runs at midnight implies this is the time
                    }
                });

                results.push({
                    employee: emp.name,
                    status: 'Auto Clocked Out',
                    lastAction: lastClockAction.timestamp
                });
            }
        }

        return NextResponse.json({
            success: true,
            processed: results.length,
            details: results
        });

    } catch (error) {
        console.error('Auto Clock Out Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
