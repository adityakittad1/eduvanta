export declare function resolvePublicSchool(slug: string): Promise<string>;
export declare function listPublicSchools(): Promise<{
    id: string;
    name: string;
    slug: string | null;
    logoUrl: string | null;
    address: string | null;
    principalName: string | null;
    description: string | null;
    tagline: string | null;
    establishedYear: number | null;
}[]>;
export declare function getPublicSchoolProfile(schoolId: string): Promise<{
    id: string;
    name: string;
    _count: {
        students: number;
        teachers: number;
        classes: number;
    };
    slug: string | null;
    logoUrl: string | null;
    address: string | null;
    contactPhone: string | null;
    contactEmail: string | null;
    principalName: string | null;
    description: string | null;
    tagline: string | null;
    establishedYear: number | null;
}>;
export declare function getPublicFacilities(schoolId: string): Promise<{
    id: string;
    name: string;
    description: string | null;
    icon: string | null;
}[]>;
export declare function getPublicAchievements(schoolId: string): Promise<{
    id: string;
    description: string | null;
    year: number | null;
    title: string;
}[]>;
export declare function getPublicGallery(schoolId: string, category?: string): Promise<{
    id: string;
    createdAt: Date;
    description: string | null;
    title: string;
    fileUrl: string;
    category: import(".prisma/client").$Enums.GalleryCategory;
}[]>;
export declare function getPublicNotices(schoolId: string): Promise<{
    id: string;
    createdAt: Date;
    title: string;
    content: string;
    publishedAt: Date | null;
}[]>;
export declare function getPublicEvents(schoolId: string): Promise<{
    id: string;
    description: string | null;
    title: string;
    eventDate: Date;
}[]>;
export declare function getPublicHomePageData(schoolId: string): Promise<{
    profile: {
        id: string;
        name: string;
        _count: {
            students: number;
            teachers: number;
            classes: number;
        };
        slug: string | null;
        logoUrl: string | null;
        address: string | null;
        contactPhone: string | null;
        contactEmail: string | null;
        principalName: string | null;
        description: string | null;
        tagline: string | null;
        establishedYear: number | null;
    };
    facilities: {
        id: string;
        name: string;
        description: string | null;
        icon: string | null;
    }[];
    achievements: {
        id: string;
        description: string | null;
        year: number | null;
        title: string;
    }[];
    gallery: {
        id: string;
        createdAt: Date;
        description: string | null;
        title: string;
        fileUrl: string;
        category: import(".prisma/client").$Enums.GalleryCategory;
    }[];
    notices: {
        id: string;
        createdAt: Date;
        title: string;
        content: string;
        publishedAt: Date | null;
    }[];
    events: {
        id: string;
        description: string | null;
        title: string;
        eventDate: Date;
    }[];
}>;
//# sourceMappingURL=public.service.d.ts.map