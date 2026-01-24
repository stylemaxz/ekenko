import { createSwaggerSpec } from 'next-swagger-doc';

export const getApiDocs = () => {
    const spec = createSwaggerSpec({
        apiFolder: 'src/app/api',
        definition: {
            openapi: '3.0.0',
            info: {
                title: 'Ekenko Sales Tracker API',
                version: '1.0.0',
                description: 'Sales Force Automation (SFA) API for managing sales team activities, customer relationships, task assignments, and performance tracking.',
                contact: {
                    name: 'Ekenko Support',
                },
            },
            servers: [
                {
                    url: process.env.NODE_ENV === 'production'
                        ? 'https://your-domain.com'
                        : 'http://localhost:3000',
                    description: process.env.NODE_ENV === 'production'
                        ? 'Production server'
                        : 'Development server',
                },
            ],
            components: {
                securitySchemes: {
                    cookieAuth: {
                        type: 'apiKey',
                        in: 'cookie',
                        name: 'accessToken',
                        description: 'JWT token stored in httpOnly cookie',
                    },
                },
                schemas: {
                    Error: {
                        type: 'object',
                        properties: {
                            error: { type: 'string' },
                        },
                    },
                    Employee: {
                        type: 'object',
                        properties: {
                            id: { type: 'string', format: 'uuid' },
                            name: { type: 'string' },
                            email: { type: 'string', format: 'email' },
                            phone: { type: 'string' },
                            role: { type: 'string', enum: ['sales', 'manager'] },
                            avatar: { type: 'string', nullable: true },
                            portfolioSize: { type: 'integer' },
                            username: { type: 'string', nullable: true },
                            assignedLocationIds: { type: 'array', items: { type: 'string' } },
                            createdAt: { type: 'string', format: 'date-time' },
                            updatedAt: { type: 'string', format: 'date-time' },
                        },
                    },
                    EmployeeCreate: {
                        type: 'object',
                        required: ['name', 'email', 'username', 'password'],
                        properties: {
                            name: { type: 'string' },
                            email: { type: 'string', format: 'email' },
                            phone: { type: 'string' },
                            role: { type: 'string', enum: ['sales', 'manager'] },
                            username: { type: 'string' },
                            password: { type: 'string' },
                        },
                    },
                    Company: {
                        type: 'object',
                        properties: {
                            id: { type: 'string', format: 'uuid' },
                            name: { type: 'string' },
                            taxId: { type: 'string', nullable: true },
                            logo: { type: 'string', nullable: true },
                            grade: { type: 'string', enum: ['A', 'B', 'C'] },
                            status: { type: 'string', enum: ['existing', 'lead', 'inactive', 'closed', 'terminate', 'active'] },
                            locations: { type: 'array', items: { $ref: '#/components/schemas/Location' } },
                            createdAt: { type: 'string', format: 'date-time' },
                            updatedAt: { type: 'string', format: 'date-time' },
                        },
                    },
                    CompanyCreate: {
                        type: 'object',
                        required: ['name', 'grade', 'status'],
                        properties: {
                            name: { type: 'string' },
                            taxId: { type: 'string' },
                            grade: { type: 'string', enum: ['A', 'B', 'C'] },
                            status: { type: 'string', enum: ['existing', 'lead', 'inactive', 'closed', 'terminate', 'active'] },
                        },
                    },
                    Location: {
                        type: 'object',
                        properties: {
                            id: { type: 'string', format: 'uuid' },
                            companyId: { type: 'string', format: 'uuid' },
                            code: { type: 'string', nullable: true },
                            status: { type: 'string', enum: ['existing', 'lead', 'inactive', 'closed', 'terminate', 'active'], nullable: true },
                            name: { type: 'string' },
                            address: { type: 'string' },
                            postalCode: { type: 'string', nullable: true },
                            district: { type: 'string', nullable: true },
                            province: { type: 'string', nullable: true },
                            region: { type: 'string', nullable: true },
                            googleMapLink: { type: 'string', nullable: true },
                            lat: { type: 'number' },
                            lng: { type: 'number' },
                            officialName: { type: 'string', nullable: true },
                            customerType: { type: 'string', enum: ['individual', 'juristic'], nullable: true },
                            ownerName: { type: 'string', nullable: true },
                            ownerPhone: { type: 'string', nullable: true },
                            documents: { type: 'array', items: { type: 'string' } },
                            shippingAddress: { type: 'string', nullable: true },
                            receiverName: { type: 'string', nullable: true },
                            receiverPhone: { type: 'string', nullable: true },
                            creditTerm: { type: 'integer', nullable: true },
                            vatType: { type: 'string', enum: ['ex-vat', 'in-vat', 'non-vat'], nullable: true },
                            promotionNotes: { type: 'string', nullable: true },
                            notes: { type: 'string', nullable: true },
                            createdAt: { type: 'string', format: 'date-time' },
                            updatedAt: { type: 'string', format: 'date-time' },
                        },
                    },
                    Visit: {
                        type: 'object',
                        properties: {
                            id: { type: 'string', format: 'uuid' },
                            employeeId: { type: 'string', format: 'uuid' },
                            locationId: { type: 'string', format: 'uuid' },
                            checkInTime: { type: 'string', format: 'date-time' },
                            checkOutTime: { type: 'string', format: 'date-time', nullable: true },
                            objectives: { type: 'array', items: { type: 'string' } },
                            notes: { type: 'string', nullable: true },
                            images: { type: 'array', items: { type: 'string' } },
                            metOwner: { type: 'boolean' },
                            createdAt: { type: 'string', format: 'date-time' },
                        },
                    },
                    VisitCreate: {
                        type: 'object',
                        required: ['employeeId', 'locationId', 'checkInTime'],
                        properties: {
                            employeeId: { type: 'string', format: 'uuid' },
                            locationId: { type: 'string', format: 'uuid' },
                            checkInTime: { type: 'string', format: 'date-time' },
                            objectives: { type: 'array', items: { type: 'string' } },
                            notes: { type: 'string' },
                            images: { type: 'array', items: { type: 'string' } },
                            metOwner: { type: 'boolean' },
                        },
                    },
                    Task: {
                        type: 'object',
                        properties: {
                            id: { type: 'string', format: 'uuid' },
                            title: { type: 'string' },
                            description: { type: 'string', nullable: true },
                            objectives: { type: 'array', items: { type: 'string' } },
                            assigneeId: { type: 'string', format: 'uuid' },
                            customerId: { type: 'string', format: 'uuid', nullable: true },
                            locationId: { type: 'string', format: 'uuid', nullable: true },
                            dueDate: { type: 'string', format: 'date-time' },
                            priority: { type: 'string', enum: ['low', 'medium', 'high'] },
                            status: { type: 'string', enum: ['pending', 'in_progress', 'completed', 'overdue'] },
                            completionNote: { type: 'string', nullable: true },
                            createdAt: { type: 'string', format: 'date-time' },
                            updatedAt: { type: 'string', format: 'date-time' },
                        },
                    },
                    TaskCreate: {
                        type: 'object',
                        required: ['title', 'assigneeId', 'dueDate', 'priority', 'status'],
                        properties: {
                            title: { type: 'string' },
                            description: { type: 'string' },
                            objectives: { type: 'array', items: { type: 'string' } },
                            assigneeId: { type: 'string', format: 'uuid' },
                            customerId: { type: 'string', format: 'uuid' },
                            locationId: { type: 'string', format: 'uuid' },
                            dueDate: { type: 'string', format: 'date-time' },
                            priority: { type: 'string', enum: ['low', 'medium', 'high'] },
                            status: { type: 'string', enum: ['pending', 'in_progress', 'completed', 'overdue'] },
                        },
                    },
                    LeaveRequest: {
                        type: 'object',
                        properties: {
                            id: { type: 'string', format: 'uuid' },
                            employeeId: { type: 'string', format: 'uuid' },
                            type: { type: 'string', enum: ['sick', 'personal', 'vacation', 'other'] },
                            startDate: { type: 'string', format: 'date-time' },
                            endDate: { type: 'string', format: 'date-time' },
                            days: { type: 'number' },
                            reason: { type: 'string' },
                            isPaid: { type: 'boolean' },
                            status: { type: 'string', enum: ['pending', 'approved', 'rejected'] },
                            reviewNote: { type: 'string', nullable: true },
                            reviewedBy: { type: 'string', nullable: true },
                            reviewedAt: { type: 'string', format: 'date-time', nullable: true },
                            createdAt: { type: 'string', format: 'date-time' },
                        },
                    },
                    LeaveRequestCreate: {
                        type: 'object',
                        required: ['employeeId', 'type', 'startDate', 'endDate', 'days', 'reason'],
                        properties: {
                            employeeId: { type: 'string', format: 'uuid' },
                            type: { type: 'string', enum: ['sick', 'personal', 'vacation', 'other'] },
                            startDate: { type: 'string', format: 'date-time' },
                            endDate: { type: 'string', format: 'date-time' },
                            days: { type: 'number' },
                            reason: { type: 'string' },
                            isPaid: { type: 'boolean' },
                        },
                    },
                    ActivityLog: {
                        type: 'object',
                        properties: {
                            id: { type: 'string', format: 'uuid' },
                            type: { type: 'string' },
                            employeeId: { type: 'string', format: 'uuid' },
                            employeeName: { type: 'string' },
                            description: { type: 'string' },
                            metadata: { type: 'object' },
                            timestamp: { type: 'string', format: 'date-time' },
                        },
                    },
                    LoginRequest: {
                        type: 'object',
                        required: ['username', 'password'],
                        properties: {
                            username: { type: 'string' },
                            password: { type: 'string' },
                        },
                    },
                    LoginResponse: {
                        type: 'object',
                        properties: {
                            success: { type: 'boolean' },
                            user: { $ref: '#/components/schemas/Employee' },
                            redirectUrl: { type: 'string' },
                        },
                    },
                },
            },
            security: [{ cookieAuth: [] }],
            tags: [
                { name: 'Auth', description: 'Authentication endpoints' },
                { name: 'Employees', description: 'Employee management' },
                { name: 'Companies', description: 'Company management' },
                { name: 'Visits', description: 'Visit/Check-in management' },
                { name: 'Tasks', description: 'Task management' },
                { name: 'Leave Requests', description: 'Leave request management' },
                { name: 'Activity Logs', description: 'Activity log viewing' },
                { name: 'Upload', description: 'File upload' },
                { name: 'Utilities', description: 'Utility endpoints' },
            ],
            paths: {
                '/api/auth/login': {
                    post: {
                        tags: ['Auth'],
                        summary: 'Login',
                        description: 'Authenticate user and set JWT cookie',
                        security: [],
                        requestBody: {
                            required: true,
                            content: {
                                'application/json': {
                                    schema: { $ref: '#/components/schemas/LoginRequest' },
                                },
                            },
                        },
                        responses: {
                            '200': {
                                description: 'Login successful',
                                content: {
                                    'application/json': {
                                        schema: { $ref: '#/components/schemas/LoginResponse' },
                                    },
                                },
                            },
                            '400': {
                                description: 'Missing credentials',
                                content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
                            },
                            '401': {
                                description: 'Invalid credentials',
                                content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
                            },
                        },
                    },
                },
                '/api/auth/logout': {
                    post: {
                        tags: ['Auth'],
                        summary: 'Logout',
                        description: 'Clear JWT cookie and logout user',
                        responses: {
                            '200': {
                                description: 'Logout successful',
                                content: {
                                    'application/json': {
                                        schema: {
                                            type: 'object',
                                            properties: { success: { type: 'boolean' } },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
                '/api/auth/me': {
                    get: {
                        tags: ['Auth'],
                        summary: 'Get current user',
                        description: 'Get the currently authenticated user information',
                        responses: {
                            '200': {
                                description: 'Current user info',
                                content: {
                                    'application/json': {
                                        schema: { $ref: '#/components/schemas/Employee' },
                                    },
                                },
                            },
                            '401': {
                                description: 'Unauthorized',
                                content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
                            },
                        },
                    },
                },
                '/api/employees': {
                    get: {
                        tags: ['Employees'],
                        summary: 'Get all employees',
                        description: 'Retrieve list of all employees',
                        responses: {
                            '200': {
                                description: 'List of employees',
                                content: {
                                    'application/json': {
                                        schema: {
                                            type: 'array',
                                            items: { $ref: '#/components/schemas/Employee' },
                                        },
                                    },
                                },
                            },
                            '401': {
                                description: 'Unauthorized',
                                content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
                            },
                        },
                    },
                    post: {
                        tags: ['Employees'],
                        summary: 'Create employee',
                        description: 'Create a new employee (Manager only)',
                        requestBody: {
                            required: true,
                            content: {
                                'application/json': {
                                    schema: { $ref: '#/components/schemas/EmployeeCreate' },
                                },
                            },
                        },
                        responses: {
                            '201': {
                                description: 'Employee created',
                                content: {
                                    'application/json': {
                                        schema: { $ref: '#/components/schemas/Employee' },
                                    },
                                },
                            },
                            '400': {
                                description: 'Missing required fields',
                                content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
                            },
                            '401': {
                                description: 'Unauthorized',
                                content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
                            },
                            '409': {
                                description: 'Email or username already exists',
                                content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
                            },
                        },
                    },
                },
                '/api/employees/{id}': {
                    get: {
                        tags: ['Employees'],
                        summary: 'Get employee by ID',
                        parameters: [
                            {
                                name: 'id',
                                in: 'path',
                                required: true,
                                schema: { type: 'string', format: 'uuid' },
                            },
                        ],
                        responses: {
                            '200': {
                                description: 'Employee details',
                                content: {
                                    'application/json': {
                                        schema: { $ref: '#/components/schemas/Employee' },
                                    },
                                },
                            },
                            '404': {
                                description: 'Employee not found',
                                content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
                            },
                        },
                    },
                    put: {
                        tags: ['Employees'],
                        summary: 'Update employee',
                        description: 'Update employee details (Manager only)',
                        parameters: [
                            {
                                name: 'id',
                                in: 'path',
                                required: true,
                                schema: { type: 'string', format: 'uuid' },
                            },
                        ],
                        requestBody: {
                            required: true,
                            content: {
                                'application/json': {
                                    schema: { $ref: '#/components/schemas/EmployeeCreate' },
                                },
                            },
                        },
                        responses: {
                            '200': {
                                description: 'Employee updated',
                                content: {
                                    'application/json': {
                                        schema: { $ref: '#/components/schemas/Employee' },
                                    },
                                },
                            },
                            '401': {
                                description: 'Unauthorized',
                                content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
                            },
                            '404': {
                                description: 'Employee not found',
                                content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
                            },
                            '409': {
                                description: 'Email or username already exists',
                                content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
                            },
                        },
                    },
                    delete: {
                        tags: ['Employees'],
                        summary: 'Delete employee',
                        description: 'Delete an employee (Manager only)',
                        parameters: [
                            {
                                name: 'id',
                                in: 'path',
                                required: true,
                                schema: { type: 'string', format: 'uuid' },
                            },
                        ],
                        responses: {
                            '200': {
                                description: 'Employee deleted',
                                content: {
                                    'application/json': {
                                        schema: {
                                            type: 'object',
                                            properties: { success: { type: 'boolean' } },
                                        },
                                    },
                                },
                            },
                            '401': {
                                description: 'Unauthorized',
                                content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
                            },
                            '404': {
                                description: 'Employee not found',
                                content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
                            },
                        },
                    },
                },
                '/api/companies': {
                    get: {
                        tags: ['Companies'],
                        summary: 'Get all companies',
                        description: 'Retrieve list of all companies with locations',
                        responses: {
                            '200': {
                                description: 'List of companies',
                                content: {
                                    'application/json': {
                                        schema: {
                                            type: 'array',
                                            items: { $ref: '#/components/schemas/Company' },
                                        },
                                    },
                                },
                            },
                            '401': {
                                description: 'Unauthorized',
                                content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
                            },
                        },
                    },
                    post: {
                        tags: ['Companies'],
                        summary: 'Create company',
                        description: 'Create a new company',
                        requestBody: {
                            required: true,
                            content: {
                                'application/json': {
                                    schema: { $ref: '#/components/schemas/CompanyCreate' },
                                },
                            },
                        },
                        responses: {
                            '201': {
                                description: 'Company created',
                                content: {
                                    'application/json': {
                                        schema: { $ref: '#/components/schemas/Company' },
                                    },
                                },
                            },
                            '401': {
                                description: 'Unauthorized',
                                content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
                            },
                        },
                    },
                },
                '/api/companies/{id}': {
                    get: {
                        tags: ['Companies'],
                        summary: 'Get company by ID',
                        parameters: [
                            {
                                name: 'id',
                                in: 'path',
                                required: true,
                                schema: { type: 'string', format: 'uuid' },
                            },
                        ],
                        responses: {
                            '200': {
                                description: 'Company details',
                                content: {
                                    'application/json': {
                                        schema: { $ref: '#/components/schemas/Company' },
                                    },
                                },
                            },
                            '401': {
                                description: 'Unauthorized',
                                content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
                            },
                            '404': {
                                description: 'Company not found',
                                content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
                            },
                        },
                    },
                    put: {
                        tags: ['Companies'],
                        summary: 'Update company',
                        parameters: [
                            {
                                name: 'id',
                                in: 'path',
                                required: true,
                                schema: { type: 'string', format: 'uuid' },
                            },
                        ],
                        requestBody: {
                            required: true,
                            content: {
                                'application/json': {
                                    schema: { $ref: '#/components/schemas/CompanyCreate' },
                                },
                            },
                        },
                        responses: {
                            '200': {
                                description: 'Company updated',
                                content: {
                                    'application/json': {
                                        schema: { $ref: '#/components/schemas/Company' },
                                    },
                                },
                            },
                            '401': {
                                description: 'Unauthorized',
                                content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
                            },
                            '404': {
                                description: 'Company not found',
                                content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
                            },
                        },
                    },
                    delete: {
                        tags: ['Companies'],
                        summary: 'Delete company',
                        description: 'Delete a company (Manager only)',
                        parameters: [
                            {
                                name: 'id',
                                in: 'path',
                                required: true,
                                schema: { type: 'string', format: 'uuid' },
                            },
                        ],
                        responses: {
                            '200': {
                                description: 'Company deleted',
                                content: {
                                    'application/json': {
                                        schema: {
                                            type: 'object',
                                            properties: { success: { type: 'boolean' } },
                                        },
                                    },
                                },
                            },
                            '401': {
                                description: 'Unauthorized',
                                content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
                            },
                            '404': {
                                description: 'Company not found',
                                content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
                            },
                        },
                    },
                },
                '/api/visits': {
                    get: {
                        tags: ['Visits'],
                        summary: 'Get visits',
                        description: 'Get all visits or filter by employee ID',
                        parameters: [
                            {
                                name: 'employeeId',
                                in: 'query',
                                required: false,
                                schema: { type: 'string', format: 'uuid' },
                                description: 'Filter visits by employee ID',
                            },
                        ],
                        responses: {
                            '200': {
                                description: 'List of visits',
                                content: {
                                    'application/json': {
                                        schema: {
                                            type: 'array',
                                            items: { $ref: '#/components/schemas/Visit' },
                                        },
                                    },
                                },
                            },
                            '401': {
                                description: 'Unauthorized',
                                content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
                            },
                        },
                    },
                    post: {
                        tags: ['Visits'],
                        summary: 'Create visit',
                        description: 'Create a new visit/check-in record',
                        requestBody: {
                            required: true,
                            content: {
                                'application/json': {
                                    schema: { $ref: '#/components/schemas/VisitCreate' },
                                },
                            },
                        },
                        responses: {
                            '201': {
                                description: 'Visit created',
                                content: {
                                    'application/json': {
                                        schema: { $ref: '#/components/schemas/Visit' },
                                    },
                                },
                            },
                            '401': {
                                description: 'Unauthorized',
                                content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
                            },
                        },
                    },
                },
                '/api/tasks': {
                    get: {
                        tags: ['Tasks'],
                        summary: 'Get tasks',
                        description: 'Get all tasks or filter by assignee ID',
                        parameters: [
                            {
                                name: 'assigneeId',
                                in: 'query',
                                required: false,
                                schema: { type: 'string', format: 'uuid' },
                                description: 'Filter tasks by assignee ID',
                            },
                        ],
                        responses: {
                            '200': {
                                description: 'List of tasks',
                                content: {
                                    'application/json': {
                                        schema: {
                                            type: 'array',
                                            items: { $ref: '#/components/schemas/Task' },
                                        },
                                    },
                                },
                            },
                            '401': {
                                description: 'Unauthorized',
                                content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
                            },
                        },
                    },
                    post: {
                        tags: ['Tasks'],
                        summary: 'Create task',
                        description: 'Create a new task (Manager only)',
                        requestBody: {
                            required: true,
                            content: {
                                'application/json': {
                                    schema: { $ref: '#/components/schemas/TaskCreate' },
                                },
                            },
                        },
                        responses: {
                            '201': {
                                description: 'Task created',
                                content: {
                                    'application/json': {
                                        schema: { $ref: '#/components/schemas/Task' },
                                    },
                                },
                            },
                            '401': {
                                description: 'Unauthorized',
                                content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
                            },
                        },
                    },
                },
                '/api/leave-requests': {
                    get: {
                        tags: ['Leave Requests'],
                        summary: 'Get leave requests',
                        description: 'Get all leave requests or filter by employee ID',
                        parameters: [
                            {
                                name: 'employeeId',
                                in: 'query',
                                required: false,
                                schema: { type: 'string', format: 'uuid' },
                                description: 'Filter leave requests by employee ID',
                            },
                        ],
                        responses: {
                            '200': {
                                description: 'List of leave requests',
                                content: {
                                    'application/json': {
                                        schema: {
                                            type: 'array',
                                            items: { $ref: '#/components/schemas/LeaveRequest' },
                                        },
                                    },
                                },
                            },
                            '401': {
                                description: 'Unauthorized',
                                content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
                            },
                        },
                    },
                    post: {
                        tags: ['Leave Requests'],
                        summary: 'Create leave request',
                        description: 'Submit a new leave request',
                        requestBody: {
                            required: true,
                            content: {
                                'application/json': {
                                    schema: { $ref: '#/components/schemas/LeaveRequestCreate' },
                                },
                            },
                        },
                        responses: {
                            '201': {
                                description: 'Leave request created',
                                content: {
                                    'application/json': {
                                        schema: { $ref: '#/components/schemas/LeaveRequest' },
                                    },
                                },
                            },
                            '401': {
                                description: 'Unauthorized',
                                content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
                            },
                        },
                    },
                },
                '/api/leave-requests/{id}': {
                    put: {
                        tags: ['Leave Requests'],
                        summary: 'Update leave request',
                        description: 'Approve or reject a leave request (Manager only)',
                        parameters: [
                            {
                                name: 'id',
                                in: 'path',
                                required: true,
                                schema: { type: 'string', format: 'uuid' },
                            },
                        ],
                        requestBody: {
                            required: true,
                            content: {
                                'application/json': {
                                    schema: {
                                        type: 'object',
                                        properties: {
                                            status: { type: 'string', enum: ['approved', 'rejected'] },
                                            reviewNote: { type: 'string' },
                                        },
                                    },
                                },
                            },
                        },
                        responses: {
                            '200': {
                                description: 'Leave request updated',
                                content: {
                                    'application/json': {
                                        schema: { $ref: '#/components/schemas/LeaveRequest' },
                                    },
                                },
                            },
                            '401': {
                                description: 'Unauthorized',
                                content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
                            },
                            '404': {
                                description: 'Leave request not found',
                                content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
                            },
                        },
                    },
                },
                '/api/activity-logs': {
                    get: {
                        tags: ['Activity Logs'],
                        summary: 'Get activity logs',
                        description: 'Get all activity logs',
                        responses: {
                            '200': {
                                description: 'List of activity logs',
                                content: {
                                    'application/json': {
                                        schema: {
                                            type: 'array',
                                            items: { $ref: '#/components/schemas/ActivityLog' },
                                        },
                                    },
                                },
                            },
                            '401': {
                                description: 'Unauthorized',
                                content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
                            },
                        },
                    },
                },
                '/api/upload': {
                    post: {
                        tags: ['Upload'],
                        summary: 'Upload file',
                        description: 'Upload a file to Google Cloud Storage',
                        requestBody: {
                            required: true,
                            content: {
                                'multipart/form-data': {
                                    schema: {
                                        type: 'object',
                                        properties: {
                                            file: {
                                                type: 'string',
                                                format: 'binary',
                                            },
                                        },
                                    },
                                },
                            },
                        },
                        responses: {
                            '200': {
                                description: 'File uploaded successfully',
                                content: {
                                    'application/json': {
                                        schema: {
                                            type: 'object',
                                            properties: {
                                                url: { type: 'string' },
                                            },
                                        },
                                    },
                                },
                            },
                            '401': {
                                description: 'Unauthorized',
                                content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
                            },
                        },
                    },
                },
                '/api/extract-coordinates': {
                    post: {
                        tags: ['Utilities'],
                        summary: 'Extract coordinates from Google Maps link',
                        description: 'Extract latitude and longitude from a Google Maps URL',
                        requestBody: {
                            required: true,
                            content: {
                                'application/json': {
                                    schema: {
                                        type: 'object',
                                        properties: {
                                            url: { type: 'string' },
                                        },
                                        required: ['url'],
                                    },
                                },
                            },
                        },
                        responses: {
                            '200': {
                                description: 'Coordinates extracted',
                                content: {
                                    'application/json': {
                                        schema: {
                                            type: 'object',
                                            properties: {
                                                lat: { type: 'number' },
                                                lng: { type: 'number' },
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
                '/api/check-db': {
                    get: {
                        tags: ['Utilities'],
                        summary: 'Check database connection',
                        description: 'Verify database connectivity',
                        security: [],
                        responses: {
                            '200': {
                                description: 'Database connected',
                                content: {
                                    'application/json': {
                                        schema: {
                                            type: 'object',
                                            properties: {
                                                status: { type: 'string' },
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            },
        },
    });
    return spec;
};
