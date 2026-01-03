// Common Types for the application

export type Role = 'sales' | 'manager';

export type CustomerStatus = 'lead' | 'existing' | 'inactive' | 'closed' | 'terminate';

export type LocationStatus = 'active' | 'inactive' | 'lead';

export type LeaveType = 'sick' | 'personal' | 'annual' | 'other';

export type LeaveStatus = 'pending' | 'approved' | 'rejected';

export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'overdue';

export type TaskPriority = 'low' | 'medium' | 'high';

export type ActivityType =
    | 'visit'
    | 'task_completed'
    | 'leave_request'
    | 'customer_added'
    | 'note_added';

export type VisitObjective =
    | 'sales'
    | 'delivery'
    | 'collect_payment'
    | 'survey'
    | 'support'
    | 'promotion'
    | 'relationship'
    | 'other';

export const VisitObjectives: VisitObjective[] = [
    'sales',
    'delivery',
    'collect_payment',
    'survey',
    'support',
    'promotion',
    'relationship',
    'other'
];

export type VatType = 'include' | 'exclude' | 'none';

export type CreditTerm = 0 | 7 | 15 | 30 | 45 | 60 | 90;

export type CustomerType =
    | 'restaurant'
    | 'cafe'
    | 'hotel'
    | 'retail'
    | 'wholesale'
    | 'other';

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
    code: string;
    status: LocationStatus;
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
    assignedTo?: string[];
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
    reason?: string | null;
    status: LeaveStatus;
    reviewedBy?: string | null;
    reviewNote?: string | null;
    createdAt?: string;
    employee?: Employee;
}

export interface ActivityLog {
    id: string;
    employeeId: string;
    type: ActivityType;
    description: string;
    metadata?: any;
    timestamp: string;
    employee?: Employee;
}
