import { mockVisits, mockCompanies, mockActivityLogs, mockEmployees } from "@/utils/mockData";
import SaleDashboardClient from "./client";

export default function SaleDashboardPage() {
  // #1 Server vs Client Separation
  // Fetch data on the server (mocked) and pass to Client Component.
  // In a real app, this would be a database call: await db.query(...)
  
  // #5 Principle of Least Privilege
  // Filter data to only what is necessary for this user (hardcoded '1' for now)
  const currentUserId = "1";
  const currentUser = mockEmployees.find(e => e.id === currentUserId) || { id: "1", name: "Somchai Salesman", avatar: "" };
  
  const initialData = {
    visits: mockVisits.filter(v => v.employeeId === currentUserId),
    companies: mockCompanies, // Note: Ideally filter companies too if possible
    activityLogs: mockActivityLogs.filter(l => l.employeeId === currentUserId)
  };

  return <SaleDashboardClient initialData={initialData} currentUser={{ id: currentUser.id, name: currentUser.name, avatar: currentUser.avatar }} />;
}
