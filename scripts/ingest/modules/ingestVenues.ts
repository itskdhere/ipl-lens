import { prisma } from "../../../src/lib/prisma";
import { IngestionContext } from "../utils/context";

export async function ingestVenues(ctx: IngestionContext): Promise<void> {
  console.log("\n4️⃣  Ingesting Venues...");
  for (const v of ctx.venueMap.values()) {
    await prisma.venues.upsert({
      where: { venue_id: v.venue_id },
      update: v,
      create: v,
    });
  }
  console.log(`   ✅ Ingested ${ctx.venueMap.size} venues.`);
}
