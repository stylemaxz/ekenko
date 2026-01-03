// Common Types for the application

export type Role = 'sales' | 'manager';

export type CustomerStatus = 'lead' | 'existing' | 'inactive' | 'closed' | 'terminate';

export type LocationStatus = 'lead' | 'existing' | 'inactive' | 'closed' | 'terminate';

export type LeaveType = 'sick' | 'personal' | 'annual' | 'vacation' | 'other';

export type LeaveStatus = 'pending' | 'approved' | 'rejected';

export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'overdue';

export type TaskPriority = 'low' | 'medium' | 'high';

export type ActivityType =
    | 'visit'
    | 'task_completed'
    | 'task_created'
    | 'leave_request'
    | 'leave_requested'
    | 'leave_approved'
    | 'leave_rejected'
    | 'leave_updated'
    | 'customer_added'
    | 'customer_created'
    | 'customer_status_changed'
    | 'note_added'
    | 'check_in'
    | 'clock_in'
    | 'clock_out';

export type VisitObjective =
    | 'sales'
    | 'delivery'
    | 'collect_payment'
    | 'survey'
    | 'support'
    | 'promotion'
    | 'relationship'
    | 'propose_new_products'
    | 'check_assets'
    | 'collect_debt'
    | 'discuss_promotion'
    | 'general_followup'
    | 'other';

export const VisitObjectives: VisitObjective[] = [
    'sales',
    'delivery',
    'collect_payment',
    'survey',
    'support',
    'promotion',
    'relationship',
    'propose_new_products',
    'check_assets',
    'collect_debt',
    'discuss_promotion',
    'general_followup',
    'other'
];

export type VatType = 'ex-vat' | 'in-vat' | 'non-vat';

export type CreditTerm = 0 | 7 | 15 | 30 | 45 | 60 | 90;

export type CustomerType = 'individual' | 'juristic';

// Entity Types
export interface Employee {
    id: string;
    name: string;
    email: string;
    phone: string;
    role: Role;
    avatar?: string | null;
    portfolioSize: number;
    username?: string | null;
    password?: string | null;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface ContactPerson {
    id: string;
    name: string;
    role: string;
    phone: string;
    lineId?: string | null;
}

export interface Location {
    id: string;
    code?: string;
    status?: LocationStatus;
    name: string;
    address: string;
    postalCode: string;
    district: string;
    province: string;
    region?: string | null;
    googleMapLink?: string | null;
    lat?: number;
    lng?: number;
    officialName?: string | null;
    customerType?: CustomerType | null;
    ownerName?: string | null;
    ownerPhone?: string | null;
    documents?: string[];
    shippingAddress?: string | null;
    receiverName?: string | null;
    receiverPhone?: string | null;
    creditTerm?: CreditTerm | null;
    vatType?: VatType | null;
    promotionNotes?: string | null;
    notes?: string | null;
    statusNote?: string | null;
    createdBy?: string | null;
    assignedEmployeeIds?: string[];
    contacts?: ContactPerson[];
}

export interface Company {
    id: string;
    name: string;
    taxId?: string | null;
    logo?: string | null;
    grade?: string | null;
    status: CustomerStatus;
    locations: Location[];
    createdAt?: Date;
    updatedAt?: Date;
}

export interface Visit {
    id: string;
    employeeId: string;
    locationId: string;
    checkInTime: string;
    checkOutTime?: string | null;
    objectives: VisitObjective[];
    notes?: string | null;
    images: string[];
    metOwner?: boolean;
    employee?: Employee;
    location?: Location & { company?: Company };
}

export interface Task {
    id: string;
    title: string;
    description?: string | null;
    objectives?: VisitObjective[];
    assigneeId: string;
    customerId?: string | null;
    locationId?: string | null;
    dueDate: string;
    priority?: TaskPriority;
    status: TaskStatus;
    completionNote?: string | null;
    createdAt?: string;
    assignee?: Employee;
    customer?: Company;
    location?: Location;
}

export interface LeaveRequest {
    id: string;
    employeeId: string;
    type: LeaveType;
    startDate: string;
    endDate: string;
    days?: number;
    reason?: string | null;
    status: LeaveStatus;
    reviewedBy?: string | null;
    reviewedAt?: string | null;
    reviewNote?: string | null;
    createdAt: string;
    employee?: Employee;
}

export interface ActivityLog {
    id: string;
    employeeId: string;
    employeeName?: string | null;
    type: ActivityType;
    description: string;
    metadata?: any;
    timestamp: string;
    employee?: Employee;
}
