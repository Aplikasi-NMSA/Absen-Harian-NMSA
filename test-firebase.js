import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore";
import fs from "fs";

const config = JSON.parse(fs.readFileSync("firebase-applet-config.json", "utf8"));
const app = initializeApp(config);
const db = getFirestore(app);

async function test() {
  await setDoc(doc(db, "app_state", "shared"), { hello: "world" });
  const snap = await getDoc(doc(db, "app_state", "shared"));
  console.log(snap.data());
}
test().catch(console.error);
