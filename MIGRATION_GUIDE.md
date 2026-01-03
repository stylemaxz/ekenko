# Migration Guide: Mock Data → Real API

## สถานะการแก้ไข

### ✅ เสร็จแล้ว
- `/admin/dashboard` - ใช้ API แล้ว
- `/admin/employees` - ใช้ API แล้ว
- `/admin/customers` - ใช้ API แล้ว
- `/sale/dashboard` - ใช้ API แล้ว

### ⚠️ แทนที่ชื่อตัวแปรแล้ว แต่ยังต้องเพิ่ม Fetch Logic
- `/admin/tasks`
- `/admin/leave`
- `/admin/activity-logs`
- `/admin/calendar`
- `/admin/reports`

## วิธีแก้แต่ละหน้า

### 1. /admin/tasks

**เพิ่ม State และ useEffect:**
```tsx
import { useState, useEffect } from "react";

// เพิ่ม State
const [tasks, setTasks] = useState<Task[]>([]);
const [employees, setEmployees] = useState<Employee[]>([]);
const [companies, setCompanies] = useState<Company[]>([]);
const [loading, setLoading] = useState(true);

// เพิ่ม useEffect
useEffect(() => {
  async function fetchData() {
    try {
      const [tasksRes, employeesRes, companiesRes] = await Promise.all([
        fetch('/api/tasks'),
        fetch('/api/employees'),
        fetch('/api/companies'),
      ]);

      if (tasksRes.ok) setTasks(await tasksRes.json());
      if (employeesRes.ok) {
        const empData = await employeesRes.json();
        // Filter sales only
        setEmployees(empData.filter((e: any) => e.role === 'sales'));
      }
      if (companiesRes.ok) setCompanies(await companiesRes.json());
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  }
  fetchData();
}, []);
```

**แก้ handleSave:**
```tsx
const handleSave = async () => {
  if (!newTask.title || !newTask.assigneeId || !newTask.dueDate) {
    showToast(t('fill_required'), 'error');
    return;
  }

  try {
    const res = await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newTask),
    });

    if (!res.ok) throw new Error('Failed to create task');

    showToast(t('task_assigned'), 'success');
    setIsModalOpen(false);
    
    // Refresh tasks
    const tasksRes = await fetch('/api/tasks');
    if (tasksRes.ok) setTasks(await tasksRes.json());
  } catch (error) {
    console.error(error);
    showToast('Failed to create task', 'error');
  }
};
```

---

### 2. /admin/leave

**เพิ่ม State และ useEffect:**
```tsx
const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
const [employees, setEmployees] = useState<Employee[]>([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
  async function fetchData() {
    try {
      const [leaveRes, empRes] = await Promise.all([
        fetch('/api/leave-requests'),
        fetch('/api/employees'),
      ]);

      if (leaveRes.ok) setLeaveRequests(await leaveRes.json());
      if (empRes.ok) {
        const empData = await empRes.json();
        setEmployees(empData.filter((e: any) => e.role === 'sales'));
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  }
  fetchData();
}, []);
```

**แก้ Approve/Reject:**
```tsx
const handleApprove = async (id: string) => {
  try {
    const res = await fetch(`/api/leave-requests/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'approved' }),
    });

    if (!res.ok) throw new Error('Failed');

    // Refresh
    const leaveRes = await fetch('/api/leave-requests');
    if (leaveRes.ok) setLeaveRequests(await leaveRes.json());
  } catch (error) {
    console.error(error);
  }
};
```

---

### 3. /admin/activity-logs

**เพิ่ม State และ useEffect:**
```tsx
const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
const [employees, setEmployees] = useState<Employee[]>([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
  async function fetchData() {
    try {
      const [logsRes, empRes] = await Promise.all([
        fetch('/api/activity-logs'),
        fetch('/api/employees'),
      ]);

      if (logsRes.ok) setActivityLogs(await logsRes.json());
      if (empRes.ok) {
        const empData = await empRes.json();
        setEmployees(empData.filter((e: any) => e.role === 'sales'));
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  }
  fetchData();
}, []);
```

---

### 4. /admin/calendar

**เพิ่ม State และ useEffect:**
```tsx
const [visits, setVisits] = useState<Visit[]>([]);
const [employees, setEmployees] = useState<Employee[]>([]);
const [companies, setCompanies] = useState<Company[]>([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
  async function fetchData() {
    try {
      const [visitsRes, empRes, compRes] = await Promise.all([
        fetch('/api/visits'),
        fetch('/api/employees'),
        fetch('/api/companies'),
      ]);

      if (visitsRes.ok) setVisits(await visitsRes.json());
      if (empRes.ok) {
        const empData = await empRes.json();
        setEmployees(empData.filter((e: any) => e.role === 'sales'));
      }
      if (compRes.ok) setCompanies(await compRes.json());
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  }
  fetchData();
}, []);
```

---

### 5. /admin/reports

**เพิ่ม State และ useEffect:**
```tsx
const [visits, setVisits] = useState<Visit[]>([]);
const [employees, setEmployees] = useState<Employee[]>([]);
const [companies, setCompanies] = useState<Company[]>([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
  async function fetchData() {
    try {
      const [visitsRes, empRes, compRes] = await Promise.all([
        fetch('/api/visits'),
        fetch('/api/employees'),
        fetch('/api/companies'),
      ]);

      if (visitsRes.ok) setVisits(await visitsRes.json());
      if (empRes.ok) {
        const empData = await empRes.json();
        setEmployees(empData.filter((e: any) => e.role === 'sales'));
      }
      if (compRes.ok) setCompanies(await compRes.json());
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  }
  fetchData();
}, []);
```

---

## สรุป APIs ที่มีอยู่แล้ว

- ✅ `GET /api/employees` - ดึงพนักงานทั้งหมด
- ✅ `GET /api/companies` - ดึงบริษัททั้งหมด
- ✅ `GET /api/visits` - ดึง Visit ทั้งหมด
- ✅ `GET /api/tasks` - ดึง Task ทั้งหมด
- ✅ `POST /api/tasks` - สร้าง Task ใหม่
- ✅ `GET /api/leave-requests` - ดึง Leave Request ทั้งหมด
- ✅ `PUT /api/leave-requests/[id]` - อัปเดต Leave Request
- ✅ `GET /api/activity-logs` - ดึง Activity Logs

## หมายเหตุ

- ทุกหน้าได้แทนที่ `mockEmployees` → `employees` แล้ว
- ทุกหน้าได้แทนที่ `mockVisits` → `visits` แล้ว
- ทุกหน้าได้แทนที่ `mockCompanies` → `companies` แล้ว
- ทุกหน้าได้แทนที่ `mockTasks` → `tasks` แล้ว
- ทุกหน้าได้แทนที่ `mockLeaveRequests` → `leaveRequests` แล้ว
- ทุกหน้าได้แทนที่ `mockActivityLogs` → `activityLogs` แล้ว

**ขั้นตอนต่อไป:**
1. เพิ่ม `useState` และ `useEffect` ตาม Template ข้างบน
2. ลบ Import `mockData` ออก
3. เพิ่ม Loading State
4. Test แต่ละหน้า
