import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
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

async function deleteCollection(collectionPath: string) {
    const collRef = collection(db, collectionPath);
    const snapshot = await getDocs(collRef);

    let deleted = 0;
    for (const document of snapshot.docs) {
        await deleteDoc(doc(db, collectionPath, document.id));
        deleted++;
    }
    console.log(`Deleted ${deleted} documents from ${collectionPath}`);
}

async function clearDB() {
    try {
        console.log('Clearing database...');
        await deleteCollection('users');
        await deleteCollection('posts');
        await deleteCollection('matches');
        console.log('Database cleared successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Error clearing database:', error);
        process.exit(1);
    }
}

clearDB();
