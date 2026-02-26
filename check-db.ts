import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, terminate } from 'firebase/firestore';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(process.cwd(), '.env') });

const firebaseConfig = {
    apiKey: process.env.VITE_FIREBASE_API_KEY,
    authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function check() {
    try {
        console.log("Checking Users...");
        const users = await getDocs(collection(db, 'users'));
        console.log(`Total users: ${users.docs.length}`);
        users.forEach(u => console.log("- ", u.id, "|", u.data().email, "|", u.data().name, "|", u.data().role));

        console.log("\nChecking Posts...");
        const posts = await getDocs(collection(db, 'posts'));
        console.log(`Total posts: ${posts.docs.length}`);
        posts.forEach(p => console.log("- ", p.id, "|", p.data().title, "| Status:", p.data().status));

        console.log("\nChecking Matches...");
        const matches = await getDocs(collection(db, 'matches'));
        console.log(`Total matches: ${matches.docs.length}`);

        await terminate(db);
        process.exit(0);
    } catch (e) {
        console.error("Error reading db:", e);
        process.exit(1);
    }
}
check();
