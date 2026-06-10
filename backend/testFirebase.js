require("dotenv").config();

const { db } = require("./src/config/firebase");

async function testConnection() {
  try {
    const docRef = await db.collection("test").add({
      message: "Firestore Connected",
      createdAt: new Date(),
    });

    console.log("✅ Firestore Connected Successfully");
    console.log("Document ID:", docRef.id);
  } catch (error) {
    console.error("❌ Firestore Error:", error);
  }
}

testConnection();