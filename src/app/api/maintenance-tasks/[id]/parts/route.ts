import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// POST /api/maintenance-tasks/[id]/parts - Add part to task
export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    try {
        const body = await req.json();
        const { partId, quantity } = body;

        if (!partId || !quantity || quantity <= 0) {
            return NextResponse.json({ error: 'Invalid part or quantity' }, { status: 400 });
        }

        // Transaction to ensure stock and usage consistency
        const result = await prisma.$transaction(async (tx) => {
            // 1. Get Part to check stock and price
            const part = await tx.sparePart.findUnique({
                where: { id: partId }
            });

            if (!part) throw new Error('Part not found');
            if (part.stock < quantity) throw new Error('Insufficient stock');

            // 2. Create Usage Record
            const usage = await tx.taskPartUsage.create({
                data: {
                    taskId: id,
                    partId,
                    quantity,
                    priceAtTime: part.price
                },
                include: {
                    part: true
                }
            });

            // 3. Deduct Stock
            await tx.sparePart.update({
                where: { id: partId },
                data: { stock: { decrement: quantity } }
            });

            // 4. Update Task Total Cost
            // Fetch all usage for this task to recalculate valid total
            // Actually, just incrementing might be faster, but recalculating is safer
            // Let's recalculate
            const allUsage = await tx.taskPartUsage.findMany({
                where: { taskId: id }
            });

            const totalCost = allUsage.reduce((sum, u) => sum + (u.priceAtTime * u.quantity), 0);

            await tx.maintenanceTask.update({
                where: { id },
                data: { totalCost }
            });

            return usage;
        });

        return NextResponse.json(result);
    } catch (error: any) {
        console.error('Error adding part:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to add part' },
            { status: 500 }
        );
    }
}

// DELETE /api/maintenance-tasks/[id]/parts - Remove part usage (need separate route or use Query param for usageId)
// Usually DELETE should be on /api/maintenance-tasks/[id]/parts/[usageId]
// But for simplicity let's handle usageId in body or query? Standard is Resource URL.
// I'll make a new route for DELETE: /api/maintenance-tasks/[id]/parts/[usageId]
// But Step 2496 said /api/maintenance-tasks/[id]/parts/route.ts handles DELETE?
// "DELETE: Remove part from task"
// It's better to structure as /api/maintenance-tasks/[task_id]/parts/[usage_id]
// But I can put logic here if I pass usageId in body (not standard but works) or query param.
// Use Query Param `usageId` for DELETE on collection resource is acceptable for simple RPC style or just use body.
// Better: DELETE accepts body? Some clients strip it.
// Safest: Use Query Param ?usageId=...

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params; // taskId
    try {
        const searchParams = req.nextUrl.searchParams;
        const usageId = searchParams.get('usageId');

        if (!usageId) {
            return NextResponse.json({ error: 'usageId is required' }, { status: 400 });
        }

        await prisma.$transaction(async (tx) => {
            // 1. Get Usage to revert stock
            const usage = await tx.taskPartUsage.findUnique({
                where: { id: usageId }
            });

            if (!usage) throw new Error('Usage record not found');
            if (usage.taskId !== id) throw new Error('Usage mismatch');

            // 2. Refund Stock
            await tx.sparePart.update({
                where: { id: usage.partId },
                data: { stock: { increment: usage.quantity } }
            });

            // 3. Delete Usage
            await tx.taskPartUsage.delete({
                where: { id: usageId }
            });

            // 4. Update Task Total Cost
            const allUsage = await tx.taskPartUsage.findMany({
                where: { taskId: id }
            });
            const totalCost = allUsage.reduce((sum, u) => sum + (u.priceAtTime * u.quantity), 0);

            await tx.maintenanceTask.update({
                where: { id },
                data: { totalCost }
            });
        });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Error removing part:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to remove part' },
            { status: 500 }
        );
    }
}
