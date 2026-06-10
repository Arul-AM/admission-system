const bcrypt = require("bcryptjs");
const { db } = require("../config/firebase");

const seedAdmin = async () => {
  try {
    const snapshot = await db
      .collection("admins")
      .where("email", "==", process.env.ADMIN_EMAIL)
      .get();

    if (!snapshot.empty) {
      console.log("✅ Admin already exists");
      return;
    }

    const hashedPassword = await bcrypt.hash(
      process.env.ADMIN_PASSWORD,
      12
    );

    await db.collection("admins").add({
      email: process.env.ADMIN_EMAIL,
      password: hashedPassword,
      role: "admin",
      createdAt: new Date(),
    });

    console.log("✅ Admin account seeded");
  } catch (error) {
    console.error("❌ Admin seed error:", error);
  }
};

module.exports = seedAdmin;