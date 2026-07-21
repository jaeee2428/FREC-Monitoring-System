const { PrismaPg } = require("@prisma/adapter-pg");
const { PrismaClient } = require("@prisma/client");

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL || "postgresql://certtrack_admin:certtrack_pass@localhost:5432/certtrack_dev",
});
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding database...");

  // Roles (matches ERD)
  const roles = [
    { id: 1, label: "Student" },
    { id: 2, label: "Adviser" },
    { id: 3, label: "Program Chair" },
    { id: 4, label: "Dean" },
    { id: 5, label: "Reviewer" },
    { id: 6, label: "IT Admin" },
    { id: 7, label: "FREC" },
  ];

  for (const r of roles) {
    await prisma.role.upsert({ where: { id: r.id }, update: {}, create: r });
  }
  console.log("  ✓ 7 roles seeded");

  // User accounts
  const users = [
    { id: "U001", name: "Maria Santos", email: "m.santos@university.edu.ph", role_id: 1, program: "BS Computer Science", whitelisted: true },
    { id: "U002", name: "Dr. Elena Reyes", email: "e.reyes@university.edu.ph", role_id: 2, program: null, whitelisted: true },
    { id: "U003", name: "Admin Dela Rosa", email: "it.admin@university.edu.ph", role_id: 6, program: null, whitelisted: true },
    { id: "U004", name: "Dr. Jose Santos", email: "j.santos@university.edu.ph", role_id: 3, program: null, whitelisted: true },
    { id: "U005", name: "Dr. Amalia Cruz", email: "a.cruz@university.edu.ph", role_id: 4, program: null, whitelisted: true },
    { id: "U006", name: "Prof. Ramon Dela Cruz", email: "r.delacruz@university.edu.ph", role_id: 5, program: null, whitelisted: true },
  ];

  for (const u of users) {
    await prisma.userAccount.upsert({ where: { email: u.email }, update: {}, create: u });
  }
  console.log("  ✓ 6 users seeded");

  // Documents
  const documents = [
    { id: "DOC-2024-001", title: "Thesis Certification Request", drive_link: "https://drive.google.com/file/d/1A2B3C4D5E6F/view", student_id: "U001", adviser_id: "U002", status: "FORWARDED-FREC", mode: 1, submitted_date: new Date("2024-06-01"), updated_date: new Date("2024-06-08"), remarks: null },
    { id: "DOC-2024-002", title: "Research Certification", drive_link: "https://drive.google.com/file/d/2B3C4D5E6F7G/view", student_id: "U001", adviser_id: "U002", status: "CERT GENERATED", mode: 2, submitted_date: new Date("2024-06-02"), updated_date: new Date("2024-06-10"), remarks: null },
    { id: "DOC-2024-003", title: "Project Endorsement", drive_link: "https://drive.google.com/file/d/3C4D5E6F7G8H/view", student_id: "U001", adviser_id: "U002", status: "FOR REVIEW", mode: 3, submitted_date: new Date("2024-06-03"), updated_date: new Date("2024-06-11"), remarks: null },
    { id: "DOC-2024-004", title: "Thesis Certification Request", drive_link: "https://drive.google.com/file/d/4D5E6F7G8H9I/view", student_id: "U001", adviser_id: "U002", status: "SUBMITTED", mode: null, submitted_date: new Date("2024-06-06"), updated_date: new Date("2024-06-06"), remarks: null },
    { id: "DOC-2024-005", title: "Research Certification", drive_link: "https://drive.google.com/file/d/5E6F7G8H9I0J/view", student_id: "U001", adviser_id: "U002", status: "DISAPPROVED", mode: 1, submitted_date: new Date("2024-06-04"), updated_date: new Date("2024-06-09"), remarks: "Missing signature on page 4." },
    { id: "DOC-2024-006", title: "Project Endorsement", drive_link: "https://drive.google.com/file/d/6F7G8H9I0J1K/view", student_id: "U001", adviser_id: "U002", status: "APPROVED", mode: 2, submitted_date: new Date("2024-06-05"), updated_date: new Date("2024-06-12"), remarks: null },
    { id: "DOC-2024-007", title: "Thesis Certification Request", drive_link: "https://drive.google.com/file/d/7G8H9I0J1K2L/view", student_id: "U001", adviser_id: "U002", status: "ADVISER APPROVED", mode: 1, submitted_date: new Date("2024-06-06"), updated_date: new Date("2024-06-09"), remarks: null },
    { id: "DOC-2024-008", title: "Research Certification", drive_link: "https://drive.google.com/file/d/8H9I0J1K2L3M/view", student_id: "U001", adviser_id: "U002", status: "DEAN ENDORSED", mode: 3, submitted_date: new Date("2024-06-07"), updated_date: new Date("2024-06-11"), remarks: null },
    { id: "DOC-2024-009", title: "AI Ethics Research Paper", drive_link: "https://drive.google.com/file/d/9I0J1K2L3M4N/view", student_id: "U001", adviser_id: "U002", status: "FORWARDED-FREC", mode: 2, submitted_date: new Date("2024-06-07"), updated_date: new Date("2024-06-08"), remarks: null },
    { id: "DOC-2024-010", title: "Network Security Assessment", drive_link: "https://drive.google.com/file/d/0J1K2L3M4N5O/view", student_id: "U001", adviser_id: "U002", status: "DISAPPROVED", mode: 1, submitted_date: new Date("2024-06-03"), updated_date: new Date("2024-06-09"), remarks: "Incomplete requirements." },
    { id: "DOC-2026-9021", title: "Optimizing ML Models on Low-Power Embedded Devices", drive_link: "https://drive.google.com/file/d/1K2L3M4N5O6P/view", student_id: "U001", adviser_id: "U002", status: "AWAITING_CHAIR_REVIEW", mode: 1, submitted_date: new Date("2026-07-12"), updated_date: new Date("2026-07-14"), remarks: null },
    { id: "DOC-2026-3342", title: "Local IoT Smart Irrigation System for Campus Grounds", drive_link: "https://drive.google.com/file/d/2L3M4N5O6P7Q/view", student_id: "U001", adviser_id: "U002", status: "AWAITING_CHAIR_REVIEW", mode: 2, submitted_date: new Date("2026-07-14"), updated_date: new Date("2026-07-15"), remarks: null },
    { id: "DOC-2026-5581", title: "Automated Microgrid Routing in Rural Communities", drive_link: "https://drive.google.com/file/d/3M4N5O6P7Q8R/view", student_id: "U001", adviser_id: "U002", status: "AWAITING_CHAIR_REVIEW", mode: 3, submitted_date: new Date("2026-07-15"), updated_date: new Date("2026-07-15"), remarks: null },
    { id: "DOC-2026-1023", title: "Deep Learning for Crop Disease Detection", drive_link: "https://drive.google.com/file/d/4N5O6P7Q8R9S/view", student_id: "U001", adviser_id: "U002", status: "DEAN ENDORSED", mode: 3, submitted_date: new Date("2026-07-10"), updated_date: new Date("2026-07-14"), remarks: null },
    { id: "DOC-2026-7741", title: "Barangay E-Governance Mobile Platform", drive_link: "https://drive.google.com/file/d/5O6P7Q8R9S0T/view", student_id: "U001", adviser_id: "U002", status: "FOR REVIEW", mode: 3, submitted_date: new Date("2026-07-08"), updated_date: new Date("2026-07-12"), remarks: null },
  ];

  for (const d of documents) {
    await prisma.document.upsert({ where: { id: d.id }, update: {}, create: d });
  }
  console.log(`  ✓ ${documents.length} documents seeded`);

  console.log("Seeding complete!");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
