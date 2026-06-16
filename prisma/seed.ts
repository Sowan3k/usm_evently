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
    },
  });

  // Wipe events so seeding is idempotent and re-runnable during development.
  await prisma.event.deleteMany();

  const upcoming = await Promise.all([
    prisma.event.create({
      data: {
        title: "Orientation 2026",
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
  ]);

  await Promise.all([
    prisma.event.create({
      data: {
        title: "Convocation 2022",
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

  // Give the demo student a registration history so the profile page has
  // real data to display.
  await prisma.registration.create({
    data: {
      userId: student.id,
      eventId: upcoming[0].id,
      status: "REGISTERED",
    },
  });

  console.log(
    `Seeded: admin=${admin.email}, student=${student.email}, events=${upcoming.length + 3}`
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
