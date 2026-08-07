const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seed() {
  const team = [
    { name: "Robert Harrison", role: "CEO & Founder", img: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=600&q=80", order: 1 },
    { name: "Sandra Miles", role: "Chief Engineer", img: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&q=80", order: 2 },
    { name: "James Carter", role: "Senior Site Director", img: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=600&q=80", order: 3 },
    { name: "Lisa Thompson", role: "Head of Architecture", img: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=600&q=80", order: 4 },
    { name: "Mark Davis", role: "Safety & Quality Director", img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=80", order: 5 },
    { name: "Angela Brown", role: "Client Relations Lead", img: "https://images.unsplash.com/photo-1598550874175-4d0ef436c909?w=600&q=80", order: 6 },
  ];

  for (const t of team) {
    await prisma.teamMember.create({ data: t });
  }
  console.log("Seeded team members");
}

seed().catch(console.error).finally(() => prisma.$disconnect());
