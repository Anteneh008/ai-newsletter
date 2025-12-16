/**
 * Manual MongoDB schema initialization script
 * Works around Prisma query engine TLS issues on Windows
 */
const { MongoClient } = require("mongodb");
require("dotenv").config();

async function initializeDatabase() {
  const uri = process.env.DATABASE_URL;
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log("✅ Connected to MongoDB Atlas");

    const db = client.db();

    // Create collections with validation (mimics Prisma schema)
    const collections = await db.listCollections().toArray();
    const existingNames = collections.map((c) => c.name);

    // User collection
    if (!existingNames.includes("User")) {
      await db.createCollection("User");
      await db
        .collection("User")
        .createIndex({ clerkUserId: 1 }, { unique: true });
      console.log("✅ Created User collection with indexes");
    }

    // UserSettings collection
    if (!existingNames.includes("UserSettings")) {
      await db.createCollection("UserSettings");
      await db
        .collection("UserSettings")
        .createIndex({ userId: 1 }, { unique: true });
      console.log("✅ Created UserSettings collection with indexes");
    }

    // RssFeed collection
    if (!existingNames.includes("RssFeed")) {
      await db.createCollection("RssFeed");
      await db
        .collection("RssFeed")
        .createIndex({ userId: 1, url: 1 }, { unique: true });
      await db.collection("RssFeed").createIndex({ userId: 1 });
      console.log("✅ Created RssFeed collection with indexes");
    }

    // RssArticle collection
    if (!existingNames.includes("RssArticle")) {
      await db.createCollection("RssArticle");
      await db
        .collection("RssArticle")
        .createIndex({ guid: 1 }, { unique: true });
      await db.collection("RssArticle").createIndex({ feedId: 1 });
      await db.collection("RssArticle").createIndex({ pubDate: 1 });
      await db.collection("RssArticle").createIndex({ feedId: 1, pubDate: 1 });
      await db.collection("RssArticle").createIndex({ sourceFeedIds: 1 });
      console.log("✅ Created RssArticle collection with indexes");
    }

    // Newsletter collection
    if (!existingNames.includes("Newsletter")) {
      await db.createCollection("Newsletter");
      await db.collection("Newsletter").createIndex({ userId: 1 });
      await db
        .collection("Newsletter")
        .createIndex({ userId: 1, createdAt: 1 });
      await db.collection("Newsletter").createIndex({ createdAt: 1 });
      console.log("✅ Created Newsletter collection with indexes");
    }

    console.log("\n🎉 Database schema initialized successfully!");
    console.log("\nNext steps:");
    console.log("  1. Run: pnpm run prisma:generate");
    console.log("  2. Start your app: pnpm run dev");

    await client.close();
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

initializeDatabase();
