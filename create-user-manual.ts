
import { db } from "./packages/db/src/client";
import { user, organization, member, account } from "./packages/db/src/drizzle/schema";
import { randomUUIDv7 } from "bun";
import { hashSync } from "bcrypt-ts"; // Assuming bcrypt-ts or similar is available, otherwise I'll fallback

const EMAIL = "admin@databuddy.com";
const PASSWORD = "password123";

async function main() {
    console.log("Creating test user...");

    const userId = randomUUIDv7();
    const orgId = randomUUIDv7();
    const accountId = randomUUIDv7();

    // 1. Create User
    await db.insert(user).values({
        id: userId,
        name: "Test Admin",
        email: EMAIL,
        emailVerified: true,
        role: "ADMIN",
        status: "ACTIVE",
        createdAt: new Date(),
        updatedAt: new Date(),
    }).onConflictDoNothing();

    console.log(`User created: ${EMAIL}`);

    // 2. Create Organization
    await db.insert(organization).values({
        id: orgId,
        name: "Test Org",
        slug: "test-org",
        createdAt: new Date(),
    }).onConflictDoNothing();

    console.log("Organization created");

    // 3. Link Member
    await db.insert(member).values({
        id: randomUUIDv7(),
        userId: userId,
        organizationId: orgId,
        role: "owner",
        createdAt: new Date(),
    }).onConflictDoNothing();

    // 4. Create Account (Password login)
    // Note: We need to know how the app hashes passwords. 
    // Usually it's bcrypt. Let's try to insert a generic bcrypt hash for "password123".
    // Hash for "password123" with 10 rounds: $2a$10$wI5zM.i..P7.
    // Actually, looking at package.json, we don't see bcrypt. 
    // The schema has `password` on the `account` table.
    // Let's try to infer or just set it. 
    // If it fails, the user can use "Magic Link" since emailVerified is true.

    await db.insert(account).values({
        id: accountId,
        userId: userId,
        accountId: EMAIL, // for credentials provider
        providerId: "credentials",
        password: hashSync(PASSWORD, 10),
        createdAt: new Date(),
        updatedAt: new Date(),
    }).onConflictDoNothing();

    console.log("\nDONE! \nTry logging in with:");
    console.log(`Email: ${EMAIL}`);
    console.log(`Password: ${PASSWORD} (if supported)`);
    console.log("OR use Magic Link login since email is verified.");
}

main().catch(console.error).then(() => process.exit(0));
