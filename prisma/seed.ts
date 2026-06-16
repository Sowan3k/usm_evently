import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// Build a date relative to today so the demo always has realistic
// "upcoming" and "past" events regardless of when it is run.
function daysFromNow(days: number): Date {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(0, 0, 0, 0);
  return d;
}

async function main() {
  console.log("Seeding database...");

  const adminPassword = await bcrypt.hash("admin123", 10);
  const studentPassword = await bcrypt.hash("student123", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@usm.my" },
    update: {},
    create: {
      name: "USM Admin",
      email: "admin@usm.my",
      passwordHash: adminPassword,
      role: "ADMIN",
      phone: "+60 4-653 3888",
      identityType: "IC",
      identityNumber: "850204-07-5231",
    },
  });

  const student = await prisma.user.upsert({
    where: { email: "noormohammadsowan@student.usm.my" },
    update: {},
    create: {
      name: "Noor Mohammad Sowan",
      email: "noormohammadsowan@student.usm.my",
      passwordHash: studentPassword,
      role: "STUDENT",
      phone: "+60145202958",
      myCSDPoints: 168,
      identityType: "MATRIC",
      identityNumber: "164213",
    },
  });

  // Wipe events so seeding is idempotent and re-runnable during development.
  await prisma.event.deleteMany();

  const upcoming = await Promise.all([
    prisma.event.create({
      data: {
        title: "Orientation 2026",
        campus: "Main Campus (Minden, Penang)",
        school: "Other / Inter-school",
        organizer: "USM Student Affairs & Development Division",
        openToPublic: false,
        dressCode: "Smart casual; covered shoes required",
        culturalNotes:
          "Modest attire is appreciated. Please switch phones to silent during briefings.",
        emergencyContact: "+60 4-653 5000",
        description:
          "Welcome to USM! Join the official orientation programme to meet faculty, tour the campus, and connect with fellow new students. A full day of activities, ice-breakers, and essential briefings to kick-start your university journey.",
        date: daysFromNow(14),
        startTime: "09:00 AM",
        endTime: "04:00 PM",
        location: "USM Main Hall, Penang",
        imageUrl: "/event1.jpg",
        category: "Orientation",
        capacity: 500,
        price: 0,
        csdPoints: 5,
      },
    }),
    prisma.event.create({
      data: {
        title: "USM Open Day",
        campus: "Engineering Campus (Nibong Tebal)",
        school: "Other / Inter-school",
        organizer: "USM Corporate & Sustainable Development Division",
        openToPublic: true,
        dressCode: "Casual",
        emergencyContact: "+60 4-599 5000",
        description:
          "Explore everything USM has to offer. Visit faculty booths, research showcases, student clubs, and sports facilities. Open to prospective students, parents, and the public.",
        date: daysFromNow(21),
        startTime: "10:00 AM",
        endTime: "05:00 PM",
        location: "USM Engineering Campus, Nibong Tebal",
        imageUrl: "/event2.jpg",
        category: "Exhibition",
        capacity: 1000,
        price: 0,
        csdPoints: 3,
      },
    }),
    prisma.event.create({
      data: {
        title: "Career Fair 2026",
        campus: "Main Campus (Minden, Penang)",
        school: "School of Management",
        organizer: "USM Career & Counselling Unit",
        openToPublic: true,
        dressCode: "Formal / business attire",
        culturalNotes:
          "Bring printed copies of your resume. Booth queues are first-come, first-served.",
        emergencyContact: "+60 4-653 4444",
        description:
          "Meet top employers and recruiters from across Malaysia. Bring your resume, attend on-the-spot interviews, and join career-readiness workshops. A premium event with a registration fee that includes lunch and a workshop pass.",
        date: daysFromNow(35),
        startTime: "09:00 AM",
        endTime: "06:00 PM",
        location: "Dewan Tuanku Syed Putra, USM",
        imageUrl: "/event3.jpg",
        category: "Career",
        capacity: 300,
        price: 25,
        csdPoints: 8,
      },
    }),
    prisma.event.create({
      data: {
        title: "Tech Society Hackathon",
        campus: "Main Campus (Minden, Penang)",
        school: "School of Computer Sciences",
        organizer: "USM Tech Society",
        openToPublic: false,
        dressCode: "Casual",
        emergencyContact: "+60 12-345 6789",
        description:
          "A 24-hour student hackathon with mentors, prizes, and free meals. The RM 15 fee covers food and a T-shirt and is paid directly to the organising club, with no platform checkout.",
        date: daysFromNow(28),
        startTime: "09:00 AM",
        endTime: "09:00 AM (+1 day)",
        location: "School of Computer Sciences, USM",
        imageUrl: "/event1.jpg",
        category: "Tech",
        capacity: 120,
        price: 15,
        csdPoints: 10,
        // Organizer-provided payment instead of the platform checkout.
        useExternalPayment: true,
        bankName: "Maybank",
        bankAccountName: "USM Tech Society",
        bankAccountNumber: "5641 2233 4455",
        tngNumber: "+60 12-345 6789",
        paymentInstructions:
          "Bank in or Touch 'n Go the RM 15 fee, then send your receipt to the organiser on WhatsApp to confirm your slot.",
      },
    }),
  ]);

  const past = await Promise.all([
    prisma.event.create({
      data: {
        title: "Convocation 2022",
        campus: "Main Campus (Minden, Penang)",
        school: "Other / Inter-school",
        organizer: "USM Academic Management Division",
        openToPublic: true,
        dressCode: "Formal; graduation robes for graduands",
        emergencyContact: "+60 4-653 3888",
        description:
          "USM's annual convocation ceremony celebrating the achievements of graduating students across all faculties. A proud milestone for graduates and their families.",
        date: daysFromNow(-540),
        startTime: "08:00 AM",
        endTime: "01:00 PM",
        location: "Dewan Tuanku Syed Putra, USM",
        imageUrl: "/past1.jpg",
        category: "Ceremony",
        csdPoints: 0,
      },
    }),
    prisma.event.create({
      data: {
        title: "Sports Day 2023",
        campus: "Main Campus (Minden, Penang)",
        school: "Other / Inter-school",
        organizer: "USM Sports & Recreation Centre",
        openToPublic: false,
        dressCode: "Sports attire",
        emergencyContact: "+60 4-653 3777",
        description:
          "A day of friendly inter-faculty competition featuring track and field, futsal, and team games. Cheer on your faculty and earn CSD points for participation.",
        date: daysFromNow(-380),
        startTime: "07:00 AM",
        endTime: "05:00 PM",
        location: "USM Sports Complex",
        imageUrl: "/past2.jpg",
        category: "Sports",
        csdPoints: 6,
      },
    }),
    prisma.event.create({
      data: {
        title: "Science Expo",
        campus: "Main Campus (Minden, Penang)",
        school: "School of Physics",
        organizer: "USM School of Physics",
        openToPublic: true,
        dressCode: "Smart casual",
        emergencyContact: "+60 4-653 3650",
        description:
          "A showcase of student and faculty research, innovation projects, and interactive STEM demonstrations. Highlighting the best of USM's scientific community.",
        date: daysFromNow(-200),
        startTime: "10:00 AM",
        endTime: "04:00 PM",
        location: "School of Physics, USM",
        imageUrl: "/past3.jpg",
        category: "Exhibition",
        csdPoints: 4,
      },
    }),
  ]);

  // An approved organizer (for the organizer self-service demo) plus a
  // pending event they submitted, so the admin moderation queue has content.
  const organizerPassword = await bcrypt.hash("organizer123", 10);
  const organizer = await prisma.user.upsert({
    where: { email: "limwei@student.usm.my" },
    update: {},
    create: {
      name: "Lim Wei",
      email: "limwei@student.usm.my",
      passwordHash: organizerPassword,
      role: "STUDENT",
      identityType: "MATRIC",
      identityNumber: "158002",
      organizerStatus: "APPROVED",
      organization: "USM Photography Club",
    },
  });

  await prisma.event.create({
    data: {
      title: "Campus Photowalk & Workshop",
      campus: "Main Campus (Minden, Penang)",
      school: "Other / Inter-school",
      organizer: "USM Photography Club",
      submittedById: organizer.id,
      status: "PENDING", // awaiting admin approval
      openToPublic: true,
      dressCode: "Casual",
      emergencyContact: "+60 16-777 8899",
      description:
        "A guided photowalk around the Minden campus followed by a basics-of-composition workshop. Bring any camera or phone. Beginners welcome!",
      date: daysFromNow(18),
      startTime: "04:00 PM",
      endTime: "07:00 PM",
      location: "USM Main Campus entrance",
      imageUrl: "/event2.jpg",
      category: "Workshop",
      capacity: 40,
      price: 0,
      csdPoints: 3,
    },
  });

  // A user with a pending organizer request, so the admin sees a request to review.
  await prisma.user.upsert({
    where: { email: "aisyah@student.usm.my" },
    update: {},
    create: {
      name: "Aisyah Rahman",
      email: "aisyah@student.usm.my",
      passwordHash: organizerPassword,
      role: "STUDENT",
      identityType: "MATRIC",
      identityNumber: "162940",
      organizerStatus: "PENDING",
      organization: "USM Debate Society",
      organizerNote:
        "We'd like to run monthly debate nights and an inter-varsity tournament.",
    },
  });

  // Give the demo student a richer history (for tickets, profile & analytics):
  // registrations spread across recent months, some already attended.
  const regPlan: { event: { id: string }; daysAgo: number; attended: boolean }[] = [
    { event: past[0], daysAgo: 150, attended: true }, // Convocation
    { event: past[1], daysAgo: 95, attended: true }, // Sports Day
    { event: past[2], daysAgo: 60, attended: true }, // Science Expo
    { event: upcoming[0], daysAgo: 25, attended: false }, // Orientation
    { event: upcoming[1], daysAgo: 12, attended: false }, // Open Day
    { event: upcoming[2], daysAgo: 4, attended: false }, // Career Fair
  ];
  for (const r of regPlan) {
    const createdAt = daysFromNow(-r.daysAgo);
    await prisma.registration.create({
      data: {
        userId: student.id,
        eventId: r.event.id,
        status: r.attended ? "ATTENDED" : "REGISTERED",
        attendedAt: r.attended ? createdAt : null,
        createdAt,
      },
    });
  }

  // A couple of completed payments so the revenue chart has data.
  await prisma.payment.create({
    data: {
      userId: student.id,
      eventId: upcoming[2].id, // Career Fair (RM 25)
      amount: 25,
      description: "Career Fair 2026 Ticket",
      status: "COMPLETED",
      createdAt: daysFromNow(-4),
    },
  });
  await prisma.payment.create({
    data: {
      userId: organizer.id,
      eventId: upcoming[2].id,
      amount: 25,
      description: "Career Fair 2026 Ticket",
      status: "COMPLETED",
      createdAt: daysFromNow(-30),
    },
  });

  console.log(
    `Seeded: admin=${admin.email}, organizer=${organizer.email}, student=${student.email}`
  );
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
