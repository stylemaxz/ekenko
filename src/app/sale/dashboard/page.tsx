import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { prisma } from '@/lib/prisma';
import SaleDashboardClient from "./client";

const SECRET_KEY = process.env.JWT_SECRET_KEY || 'your-secret-key-change-it-in-prod';
const key = new TextEncoder().encode(SECRET_KEY);

export default async function SaleDashboardPage() {
  // Get current user from session
  const cookieStore = await cookies();
  const token = cookieStore.get('accessToken')?.value;
  
  let currentUserId = '';
  let currentUser = { id: '', name: 'Guest', avatar: '' };

  if (token) {
    try {
      const { payload } = await jwtVerify(token, key);
      currentUserId = payload.userId as string;
      
      // Fetch current user details
      const user = await prisma.employee.findUnique({
        where: { id: currentUserId },
        select: { id: true, name: true, avatar: true }
      });
      
      if (user) {
        currentUser = {
          ...user,
          avatar: user.avatar || ''
        };
      }
    } catch (error) {
      console.error('Error verifying token:', error);
    }
  }

  // Fetch data for this specific employee
  const [visits, companies, activityLogs, lastClockAction] = await Promise.all([
    prisma.visit.findMany({
      where: { employeeId: currentUserId },
      include: {
        location: {
          include: {
            company: true
          }
        }
      },
      orderBy: { checkInTime: 'desc' }
    }),
    prisma.company.findMany({
      include: {
        locations: true
      }
    }),
    prisma.activityLog.findMany({
      where: { employeeId: currentUserId },
      orderBy: { timestamp: 'desc' },
      take: 50
    }),
    prisma.activityLog.findFirst({
      where: {
        employeeId: currentUserId,
        type: { in: ['clock_in', 'clock_out'] }
      },
      orderBy: { timestamp: 'desc' }
    })
  ]);

  // Determine Clock In State
  let isClockedIn = false;
  let clockInTime = null;

  if (lastClockAction && lastClockAction.type === 'clock_in') {
    // Check if it's from today (optional, but good practice to allow auto-logout functionality conceptually)
    // For now, simple check: if last action was clock_in, they are clocked in.
    // Ideally we check if it was effectively "today" or within reasonable shift hours.
    // Let's assume strict last action for now to fix the sync issue first.
    isClockedIn = true;
    clockInTime = lastClockAction.timestamp;
  }

  const initialData = {
    visits,
    companies,
    activityLogs,
    clockState: {
        isClockedIn,
        clockInTime
    }
  };

  return <SaleDashboardClient initialData={initialData} currentUser={currentUser} />;
}
