import {
    Company,
    Location,
    ContactPerson,
    Employee,
    LeaveRequest,
    ActivityLog,
    Visit,
    Task,
    VisitObjective,
    VisitObjectives as SharedVisitObjectives
} from "@/types";

// Re-export types for backward compatibility if needed, distinct from local types
// but since we want to unify, we should remove local definitions.

// Visit Objectives - Re-export or use shared
export const VisitObjectives = SharedVisitObjectives;
export type { VisitObjective };

// Maintain exported arrays typed with shared types
export const mockTasks: Task[] = [
    {
        id: 't1',
        title: 'Monthly Stock Check',
        description: 'Check inventory levels for all beverage products.',
        assigneeId: '1', // Somchai
        customerId: 'c1', // Big Shop 7-11
        locationId: 'l1', // Main Branch
        dueDate: new Date(new Date().setDate(new Date().getDate() + 1)).toISOString(), // Tomorrow
        priority: 'medium',
        status: 'pending',
        createdAt: new Date().toISOString()
    },
    {
        id: 't2',
        title: 'New Product Intro',
        description: 'Present the new summer collection catalog.',
        assigneeId: '2', // Somsri
        customerId: 'c3',
        dueDate: new Date().toISOString(), // Today
        priority: 'low',
        status: 'in_progress',
        createdAt: new Date().toISOString()
    },
    {
        id: 't3',
        title: 'Urgent Delivery',
        description: 'Customer requested urgent restock of item #8822.',
        assigneeId: '3', // Danai
        customerId: 'c2',
        locationId: 'l3',
        dueDate: new Date(new Date().setDate(new Date().getDate() - 1)).toISOString(), // Yesterday
        priority: 'high',
        status: 'overdue',
        createdAt: new Date().toISOString()
    }
];

export const mockEmployees: Employee[] = [
    { id: '1', name: 'Somchai Salesman', email: 'somchai@example.com', phone: '081-111-1111', role: 'sales', portfolioSize: 50, username: 'somchai', password: 'password123', avatar: 'https://i.pravatar.cc/150?u=somchai' },
    { id: '2', name: 'Somsri Seller', email: 'somsri@example.com', phone: '082-222-2222', role: 'sales', portfolioSize: 45, username: 'somsri', password: 'password123', avatar: 'https://i.pravatar.cc/150?u=somsri' },
    { id: '3', name: 'Danai Driver', email: 'danai@example.com', phone: '083-333-3333', role: 'sales', portfolioSize: 60, username: 'danai', password: 'password123', avatar: 'https://i.pravatar.cc/150?u=danai' },
    { id: '4', name: 'Admin Manager', email: 'admin@example.com', phone: '080-000-0000', role: 'manager', portfolioSize: 0, username: 'admin', password: 'eEkeenKoo11!', avatar: 'https://i.pravatar.cc/150?u=admin' },
];

export const mockCompanies: Company[] = [
    {
        id: 'c1',
        name: 'Big Shop 7-11',
        taxId: '1234567890123',
        grade: 'A',
        status: 'existing',
        locations: [
            {
                id: 'l1',
                name: 'Main Branch Sukhumvit',
                address: '123 Sukhumvit Rd',
                postalCode: '10110',
                district: 'Watthana',
                province: 'Bangkok',
                googleMapLink: 'https://maps.app.goo.gl/example1',
                lat: 13.7563,
                lng: 100.5018,
                assignedEmployeeIds: ['1', '2'], // Assigned to Somchai and Somsri
                contacts: [
                    { id: 'ct1', name: 'Manager John', role: 'Branch Manager', phone: '081-234-5678', lineId: 'john711' }
                ],
                createdBy: "1",
            },
            {
                id: 'l2',
                name: 'Silom Branch',
                address: '456 Silom Rd',
                postalCode: '10500',
                district: 'Bang Rak',
                province: 'Bangkok',
                googleMapLink: 'https://maps.app.goo.gl/example2',
                lat: 13.7291,
                lng: 100.5358,
                assignedEmployeeIds: ['3'], // Assigned to Danai
                contacts: [
                    { id: 'ct2', name: 'Asst. Jane', role: 'Asst. Manager', phone: '089-876-5432' }
                ],
                createdBy: "1",
            },
        ]
    },
    {
        id: 'c2',
        name: 'Mom & Pop Store',
        grade: 'C',
        status: 'lead',
        locations: [
            {
                id: 'l3',
                name: 'Chatuchak Market Stall 4',
                address: 'Chatuchak Market',
                postalCode: '10900',
                district: 'Chatuchak',
                province: 'Bangkok',
                googleMapLink: 'https://maps.app.goo.gl/example3',
                lat: 13.8051,
                lng: 100.5552,
                contacts: [
                    { id: 'ct3', name: 'Auntie Dang', role: 'Owner', phone: '089-999-9999' }
                ],
                createdBy: "1",
            }
        ]
    },
    {
        id: 'c3',
        name: 'Tech Office HQ',
        taxId: '9876543210987',
        grade: 'B',
        status: 'existing',
        locations: [
            {
                id: 'l4',
                name: 'Sathorn Head Office',
                address: 'Sathorn Unique',
                postalCode: '10120',
                district: 'Sathorn',
                province: 'Bangkok',
                lat: 13.7155,
                lng: 100.5139,
                contacts: [
                    { id: 'ct4', name: 'K. Somkiat', role: 'Purchasing Director', phone: '02-999-8888', lineId: 'somkiat.tech' }
                ],
                createdBy: "1",
            }
        ]
    },
    {
        id: 'c4',
        name: 'New Coffee Stand',
        grade: 'B',
        status: 'lead',
        locations: [
            {
                id: 'l5',
                name: 'G Tower Lobby Kiosk',
                address: 'G Tower Rama 9',
                postalCode: '10310',
                district: 'Huai Khwang',
                province: 'Bangkok',
                lat: 13.7576,
                lng: 100.5651,
                contacts: [
                    { id: 'ct5', name: 'Barista Joe', role: 'General Manager', phone: '088-777-6666' }
                ],
                createdBy: "1",
            }
        ]
    }
];

// Helper to get dates relative to now
const now = new Date();
const yesterday = new Date(now); yesterday.setDate(now.getDate() - 1);
const twoDaysAgo = new Date(now); twoDaysAgo.setDate(now.getDate() - 2);

export const mockVisits: Visit[] = [
    {
        id: 'v1',
        employeeId: '1',
        locationId: 'l1',
        checkInTime: now.toISOString(),
        checkOutTime: new Date(now.getTime() + 1000 * 60 * 30).toISOString(),
        objectives: ['propose_new_products', 'check_assets'],
        notes: 'Customer interested in new energy drink. Checked fridge, working fine.',
        images: ['https://images.unsplash.com/photo-1604328698692-f76ea9498e76?q=80&w=2670&auto=format&fit=crop'],
        metOwner: true
    },
    {
        id: 'v2',
        employeeId: '1',
        locationId: 'l2',
        checkInTime: yesterday.toISOString(),
        checkOutTime: new Date(yesterday.getTime() + 1000 * 60 * 45).toISOString(),
        objectives: ['collect_debt'],
        notes: 'Collected payment for invoice #8822.',
        images: ['https://images.unsplash.com/photo-1556740758-90de2742e234?q=80&w=2669&auto=format&fit=crop'],
        metOwner: true
    },
    {
        id: 'v3',
        employeeId: '2',
        locationId: 'l3',
        checkInTime: yesterday.toISOString(),
        checkOutTime: new Date(yesterday.getTime() + 1000 * 60 * 20).toISOString(),
        objectives: ['promotion'],
        notes: 'Owner not in, left brochures with staff.',
        images: [],
        metOwner: false
    },
    {
        id: 'v4',
        employeeId: '1',
        locationId: 'l4',
        checkInTime: twoDaysAgo.toISOString(),
        objectives: ['relationship'],
        notes: 'Regular delivery completed.',
        images: [],
        metOwner: true
    },
    // New visits for Lead Hunting stats
    {
        id: 'v5',
        employeeId: '1',
        locationId: 'l5', // Lead
        checkInTime: now.toISOString(),
        objectives: ['propose_new_products'],
        notes: 'First contact, very positive.',
        images: ['https://images.unsplash.com/photo-1541535650259-aa11d8531c3f?q=80&w=2590&auto=format&fit=crop'],
        metOwner: true
    },
    {
        id: 'v6',
        employeeId: '3',
        locationId: 'l5', // Lead (same lead, different sales rep maybe?)
        checkInTime: yesterday.toISOString(),
        objectives: ['relationship'],
        notes: 'Follow up call, no answer.',
        images: [],
        metOwner: false
    }
];

// --- Mock Leave Requests ---
export const mockLeaveRequests: LeaveRequest[] = [
    {
        id: 'lr1',
        employeeId: '1',
        type: 'sick',
        startDate: '2024-01-15',
        endDate: '2024-01-16',
        days: 2,
        reason: 'Flu symptoms, need rest',
        status: 'approved',
        createdAt: '2024-01-10T09:00:00Z',
        reviewedBy: '4',
        reviewedAt: '2024-01-10T14:30:00Z',
        reviewNote: 'Approved. Get well soon!'
    },
    {
        id: 'lr2',
        employeeId: '2',
        type: 'vacation',
        startDate: '2024-02-01',
        endDate: '2024-02-05',
        days: 5,
        reason: 'Family trip to Phuket',
        status: 'pending',
        createdAt: '2024-01-20T10:15:00Z'
    },
    {
        id: 'lr3',
        employeeId: '3',
        type: 'personal',
        startDate: '2024-01-25',
        endDate: '2024-01-25',
        days: 1,
        reason: 'Personal matter',
        status: 'rejected',
        createdAt: '2024-01-22T08:00:00Z',
        reviewedBy: '4',
        reviewedAt: '2024-01-22T16:00:00Z',
        reviewNote: 'We have important client meeting that day. Please reschedule.'
    },
    {
        id: 'lr4',
        employeeId: '1',
        type: 'vacation',
        startDate: '2024-03-10',
        endDate: '2024-03-12',
        days: 3,
        reason: 'Songkran holiday extension',
        status: 'pending',
        createdAt: new Date().toISOString()
    }
];

// --- Mock Activity Logs ---
export const mockActivityLogs: ActivityLog[] = [
    {
        id: 'act1',
        type: 'clock_in',
        employeeId: '1',
        employeeName: 'Somchai Prasert',
        description: 'เข้างาน',
        timestamp: new Date(now.getTime() - 3600000).toISOString()
    },
    {
        id: 'act2',
        type: 'customer_created',
        employeeId: '1',
        employeeName: 'Somchai Prasert',
        description: 'สร้างลูกค้าใหม่: Amazon Cafe - Siam Branch',
        metadata: { companyName: 'Amazon Cafe', branchName: 'Siam Branch' },
        timestamp: new Date(now.getTime() - 7200000).toISOString()
    },
    {
        id: 'act3',
        type: 'check_in',
        employeeId: '2',
        employeeName: 'Nida Somjai',
        description: 'เช็คอิน: Starbucks - Central World',
        metadata: { locationName: 'Starbucks - Central World' },
        timestamp: new Date(now.getTime() - 10800000).toISOString()
    },
    {
        id: 'act4',
        type: 'customer_status_changed',
        employeeId: '1',
        employeeName: 'Somchai Prasert',
        description: 'เปลี่ยนสถานะลูกค้า: Amazon Cafe → ปิดการขาย',
        metadata: {
            companyName: 'Amazon Cafe',
            oldStatus: 'active',
            newStatus: 'closed',
            note: 'ปิดดีลแล้ว ซื้อสินค้า 100,000 บาท'
        },
        timestamp: new Date(Date.now() - 14400000).toISOString()
    },
    {
        id: 'act5',
        type: 'leave_requested',
        employeeId: '2',
        employeeName: 'Nida Somjai',
        description: 'ขอลาพักร้อน 5 วัน',
        metadata: { leaveType: 'sick', days: 1, reason: 'ปวดหัว' },
        timestamp: new Date(Date.now() - 18000000).toISOString()
    },
    {
        id: 'act6',
        type: 'leave_approved',
        employeeId: '4',
        employeeName: 'Manager Name',
        description: 'อนุมัติการลาของ Nida Somjai',
        metadata: { targetEmployee: 'Nida Somjai', leaveType: 'vacation' },
        timestamp: new Date(Date.now() - 21600000).toISOString()
    },
    {
        id: 'act7',
        type: 'task_created',
        employeeId: '4',
        employeeName: 'Manager Name',
        description: 'สร้างงาน: เยี่ยมลูกค้า Amazon Cafe',
        metadata: { taskTitle: 'เยี่ยมลูกค้า Amazon Cafe', assignedTo: 'Somchai Prasert' },
        timestamp: new Date(Date.now() - 25200000).toISOString()
    },
    {
        id: 'act8',
        type: 'clock_out',
        employeeId: '3',
        employeeName: 'Pong Wichai',
        description: 'ออกงาน (ทำงาน 8 ชม. 30 นาที)',
        metadata: { hoursWorked: 8.5 },
        timestamp: new Date(Date.now() - 28800000).toISOString()
    }
];
