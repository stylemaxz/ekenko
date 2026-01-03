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
  const [visits, companies, activityLogs] = await Promise.all([
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
    })
  ]);

  const initialData = {
    visits,
    companies,
    activityLogs
  };

  return <SaleDashboardClient initialData={initialData} currentUser={currentUser} />;
}
