import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding Hindustan Projects Empanelment initial data...");

  // 1. Seed Active Tenders
  const existingTenders = await prisma.empanelmentTender.count();
  if (existingTenders === 0) {
    const tenders = [
      {
        tenderNo: "HP-TND-2026-01",
        title: "RCC Foundation & Superstructure Works - Bhilwara Industrial Phase-II",
        category: "Civil Construction",
        location: "Bhilwara Textile Park, Rajasthan",
        estimatedBudget: "₹ 1,85,00,000",
        emdAmount: "₹ 1,85,000",
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        status: "ACTIVE",
        scopeOfWork:
          "Earthwork excavation, RCC footings (M30 grade), columns, tie beams, and plinth masonry across 45,000 sq.ft industrial shed. Contractor must deploy mechanized batching plant and bar bending machinery on site.",
      },
      {
        tenderNo: "HP-TND-2026-02",
        title: "Pre-Engineered Building (PEB) Structural Steel Fabrication & Erection",
        category: "Structural Steel / PEB",
        location: "Hamirgarh Industrial Zone, Bhilwara",
        estimatedBudget: "₹ 3,40,00,000",
        emdAmount: "₹ 3,40,000",
        dueDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
        status: "ACTIVE",
        scopeOfWork:
          "Supply, fabrication, sand blasting, epoxy painting, and site erection of 380 MT high-tensile steel rafters, purlins, and color coated roofing sheets (0.50mm BMT). EOT crane runway beam alignment included.",
      },
      {
        tenderNo: "HP-TND-2026-03",
        title: "Bulk Supply of Ready Mix Concrete (RMC M25/M35) & 53 Grade OPC Cement",
        category: "Material Suppliers",
        location: "Bhilwara Bypass Project Site",
        estimatedBudget: "₹ 85,00,000",
        emdAmount: "₹ 85,000",
        dueDate: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000),
        status: "ACTIVE",
        scopeOfWork:
          "Daily supply of 45-60 cu.m transit mixer batches with slump test certificates and cube test compliance reports. Consistent supply rate guaranteed under peak pour schedules.",
      },
    ];

    for (const t of tenders) {
      await prisma.empanelmentTender.create({ data: t });
    }
    console.log(`Created ${tenders.length} initial active tenders.`);
  } else {
    console.log(`Tenders already exist (${existingTenders} found). Skipping.`);
  }

  // 2. Seed Sample Empanelled Partners
  const existingVendors = await prisma.vendorApplication.count();
  if (existingVendors === 0) {
    const v1 = await prisma.vendorApplication.create({
      data: {
        trackingId: "HP-EMP-108201",
        status: "APPROVED",
        currentStage: "Empanelled Partner — Active",
        tier: "CLASS_A",
        category: "Civil Construction",
        primaryRole: "Prime Civil Contractor",
        specialization: "Heavy RCC Foundations, Industrial Flooring & Trimix",
        teamSize: "50-100",
        companyName: "Marwar Infra & Builders Pvt Ltd",
        entityType: "PRIVATE_LIMITED",
        establishmentYear: "2014",
        ownerName: "Rajendra Choudhary",
        contactName: "Rajendra Choudhary",
        designation: "Managing Director",
        email: "contact@marwarinfra.example.com",
        phone: "+91 98290 12345",
        address: "Plot 42, Riico Industrial Area, Bhilwara, Rajasthan",
        city: "Bhilwara",
        state: "Rajasthan",
        pincode: "311001",
        gstin: "08AABCM1234D1Z8",
        pan: "AABCM1234D",
        isGstVerified: true,
        eligibilityScore: 92,
        ceoSigned: true,
        ceoSignedDate: new Date(),
        approvedAt: new Date(),
        adminRemarks: "Excellent past track record on industrial sheds. Statutory compliance audited.",
      },
    });

    // Sample Gate Pass for v1
    await prisma.siteGatePass.create({
      data: {
        passCode: "HP-GP-94812",
        vendorId: v1.id,
        visitorName: "Mukesh Sharma (Site Incharge)",
        workerCount: 14,
        vehicleNo: "RJ-06-GB-4592",
        siteLocation: "Bhilwara Textile Park - Gate 03",
        validTill: new Date(Date.now() + 20 * 60 * 60 * 1000), // ~20 hrs
        status: "ACTIVE",
      },
    });

    console.log("Created sample empanelled partner with active site gate pass.");
  } else {
    console.log(`Vendor applications already exist (${existingVendors} found). Skipping.`);
  }

  console.log("Empanelment seeding finished successfully.");
}

main()
  .catch((e) => {
    console.error("Error during empanelment seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
