export declare function generateCuid(): string;
export declare function mapSchool(row: any): any;
export declare function mapStudent(row: any): any;
export declare function mapClass(row: any): any;
export declare function mapTeacher(row: any): any;
export declare function mapUser(row: any): any;
export declare function dbCreateAuditLog(params: {
    userId: string;
    action: string;
    entityType: string;
    entityId: string;
    details?: any;
    schoolId?: string | null;
}): Promise<void>;
export declare function dbFindSchoolBySlug(slug: string): Promise<any | null>;
export declare function dbGetAllSchools(params: {
    skip: number;
    take: number;
    search?: string;
}): Promise<{
    schools: any[];
    total: number;
}>;
export declare function dbGetSchoolById(id: string): Promise<any | null>;
export declare function dbCreateSchool(data: {
    name: string;
    slug: string;
    address?: string | null;
    contactPhone?: string | null;
    contactEmail?: string | null;
    principalName?: string | null;
    description?: string | null;
    logoUrl?: string | null;
}): Promise<any>;
export declare function dbUpdateSchool(id: string, data: any): Promise<any>;
export declare function dbGetStudents(params: {
    schoolId: string;
    classId?: string;
    skip: number;
    take: number;
}): Promise<{
    students: any[];
    total: number;
}>;
export declare function dbGetStudentById(id: string, schoolId: string): Promise<any | null>;
export declare function dbFindStudentByAdmission(schoolId: string, admissionNumber: string): Promise<any | null>;
export declare function dbCreateStudent(params: {
    schoolId: string;
    userId?: string | null;
    admissionNumber: string;
    firstName: string;
    lastName: string;
    dateOfBirth?: Date | null;
    gender?: any;
    address?: string | null;
    guardianName?: string | null;
    guardianPhone?: string | null;
    academicYear: string;
    classId?: string | null;
}): Promise<any>;
export declare function dbUpdateStudent(id: string, schoolId: string, data: any): Promise<any>;
export declare function dbGetClasses(schoolId: string): Promise<any[]>;
export declare function dbGetClassById(id: string, schoolId: string): Promise<any | null>;
export declare function dbCreateClass(params: {
    schoolId: string;
    name: string;
    division?: string | null;
    academicYear: string;
}): Promise<any>;
export declare function dbGetTeachers(params: {
    schoolId: string;
    skip: number;
    take: number;
}): Promise<{
    teachers: any[];
    total: number;
}>;
export declare function dbCreateTeacher(params: {
    schoolId: string;
    userId: string;
    firstName: string;
    lastName: string;
    employeeId?: string | null;
    qualification?: string | null;
}): Promise<any>;
export declare function dbFindUserByEmail(email: string): Promise<any | null>;
export declare function dbCreateUser(params: {
    email: string;
    name?: string | null;
    passwordHash: string;
    role: string;
    schoolId?: string | null;
    isActive?: boolean;
}): Promise<any>;
export declare function dbFindUserById(id: string): Promise<any | null>;
export declare function dbUpdateUser(id: string, data: any): Promise<any>;
export declare function dbGetAllUsers(params: {
    schoolId?: string;
    allowedRoles?: string[];
    role?: string;
    search?: string;
    skip: number;
    take: number;
}): Promise<{
    users: any[];
    total: number;
}>;
//# sourceMappingURL=dataDb.d.ts.map