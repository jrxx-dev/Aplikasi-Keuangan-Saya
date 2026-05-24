
import { db } from "@/db";
import { categories } from "@/db/schema/finance";

async function main() {
    const cats = await db.select().from(categories);
    console.log("Categories:", JSON.stringify(cats, null, 2));
    process.exit(0);
}

main();
