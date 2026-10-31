export declare function resolvePublicSchool(slug: string): Promise<any>;
export declare function listPublicSchools(): Promise<{
    id: any;
    name: any;
    slug: any;
    logoUrl: any;
    address: any;
    description: any;
    tagline: any;
    establishedYear: any;
    principalName: any;
}[]>;
export declare function getPublicSchoolProfile(schoolId: string): Promise<{
    id: any;
    name: any;
    slug: any;
    logoUrl: any;
    address: any;
    contactPhone: any;
    contactEmail: any;
    principalName: any;
    description: any;
    tagline: any;
    establishedYear: any;
    _count: {
        students: number;
        teachers: number;
        classes: number;
    };
}>;
export declare function getPublicFacilities(schoolId: string): Promise<{
    id: any;
    name: any;
    description: any;
    icon: any;
}[]>;
export declare function getPublicAchievements(schoolId: string): Promise<{
    id: any;
    title: any;
    description: any;
    year: any;
}[]>;
export declare function getPublicGallery(schoolId: string, category?: string): Promise<{
    id: any;
    title: any;
    description: any;
    category: any;
    fileUrl: any;
    createdAt: any;
}[]>;
export declare function getPublicNotices(schoolId: string): Promise<{
    id: any;
    title: any;
    content: any;
    publishedAt: any;
    createdAt: any;
}[]>;
export declare function getPublicEvents(schoolId: string): Promise<{
    id: any;
    title: any;
    description: any;
    eventDate: any;
}[]>;
export declare function getPublicHomePageData(schoolId: string): Promise<{
    profile: {
        id: any;
        name: any;
        slug: any;
        logoUrl: any;
        address: any;
        contactPhone: any;
        contactEmail: any;
        principalName: any;
        description: any;
        tagline: any;
        establishedYear: any;
        _count: {
            students: number;
            teachers: number;
            classes: number;
        };
    };
    facilities: {
        id: any;
        name: any;
        description: any;
        icon: any;
    }[];
    achievements: {
        id: any;
        title: any;
        description: any;
        year: any;
    }[];
    gallery: {
        id: any;
        title: any;
        description: any;
        category: any;
        fileUrl: any;
        createdAt: any;
    }[];
    notices: {
        id: any;
        title: any;
        content: any;
        publishedAt: any;
        createdAt: any;
    }[];
    events: {
        id: any;
        title: any;
        description: any;
        eventDate: any;
    }[];
}>;
//# sourceMappingURL=public.service.d.ts.map