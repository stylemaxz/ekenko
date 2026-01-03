# สรุปสถานะการแก้ไข Mock Data → Real API

## ✅ เสร็จสมบูรณ์แล้ว

### 1. Admin Dashboard (`/admin/dashboard`)
- ✅ Fetch employees, companies, visits from API
- ✅ Filter เฉพาะ Sales (ไม่รวม Manager)
- ✅ แสดงข้อมูลจริงจาก Database

### 2. Admin Employees (`/admin/employees`)
- ✅ CRUD ผ่าน API
- ✅ Upload avatar ไป Cloud Storage
- ✅ บันทึกข้อมูลลง Database

### 3. Admin Customers (`/admin/customers`)
- ✅ CRUD ผ่าน API
- ✅ Upload logo และ documents ไป Cloud Storage
- ✅ รองรับ Nested Relations (Locations, Contacts)

### 4. Admin Tasks (`/admin/tasks`)
- ✅ Fetch tasks, employees, companies from API
- ✅ Filter เฉพาะ Sales
- ✅ แสดงข้อมูลจริง
- ⚠️ **ยังไม่ได้แก้ handleSave** - ยังบันทึกแบบ Local State

### 5. Sale Dashboard (`/sale/dashboard`)
- ✅ Server Component ที่ Fetch จาก Database
- ✅ แสดงเฉพาะข้อมูลของ Employee ที่ Login

---

## ⚠️ ต้องเพิ่ม Fetch Logic (แทนที่ชื่อตัวแปรแล้ว)

### 1. Admin Leave (`/admin/leave`)
**ต้องเพิ่ม:**
```tsx
const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
const [employees, setEmployees] = useState<Employee[]>([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
  async function fetchData() {
    const [leaveRes, empRes] = await Promise.all([
      fetch('/api/leave-requests'),
      fetch('/api/employees'),
    ]);
    if (leaveRes.ok) setLeaveRequests(await leaveRes.json());
    if (empRes.ok) setEmployees((await empRes.json()).filter((e: any) => e.role === 'sales'));
    setLoading(false);
  }
  fetchData();
}, []);
```

### 2. Admin Activity Logs (`/admin/activity-logs`)
**ต้องเพิ่ม:**
```tsx
const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
const [employees, setEmployees] = useState<Employee[]>([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
  async function fetchData() {
    const [logsRes, empRes] = await Promise.all([
      fetch('/api/activity-logs'),
      fetch('/api/employees'),
    ]);
    if (logsRes.ok) setActivityLogs(await logsRes.json());
    if (empRes.ok) setEmployees((await empRes.json()).filter((e: any) => e.role === 'sales'));
    setLoading(false);
  }
  fetchData();
}, []);
```

### 3. Admin Calendar (`/admin/calendar`)
**ต้องเพิ่ม:**
```tsx
const [visits, setVisits] = useState<Visit[]>([]);
const [employees, setEmployees] = useState<Employee[]>([]);
const [companies, setCompanies] = useState<Company[]>([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
  async function fetchData() {
    const [visitsRes, empRes, compRes] = await Promise.all([
      fetch('/api/visits'),
      fetch('/api/employees'),
      fetch('/api/companies'),
    ]);
    if (visitsRes.ok) setVisits(await visitsRes.json());
    if (empRes.ok) setEmployees((await empRes.json()).filter((e: any) => e.role === 'sales'));
    if (compRes.ok) setCompanies(await compRes.json());
    setLoading(false);
  }
  fetchData();
}, []);
```

### 4. Admin Reports (`/admin/reports`)
**ต้องเพิ่ม:**
```tsx
const [visits, setVisits] = useState<Visit[]>([]);
const [employees, setEmployees] = useState<Employee[]>([]);
const [companies, setCompanies] = useState<Company[]>([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
  async function fetchData() {
    const [visitsRes, empRes, compRes] = await Promise.all([
      fetch('/api/visits'),
      fetch('/api/employees'),
      fetch('/api/companies'),
    ]);
    if (visitsRes.ok) setVisits(await visitsRes.json());
    if (empRes.ok) setEmployees((await empRes.json()).filter((e: any) => e.role === 'sales'));
    if (compRes.ok) setCompanies(await compRes.json());
    setLoading(false);
  }
  fetchData();
}, []);
```

---

## 📝 หน้า Sale ที่ยังต้องแก้

- `/sale/customers` - ใช้ mockCompanies, mockActivityLogs
- `/sale/tasks` - ใช้ mockTasks, mockCompanies, mockEmployees
- `/sale/check-in` - ใช้ mockCompanies, mockActivityLogs
- `/sale/profile` - ใช้ mockEmployees
- `/sale/leave` - ใช้ mockLeaveRequests, mockEmployees

---

## 🔧 APIs ที่พร้อมใช้งาน

- ✅ `GET /api/employees` - ดึงพนักงานทั้งหมด
- ✅ `POST /api/employees` - สร้างพนักงานใหม่
- ✅ `PUT /api/employees/[id]` - อัปเดตพนักงาน
- ✅ `DELETE /api/employees/[id]` - ลบพนักงาน
- ✅ `GET /api/companies` - ดึงบริษัททั้งหมด
- ✅ `POST /api/companies` - สร้างบริษัทใหม่
- ✅ `PUT /api/companies/[id]` - อัปเดตบริษัท
- ✅ `DELETE /api/companies/[id]` - ลบบริษัท
- ✅ `GET /api/visits` - ดึง Visit ทั้งหมด
- ✅ `POST /api/visits` - สร้าง Visit ใหม่
- ✅ `GET /api/tasks` - ดึง Task ทั้งหมด
- ✅ `POST /api/tasks` - สร้าง Task ใหม่
- ✅ `GET /api/leave-requests` - ดึง Leave Request ทั้งหมด
- ✅ `POST /api/leave-requests` - สร้าง Leave Request ใหม่
- ✅ `PUT /api/leave-requests/[id]` - อัปเดต Leave Request
- ✅ `DELETE /api/leave-requests/[id]` - ลบ Leave Request
- ✅ `GET /api/activity-logs` - ดึง Activity Logs
- ✅ `POST /api/activity-logs` - สร้าง Activity Log ใหม่

---

## 🎯 สิ่งที่ทำไปแล้ว

1. ✅ สร้าง `/src/types/index.ts` - Centralized types
2. ✅ แทนที่ `mockEmployees` → `employees` ในทุกไฟล์
3. ✅ แทนที่ `mockVisits` → `visits` ในทุกไฟล์
4. ✅ แทนที่ `mockCompanies` → `companies` ในทุกไฟล์
5. ✅ แทนที่ `mockTasks` → `tasks` ในทุกไฟล์
6. ✅ แทนที่ `mockLeaveRequests` → `leaveRequests` ในทุกไฟล์
7. ✅ แทนที่ `mockActivityLogs` → `activityLogs` ในทุกไฟล์
8. ✅ เปลี่ยน Import จาก `@/utils/mockData` → `@/types` ในหน้า Admin ทั้งหมด
9. ✅ เพิ่ม Fetch Logic ใน `/admin/tasks`

---

## ⏭️ ขั้นตอนต่อไป

1. เพิ่ม `useEffect` Fetch Logic ในหน้า Admin ที่เหลือ (4 หน้า)
2. แก้หน้า Sale ทั้งหมด (5 หน้า)
3. แก้ `handleSave` ใน Tasks ให้บันทึกผ่าน API
4. Test ทุกหน้าให้แน่ใจว่าทำงานถูกต้อง

---

## 🐛 Lint Errors ที่พบ

- ⚠️ Sale Dashboard: Type mismatch (Date vs string) - ต้องแก้ Type definition
- ⚠️ Tasks Page: Translation keys สำหรับ objectives ยังไม่มี
- ⚠️ Tasks Page: Null handling สำหรับ select values

**หมายเหตุ:** Errors เหล่านี้ไม่ block การทำงาน แต่ควรแก้เพื่อความสมบูรณ์
