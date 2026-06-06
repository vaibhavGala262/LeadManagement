import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg(process.env.DATABASE_URL!);
const prisma = new PrismaClient({ adapter });

const leadData = [
  { name: "Sarah Johnson", email: "sarah@techstart.io", phone: "+1 (555) 123-4567", company: "TechStart Inc.", status: "NEW" as const, notes: "CEO of a Series A startup looking for enterprise solution." },
  { name: "Michael Chen", email: "mchen@datacore.com", phone: "+1 (555) 234-5678", company: "DataCore Systems", status: "CONTACTED" as const, notes: "Interested in our API integration. Follow up next week." },
  { name: "Emily Rodriguez", email: "emily@greenleaf.org", phone: "+1 (555) 345-6789", company: "GreenLeaf Org", status: "QUALIFIED" as const, notes: "Non-profit with strong budget. Needs custom pricing." },
  { name: "James Wilson", email: "jwilson@buildco.com", phone: "+1 (555) 456-7890", company: "BuildCo Construction", status: "CONVERTED" as const, notes: "Signed contract for annual plan." },
  { name: "Amanda Foster", email: "afoster@nexuslabs.com", phone: "+1 (555) 567-8901", company: "Nexus Labs", status: "LOST" as const, notes: "Chose competitor due to feature gap." },
  { name: "David Park", email: "dpark@quantum.dev", phone: "+1 (555) 678-9012", company: "Quantum Dev", status: "NEW" as const, notes: "Found us through referral. Very interested." },
  { name: "Lisa Thompson", email: "lisa@bluewave.co", phone: "+1 (555) 789-0123", company: "BlueWave Media", status: "CONTACTED" as const, notes: "Marketing agency looking for team plan." },
  { name: "Robert Kim", email: "rkim@aegis.ai", phone: "+1 (555) 890-1234", company: "Aegis AI", status: "QUALIFIED" as const, notes: "Technical evaluation completed. Ready for pricing." },
  { name: "Jennifer Martinez", email: "jmartinez@solenergy.com", phone: "+1 (555) 901-2345", company: "SolEnergy", status: "CONVERTED" as const, notes: "Annual contract signed. Implementation scheduled." },
  { name: "Christopher Lee", email: "clee@finwise.io", phone: "+1 (555) 012-3456", company: "FinWise IO", status: "LOST" as const, notes: "Decided to build in-house solution." },
  { name: "Rachel Green", email: "rachel@urbanpeak.com", phone: "+1 (555) 111-2222", company: "UrbanPeak Realty", status: "NEW" as const, notes: "Real estate agency with 50 agents." },
  { name: "Thomas Anderson", email: "tom@matrixlabs.dev", phone: "+1 (555) 222-3333", company: "Matrix Labs", status: "CONTACTED" as const, notes: "Interested in our developer API." },
  { name: "Nina Patel", email: "nina@healthbridge.org", phone: "+1 (555) 333-4444", company: "HealthBridge", status: "QUALIFIED" as const, notes: "Healthcare provider. Compliance questions answered." },
  { name: "Kevin O'Brien", email: "kobrien@logistix.io", phone: "+1 (555) 444-5555", company: "LogistiX", status: "CONVERTED" as const, notes: "Logistics company. Paid annually." },
  { name: "Megan Walsh", email: "mwalsh@brightmedia.com", phone: "+1 (555) 555-6666", company: "BrightMedia", status: "LOST" as const, notes: "Budget constraints. Will revisit next quarter." },
  { name: "Alex Turner", email: "aturner@codeforge.dev", phone: "+1 (555) 666-7777", company: "CodeForge", status: "NEW" as const, notes: "Small team, looking for startup plan." },
  { name: "Sophie Martin", email: "sophie@vividlabs.io", phone: "+1 (555) 777-8888", company: "Vivid Labs", status: "CONTACTED" as const, notes: "Design studio with 20+ team members." },
  { name: "Daniel Brown", email: "daniel@securegate.com", phone: "+1 (555) 888-9999", company: "SecureGate", status: "QUALIFIED" as const, notes: "Cybersecurity company. Security audit approved." },
  { name: "Olivia Garcia", email: "olivia@nextgenedu.org", phone: "+1 (555) 999-0000", company: "NextGen Edu", status: "CONVERTED" as const, notes: "Educational institution. Received special pricing." },
  { name: "William Taylor", email: "wtaylor@primevault.io", phone: "+1 (555) 000-1111", company: "PrimeVault", status: "NEW" as const, notes: "Fintech startup. Compliance review pending." },
];

async function main() {
  console.log("Seeding database...");

  for (const lead of leadData) {
    await prisma.lead.create({
      data: {
        ...lead,
        phone: lead.phone || null,
        company: lead.company || null,
        notes: lead.notes || null,
      },
    });
  }

  console.log(`Seeded ${leadData.length} leads successfully.`);
}

main()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
