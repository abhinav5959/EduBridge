import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, setDoc, terminate } from 'firebase/firestore';
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

async function seed() {
    try {
        console.log('Fetching users...');
        const usersSnap = await getDocs(collection(db, 'users'));
        const userIds = usersSnap.docs.map(d => d.data().id);
        console.log(`Found ${userIds.length} users to match with.`);

        const alexId = 'user_alex_' + Date.now();
        await setDoc(doc(db, 'users', alexId), {
            id: alexId,
            name: 'Alex from Computer Science',
            email: 'alex@example.com',
            role: 'user',
            userType: 'learner',
            subjects: ['Calculus', 'Python', 'Data Structures'],
            collegeId: '12345',
            collegeName: 'Final College', // Match the college used in testing
            rating: 5.0
        });
        console.log('Created Alex');

        const post1Id = 'post_1_' + Date.now();
        await setDoc(doc(db, 'posts', post1Id), {
            id: post1Id,
            type: 'doubt',
            authorId: alexId,
            title: 'Help with Binary Search Trees',
            description: 'Can someone explain how to balance a binary search tree in Python? I have my midterms tomorrow and am stuck on AVL rotations.',
            subject: 'Data Structures',
            createdAt: Date.now() - 100000,
            status: 'matched' // Matched so the chat window appears
        });

        const sarahId = 'user_sarah_' + Date.now();
        await setDoc(doc(db, 'users', sarahId), {
            id: sarahId,
            name: 'Sarah Mentor',
            email: 'sarah@example.com',
            role: 'user',
            userType: 'teacher',
            subjects: ['React', 'JavaScript'],
            collegeId: '12345',
            collegeName: 'Final College',
            rating: 5.0
        });

        const post2Id = 'post_2_' + Date.now();
        await setDoc(doc(db, 'posts', post2Id), {
            id: post2Id,
            type: 'offer',
            authorId: sarahId,
            title: 'Offering advanced React help session',
            description: 'Im a TA for the frontend course. If anyone needs help understanding useEffect or custom hooks, hit me up! I have 2 hours free this evening.',
            subject: 'React',
            createdAt: Date.now() - 50000,
            status: 'open' // Open so it appears in the Community Feed
        });

        // Forcibly match Alex with every single user in the DB so the active chat appears
        let matchedCount = 0;
        for (const uid of userIds) {
            if (uid !== alexId && uid !== sarahId) {
                const activeMatchId = 'match_' + Date.now() + Math.floor(Math.random() * 1000);
                await setDoc(doc(db, 'matches', activeMatchId), {
                    id: activeMatchId,
                    postId: post1Id,
                    learnerId: alexId,
                    mentorId: uid,
                    status: 'accepted'
                });
                matchedCount++;
            }
        }

        console.log(`Matched Alex with ${matchedCount} existing users.`);

        console.log('Seeding complete! Closing connections...');
        await terminate(db);
        process.exit(0);

    } catch (e) {
        console.error('Error seeding data:', e);
        process.exit(1);
    }
}

seed();
