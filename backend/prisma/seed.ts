import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting comprehensive database seeding...');

  // 1. Create default SUPER_ADMIN user
  const superAdminEmail = 'admin@zpschoolerp.com';
  let superAdmin = await prisma.user.findUnique({
    where: { email: superAdminEmail },
  });

  const adminPasswordHash = await bcrypt.hash('Admin@1234', 10);
  if (!superAdmin) {
    superAdmin = await prisma.user.create({
      data: {
        email: superAdminEmail,
        name: 'State System Administrator',
        passwordHash: adminPasswordHash,
        role: 'SUPER_ADMIN',
        isActive: true,
      },
    });
    console.log('✅ Default SUPER_ADMIN created (admin@zpschoolerp.com / Admin@1234)');
  } else {
    console.log('✅ SUPER_ADMIN already exists.');
  }

  // 2. Define 6 Zilla Parishad Schools with realistic data
  const schoolsData = [
    {
      slug: 'ellora-highschool',
      name: 'ZP Ellora High School',
      tagline: 'Empowering Rural Minds Through Digital Excellence & Quality Education',
      address: 'Main Road, Ellora, Khuldabad Taluka, Chhatrapati Sambhaji Nagar, Maharashtra 431102',
      contactPhone: '+91 2437 244555',
      contactEmail: 'info@ellorahighschool.org',
      principalName: 'Mrs. Sangita Shinde (M.Sc., B.Ed.)',
      description: 'ZP Ellora High School is a premier government institution affiliated with Maharashtra State Board. Committed to providing holistic rural education, modern science laboratories, digital classrooms, and promoting sports and cultural activities.',
      establishedYear: 1998,
      isPublicEnabled: true,
      logoUrl: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=160&auto=format&fit=crop&q=80',
      principalEmail: 'shinde@gmail.com',
      principalPassword: 'Eduvanta@123',
      principalDisplayName: 'Sangita Shinde',
      facilities: [
        { name: 'Digital Smart Classrooms', description: 'Interactive smart boards with vernacular e-learning software.', icon: 'Laptop' },
        { name: 'STEM Science Laboratory', description: 'Fully equipped experimental workstations for physics, chemistry and biology.', icon: 'FlaskConical' },
        { name: 'Library & Reading Room', description: 'Over 3,500 books including reference texts, periodicals, and children literature.', icon: 'BookOpen' },
        { name: 'Sports Grounds & Equipment', description: 'Dedicated grounds for Kho-Kho, Kabaddi, Volleyball, and Cricket coaching.', icon: 'Trophy' },
        { name: 'Clean Drinking Water & Solar Power', description: 'RO water purification and 10 kW rooftop solar generation plant.', icon: 'Sun' },
        { name: 'Mid-Day Meal Dining Hall', description: 'Hygienic kitchen and seating providing balanced nutritional lunches daily.', icon: 'Utensils' },
      ],
      achievements: [
        { title: '100% SSC Board Exam Pass Rate', description: 'Achieved outstanding 100% pass rate in the 10th standard district board examination.', year: 2025 },
        { title: 'Maharashtra State Kho-Kho Runners-Up', description: 'Girls under-14 team secured second position in Maharashtra State Rural School Championship.', year: 2024 },
        { title: 'National Means-cum-Merit Scholarships', description: '12 meritorious students secured prestigious central government scholarships.', year: 2024 },
        { title: 'District Clean & Green School Award', description: 'First prize from Zilla Parishad Education Department for eco-friendly campus.', year: 2023 },
      ],
      events: [
        { title: 'Annual Sports & Athletic Meet', description: 'Two-day sports event featuring track events, tug of war, and indigenous rural games.', eventDate: new Date('2026-11-15T09:00:00Z'), isPublic: true },
        { title: 'Science & Innovation Exhibition', description: 'Student demonstrations on water harvesting, solar energy, and sustainable agriculture.', eventDate: new Date('2026-12-05T10:00:00Z'), isPublic: true },
        { title: 'Annual Cultural Day & Prize Distribution', description: 'Folk dances, drama performances, and felicitation of academic toppers.', eventDate: new Date('2026-12-23T16:00:00Z'), isPublic: true },
      ],
      notices: [
        {
          title: 'Admissions Open for Academic Year 2026-27',
          content: 'Admissions are now open for Grades 1 to 10. Free government textbooks, uniforms, and digital study materials will be provided to all enrolled students. Please visit the school office on weekdays between 10:00 AM and 3:00 PM.',
          status: 'PUBLISHED' as const,
          visibility: 'PUBLIC' as const,
        },
        {
          title: 'Parent-Teacher Association (PTA) General Meeting',
          content: 'The first term PTA meeting is scheduled for this Saturday at 11:00 AM in the assembly hall. Parents are requested to attend to review student progress and discuss infrastructure developments.',
          status: 'PUBLISHED' as const,
          visibility: 'PUBLIC' as const,
        },
        {
          title: 'Quarterly Assessment Examination Schedule Released',
          content: 'Quarterly examinations will commence from the 20th of next month. Timetables have been distributed to all class teachers and displayed on notice boards.',
          status: 'PUBLISHED' as const,
          visibility: 'PUBLIC' as const,
        },
      ],
      gallery: [
        { title: 'Modern Computer Lab', description: 'Students learning digital skills on desktop workstations.', category: 'INFRASTRUCTURE' as const, fileUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80', isPublic: true },
        { title: 'School Library', description: 'Students reading vernacular literature and scientific journals.', category: 'EDUCATIONAL' as const, fileUrl: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=800&auto=format&fit=crop&q=80', isPublic: true },
        { title: 'Annual Kho-Kho Match', description: 'Under-14 team in action during district championship.', category: 'SPORTS' as const, fileUrl: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800&auto=format&fit=crop&q=80', isPublic: true },
        { title: 'Science Exhibition Projects', description: 'Innovative working models exhibited by Grade 9 students.', category: 'ACTIVITIES' as const, fileUrl: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=800&auto=format&fit=crop&q=80', isPublic: true },
      ],
    },
    {
      slug: 'zp-school-wardha',
      name: 'ZP Model School, Wardha',
      tagline: 'Excellence in Basic Education with Gandhian Values',
      address: 'Sevagram Road, Wardha, Maharashtra 442001',
      contactPhone: '+91 7152 233400',
      contactEmail: 'wardha.zpschool@gmail.com',
      principalName: 'Mr. Rameshwar Patil (M.A., M.Ed.)',
      description: 'ZP Model School Wardha emphasizes experiential learning, value education, and comprehensive student welfare in the Vidarbha region.',
      establishedYear: 1985,
      isPublicEnabled: true,
      logoUrl: null,
      principalEmail: 'wardha.principal@eduvanta.org',
      principalPassword: 'Eduvanta@123',
      principalDisplayName: 'Rameshwar Patil',
      facilities: [
        { name: 'E-Library & Digital Centre', description: 'Connected digital library with 15 learning tablets.', icon: 'BookOpen' },
        { name: 'Organic Garden & Agro Lab', description: 'Student-run vegetable garden promoting hands-on biology.', icon: 'Leaf' },
        { name: 'Playground & Running Track', description: '200-meter standard track and basketball court.', icon: 'Trophy' },
      ],
      achievements: [
        { title: 'Vidarbha Division Science Award', description: 'Gold medal in Junior Science Fair at divisional level.', year: 2024 },
      ],
      events: [
        { title: 'Gandhi Jayanti Community Day', description: 'Cleanliness drive and community exhibition.', eventDate: new Date('2026-10-02T08:00:00Z'), isPublic: true },
      ],
      notices: [
        {
          title: 'Special Extra Classes for Board Candidates',
          content: 'Morning revision sessions for 10th standard will start from Monday 8:00 AM.',
          status: 'PUBLISHED' as const,
          visibility: 'PUBLIC' as const,
        },
      ],
      gallery: [],
    },
    {
      slug: 'zp-school-satara',
      name: 'ZP Chhatrapati High School, Satara',
      tagline: 'Building Strong Character, Physical Fitness and Leadership',
      address: 'Koregaon Road, Satara, Maharashtra 415001',
      contactPhone: '+91 2162 255100',
      contactEmail: 'satara.zp@eduvanta.org',
      principalName: 'Col. (Retd.) Vijay Chavan',
      description: 'Dedicated to disciplinary excellence, sports training, and academic readiness for students of the Western Ghats region.',
      establishedYear: 1992,
      isPublicEnabled: true,
      logoUrl: null,
      principalEmail: 'satara.principal@eduvanta.org',
      principalPassword: 'Eduvanta@123',
      principalDisplayName: 'Vijay Chavan',
      facilities: [
        { name: 'Gymnasium & Obstacle Course', description: 'Physical fitness and endurance training facility.', icon: 'Dumbbell' },
        { name: 'Audio-Visual Auditorium', description: 'Seating for 300 with high-definition projection.', icon: 'Tv' },
      ],
      achievements: [
        { title: 'District Sports Trophy', description: 'Overall champions in Satara District Inter-ZP Games.', year: 2024 },
      ],
      events: [
        { title: 'Shivaji Jayanti Traditional Celebrations', description: 'Martial arts demonstration and folk songs.', eventDate: new Date('2027-02-19T09:00:00Z'), isPublic: true },
      ],
      notices: [
        {
          title: 'Registration Open for NCC and Scouts',
          content: 'Students from Classes 7-9 can enroll for NCC Junior Division at the sports desk.',
          status: 'PUBLISHED' as const,
          visibility: 'PUBLIC' as const,
        },
      ],
      gallery: [],
    },
    {
      slug: 'zp-school-aurangabad',
      name: 'ZP Digital Campus, Aurangabad',
      tagline: 'Leading the Digital Revolution in Rural Education',
      address: 'Jalna Road, Cidco, Chhatrapati Sambhaji Nagar, Maharashtra 431003',
      contactPhone: '+91 240 2489000',
      contactEmail: 'aurangabad.digital@eduvanta.org',
      principalName: 'Dr. Anita Deshmukh (Ph.D.)',
      description: 'A model tech-enabled school equipped with coding clubs, robotic kits, and 100% digital curriculum delivery.',
      establishedYear: 2005,
      isPublicEnabled: true,
      logoUrl: null,
      principalEmail: 'aurangabad.principal@eduvanta.org',
      principalPassword: 'Eduvanta@123',
      principalDisplayName: 'Anita Deshmukh',
      facilities: [
        { name: 'Tinkering Robotics Lab', description: 'Arduino, sensors, and 3D printing equipment for young inventors.', icon: 'Cpu' },
        { name: 'High-Speed Fiber Internet', description: 'Campus-wide WiFi connectivity for interactive learning.', icon: 'Wifi' },
      ],
      achievements: [
        { title: 'State Innovation Hackathon Winner', description: 'First place for student project on automated crop irrigation.', year: 2025 },
      ],
      events: [
        { title: 'TechFest 2026', description: 'Showcase of mobile apps and robotics built by rural youth.', eventDate: new Date('2026-11-28T10:00:00Z'), isPublic: true },
      ],
      notices: [
        {
          title: 'Weekend Coding Bootcamp',
          content: 'Python and Scratch programming classes on Saturday mornings for classes 6 to 8.',
          status: 'PUBLISHED' as const,
          visibility: 'PUBLIC' as const,
        },
      ],
      gallery: [],
    },
    {
      slug: 'zp-school-nagpur',
      name: 'ZP Adarsh School, Nagpur',
      tagline: 'Nurturing Academic Distinction and Artistic Talents',
      address: 'Hingna Road, Nagpur, Maharashtra 440016',
      contactPhone: '+91 712 2884100',
      contactEmail: 'nagpur.adarsh@eduvanta.org',
      principalName: 'Mrs. Sunita Kulkarni (M.Sc., M.Ed.)',
      description: 'Focused on science streams, math competitions, classical music, and fine arts for rural scholars.',
      establishedYear: 1995,
      isPublicEnabled: true,
      logoUrl: null,
      principalEmail: 'nagpur.principal@eduvanta.org',
      principalPassword: 'Eduvanta@123',
      principalDisplayName: 'Sunita Kulkarni',
      facilities: [
        { name: 'Performing Arts Hall', description: 'Acoustic room equipped with harmonium, tabla, and sound equipment.', icon: 'Music' },
        { name: 'Mathematics Practical Lab', description: 'Geometric models, abacus tools, and logic puzzles.', icon: 'Calculator' },
      ],
      achievements: [
        { title: 'State Level Science Olympiad Gold', description: 'Grade 8 student topped Maharashtra Rural Science Olympiad.', year: 2024 },
      ],
      events: [
        { title: 'Inter-School Debate Championship', description: 'Debate tournament on environmental policies and renewable energy.', eventDate: new Date('2026-12-10T11:00:00Z'), isPublic: true },
      ],
      notices: [
        {
          title: 'Annual Arts & Craft Camp',
          content: 'Enrollments open for Warli painting and pottery workshop next week.',
          status: 'PUBLISHED' as const,
          visibility: 'PUBLIC' as const,
        },
      ],
      gallery: [],
    },
    {
      slug: 'zp-school-pune',
      name: 'ZP Central High School, Pune',
      tagline: 'Holistic Education Bridging Rural Wisdom and Modern Technology',
      address: 'Baramati Highway, Saswad, Pune, Maharashtra 412301',
      contactPhone: '+91 2115 222800',
      contactEmail: 'pune.central@eduvanta.org',
      principalName: 'Mr. Arvind Joshi (M.A., B.Ed.)',
      description: 'One of the largest ZP high schools in Pune district, known for sports coaching, scholarship results, and community partnerships.',
      establishedYear: 1980,
      isPublicEnabled: true,
      logoUrl: null,
      principalEmail: 'pune.principal@eduvanta.org',
      principalPassword: 'Eduvanta@123',
      principalDisplayName: 'Arvind Joshi',
      facilities: [
        { name: 'Full-Sized Football Ground', description: 'Lush green athletic stadium with spectator seating.', icon: 'Trophy' },
        { name: 'Science Activity Park', description: 'Outdoor interactive science installations demonstrating physical laws.', icon: 'Sun' },
      ],
      achievements: [
        { title: 'Best Zilla Parishad School Award', description: 'Awarded by Maharashtra Department of School Education.', year: 2024 },
      ],
      events: [
        { title: 'Pani Foundation Water Awareness Day', description: 'Demonstration of watershed management and tree planting.', eventDate: new Date('2026-11-20T08:30:00Z'), isPublic: true },
      ],
      notices: [
        {
          title: 'Tree Plantation Drive on Saturday',
          content: 'All students are invited to plant 500 saplings across the school perimeter.',
          status: 'PUBLISHED' as const,
          visibility: 'PUBLIC' as const,
        },
      ],
      gallery: [],
    },
  ];

  for (const sData of schoolsData) {
    console.log(`Processing school: ${sData.name} (${sData.slug})...`);

    // 2. Upsert school
    const school = await prisma.school.upsert({
      where: { slug: sData.slug },
      update: {
        name: sData.name,
        tagline: sData.tagline,
        address: sData.address,
        contactPhone: sData.contactPhone,
        contactEmail: sData.contactEmail,
        principalName: sData.principalName,
        description: sData.description,
        establishedYear: sData.establishedYear,
        isPublicEnabled: sData.isPublicEnabled,
        logoUrl: sData.logoUrl,
      },
      create: {
        slug: sData.slug,
        name: sData.name,
        tagline: sData.tagline,
        address: sData.address,
        contactPhone: sData.contactPhone,
        contactEmail: sData.contactEmail,
        principalName: sData.principalName,
        description: sData.description,
        establishedYear: sData.establishedYear,
        isPublicEnabled: sData.isPublicEnabled,
        logoUrl: sData.logoUrl,
      },
    });

    // 3. Upsert principal user
    const principalPasswordHash = await bcrypt.hash(sData.principalPassword, 10);
    const principal = await prisma.user.upsert({
      where: { email: sData.principalEmail },
      update: {
        name: sData.principalDisplayName,
        schoolId: school.id,
        role: 'PRINCIPAL',
        isActive: true,
      },
      create: {
        email: sData.principalEmail,
        name: sData.principalDisplayName,
        passwordHash: principalPasswordHash,
        role: 'PRINCIPAL',
        schoolId: school.id,
        isActive: true,
      },
    });

    // 4. Create sample classes and students if none exist
    let cls5 = await prisma.class.findFirst({
      where: { schoolId: school.id, name: 'Class 5', division: 'A' },
    });
    if (!cls5) {
      cls5 = await prisma.class.create({
        data: {
          schoolId: school.id,
          name: 'Class 5',
          division: 'A',
          academicYear: '2026-2027',
        },
      });
    }

    let cls10 = await prisma.class.findFirst({
      where: { schoolId: school.id, name: 'Class 10', division: 'A' },
    });
    if (!cls10) {
      cls10 = await prisma.class.create({
        data: {
          schoolId: school.id,
          name: 'Class 10',
          division: 'A',
          academicYear: '2026-2027',
        },
      });
    }

    // Create a sample teacher
    const teacherEmail = `teacher.${sData.slug}@eduvanta.org`;
    let teacherUser = await prisma.user.findUnique({ where: { email: teacherEmail } });
    if (!teacherUser) {
      teacherUser = await prisma.user.create({
        data: {
          email: teacherEmail,
          name: 'Prakash Kadam',
          passwordHash: await bcrypt.hash('Eduvanta@123', 10),
          role: 'TEACHER',
          schoolId: school.id,
          isActive: true,
        },
      });
      await prisma.teacher.create({
        data: {
          schoolId: school.id,
          userId: teacherUser.id,
          employeeId: `TCH-${school.slug.slice(0, 3).toUpperCase()}-01`,
          firstName: 'Prakash',
          lastName: 'Kadam',
          qualification: 'M.Sc., B.Ed. (Mathematics)',
        },
      });
    }

    // Create sample students if none exist
    const studentCount = await prisma.student.count({ where: { schoolId: school.id } });
    if (studentCount === 0) {
      const sampleStudents = [
        { admissionNumber: `ADM-${school.slug.slice(0, 3).toUpperCase()}-001`, firstName: 'Aarav', lastName: 'Jadhav', gender: 'MALE' as const, classId: cls5.id },
        { admissionNumber: `ADM-${school.slug.slice(0, 3).toUpperCase()}-002`, firstName: 'Ananya', lastName: 'Shinde', gender: 'FEMALE' as const, classId: cls5.id },
        { admissionNumber: `ADM-${school.slug.slice(0, 3).toUpperCase()}-003`, firstName: 'Rohan', lastName: 'Deshmukh', gender: 'MALE' as const, classId: cls10.id },
        { admissionNumber: `ADM-${school.slug.slice(0, 3).toUpperCase()}-004`, firstName: 'Pooja', lastName: 'Pawar', gender: 'FEMALE' as const, classId: cls10.id },
      ];

      for (const st of sampleStudents) {
        await prisma.student.create({
          data: {
            schoolId: school.id,
            admissionNumber: st.admissionNumber,
            firstName: st.firstName,
            lastName: st.lastName,
            gender: st.gender,
            classId: st.classId,
            academicYear: '2026-2027',
            dateOfBirth: new Date('2012-05-15'),
            guardianName: `Mr. ${st.lastName}`,
            guardianPhone: '+91 9876543210',
          },
        });
      }
    }

    // 5. Seed Facilities
    for (const fac of sData.facilities) {
      const existing = await prisma.schoolFacility.findFirst({
        where: { schoolId: school.id, name: fac.name },
      });
      if (!existing) {
        await prisma.schoolFacility.create({
          data: {
            schoolId: school.id,
            name: fac.name,
            description: fac.description,
            icon: fac.icon,
          },
        });
      }
    }

    // 6. Seed Achievements
    for (const ach of sData.achievements) {
      const existing = await prisma.schoolAchievement.findFirst({
        where: { schoolId: school.id, title: ach.title },
      });
      if (!existing) {
        await prisma.schoolAchievement.create({
          data: {
            schoolId: school.id,
            title: ach.title,
            description: ach.description,
            year: ach.year,
          },
        });
      }
    }

    // 7. Seed Events
    for (const ev of sData.events) {
      const existing = await prisma.schoolEvent.findFirst({
        where: { schoolId: school.id, title: ev.title },
      });
      if (!existing) {
        await prisma.schoolEvent.create({
          data: {
            schoolId: school.id,
            title: ev.title,
            description: ev.description,
            eventDate: ev.eventDate,
            isPublic: ev.isPublic,
          },
        });
      }
    }

    // 8. Seed Notices
    for (const n of sData.notices) {
      const existing = await prisma.notice.findFirst({
        where: { schoolId: school.id, title: n.title },
      });
      if (!existing) {
        await prisma.notice.create({
          data: {
            schoolId: school.id,
            title: n.title,
            content: n.content,
            status: n.status,
            visibility: n.visibility,
            targetAudience: 'ALL',
            createdByUserId: principal.id,
            publishedAt: new Date(),
          },
        });
      }
    }

    // 9. Seed Gallery Items
    for (const g of sData.gallery) {
      const existing = await prisma.galleryItem.findFirst({
        where: { schoolId: school.id, title: g.title },
      });
      if (!existing) {
        await prisma.galleryItem.create({
          data: {
            schoolId: school.id,
            title: g.title,
            description: g.description,
            category: g.category,
            fileUrl: g.fileUrl,
            isPublic: g.isPublic,
            uploadedByUserId: principal.id,
          },
        });
      }
    }

    console.log(`✅ Seeded ${sData.name}`);
  }

  // 10. Ensure LoginPage demo credentials exist so demo buttons work immediately
  const ellora = await prisma.school.findUnique({ where: { slug: 'ellora-highschool' } });
  if (ellora) {
    await prisma.user.upsert({
      where: { email: 'admin@zperp.in' },
      update: {},
      create: {
        email: 'admin@zperp.in',
        name: 'Demo Super Admin',
        passwordHash: await bcrypt.hash('Admin@123456', 10),
        role: 'SUPER_ADMIN',
        isActive: true,
      },
    });

    await prisma.user.upsert({
      where: { email: 'principal@zpschool1.in' },
      update: { schoolId: ellora.id },
      create: {
        email: 'principal@zpschool1.in',
        name: 'Sangita Shinde',
        passwordHash: await bcrypt.hash('Principal@123', 10),
        role: 'PRINCIPAL',
        schoolId: ellora.id,
        isActive: true,
      },
    });

    const teacherDemo = await prisma.user.upsert({
      where: { email: 'teacher@zpschool1.in' },
      update: { schoolId: ellora.id },
      create: {
        email: 'teacher@zpschool1.in',
        name: 'Prakash Kadam',
        passwordHash: await bcrypt.hash('Teacher@123', 10),
        role: 'TEACHER',
        schoolId: ellora.id,
        isActive: true,
      },
    });

    const existingTeacher = await prisma.teacher.findUnique({ where: { userId: teacherDemo.id } });
    if (!existingTeacher) {
      await prisma.teacher.create({
        data: {
          schoolId: ellora.id,
          userId: teacherDemo.id,
          employeeId: 'TCH-DEMO-01',
          firstName: 'Prakash',
          lastName: 'Kadam',
          qualification: 'M.Sc., B.Ed.',
        },
      });
    }

    const studentDemo = await prisma.user.upsert({
      where: { email: 'student@zpschool1.in' },
      update: { schoolId: ellora.id },
      create: {
        email: 'student@zpschool1.in',
        name: 'Aarav Jadhav',
        passwordHash: await bcrypt.hash('Student@123', 10),
        role: 'STUDENT',
        schoolId: ellora.id,
        isActive: true,
      },
    });

    const existingStudent = await prisma.student.findUnique({ where: { userId: studentDemo.id } });
    if (!existingStudent) {
      const cls = await prisma.class.findFirst({ where: { schoolId: ellora.id } });
      await prisma.student.create({
        data: {
          schoolId: ellora.id,
          userId: studentDemo.id,
          admissionNumber: 'ADM-DEMO-001',
          firstName: 'Aarav',
          lastName: 'Jadhav',
          gender: 'MALE',
          classId: cls?.id,
          academicYear: '2026-2027',
        },
      });
    }
    console.log('✅ LoginPage demo accounts seeded.');
  }

  console.log('\n🎉 Comprehensive database seeding finished successfully!');
  console.log('Credentials:');
  console.log('  SUPER_ADMIN: admin@zpschoolerp.com / Admin@1234');
  console.log('  ELLORA HIGHSCHOOL Principal: shinde@gmail.com / Eduvanta@123');
  console.log('  Other schools: wardha.principal@eduvanta.org, satara.principal@eduvanta.org, etc. (Pwd: Eduvanta@123)');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
