import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getStorage } from "firebase-admin/storage";
import path from "path";
import fs from "fs";

const serviceAccountPath = path.join(process.cwd(), "config/firebase-admin.json");
console.log("Firebase path", serviceAccountPath)
const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, "utf8"));

if (!getApps().length) {
  initializeApp({
    credential: cert(serviceAccount),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  });
}

export const storage = getStorage().bucket();
