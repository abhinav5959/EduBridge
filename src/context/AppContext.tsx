import React, { createContext, useContext, useState, useEffect } from 'react';
import { collection, onSnapshot, doc, setDoc, updateDoc } from 'firebase/firestore';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { db, auth } from '../utils/firebase';
import type { User, Post, Match } from '../types';

interface AppContextType {
    currentUser: User | null;
    users: User[];
    posts: Post[];
    matches: Match[];
    login: (email: string, password?: string) => Promise<boolean>;
    register: (user: Omit<User, 'id'>, password?: string) => Promise<void>;
    logout: () => Promise<void>;
    createPost: (post: Omit<Post, 'id' | 'createdAt' | 'status'>) => void;
    createMatch: (postId: string, mentorId: string) => void;
    acceptMatch: (matchId: string) => void;
    loginWithGoogle: (email: string, name: string, picture: string) => { isNewUser: boolean, user?: User };
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [users, setUsers] = useState<User[]>([]);
    const [posts, setPosts] = useState<Post[]>([]);
    const [matches, setMatches] = useState<Match[]>([]);

    const [currentUser, setCurrentUser] = useState<User | null>(() => {
        const saved = localStorage.getItem('edu_currentUser');
        return saved ? JSON.parse(saved) : null;
    });

    useEffect(() => {
        const unsubscribeUsers = onSnapshot(collection(db, 'users'), (snapshot) => {
            setUsers(snapshot.docs.map(doc => doc.data() as User));
        });

        const unsubscribePosts = onSnapshot(collection(db, 'posts'), (snapshot) => {
            const fetchedPosts = snapshot.docs.map(doc => doc.data() as Post);
            // Sort posts by newest first
            setPosts(fetchedPosts.sort((a, b) => b.createdAt - a.createdAt));
        });

        const unsubscribeMatches = onSnapshot(collection(db, 'matches'), (snapshot) => {
            setMatches(snapshot.docs.map(doc => doc.data() as Match));
        });

        return () => {
            unsubscribeUsers();
            unsubscribePosts();
            unsubscribeMatches();
        };
    }, []);

    useEffect(() => {
        if (currentUser) {
            localStorage.setItem('edu_currentUser', JSON.stringify(currentUser));

            // Re-sync current user from live db data if it updates
            const dbUser = users.find(u => u.id === currentUser.id);
            if (dbUser && JSON.stringify(dbUser) !== JSON.stringify(currentUser)) {
                setCurrentUser(dbUser);
            }
        } else {
            localStorage.removeItem('edu_currentUser');
        }
    }, [currentUser, users]);

    const login = async (email: string, password?: string) => {
        const user = users.find(u => u.email === email);
        if (user) {
            if (password) {
                try {
                    await signInWithEmailAndPassword(auth, email, password);
                    setCurrentUser(user);
                    return true;
                } catch (error) {
                    console.error("Login error", error);
                    return false; // Authentication failed
                }
            } else {
                // This branch allows for Google login or legacy passwordless logins to still work
                setCurrentUser(user);
                return true;
            }
        }
        return false;
    };

    const register = async (userData: Omit<User, 'id'>, password?: string) => {
        let userId = Date.now().toString();

        if (password) {
            // Let Firebase Auth handle the secure creation and assign a secure UID
            const userCredential = await createUserWithEmailAndPassword(auth, userData.email, password);
            userId = userCredential.user.uid;
        }

        const newUser: User = { ...userData, id: userId };
        try {
            await setDoc(doc(db, 'users', newUser.id), newUser);
            setCurrentUser(newUser); // Set after successful DB write
        } catch (error) {
            console.error("Error registering user: ", error);
            throw error;
        }
    };

    const logout = async () => {
        setCurrentUser(null);
        try {
            await signOut(auth);
        } catch (error) {
            console.error("Error signing out: ", error);
        }
    };

    const loginWithGoogle = (email: string, _name: string, picture: string) => {
        let user = users.find(u => u.email === email);
        if (!user) {
            // User does not exist, return flag so Auth.tsx can prompt for College ID
            return { isNewUser: true };
        }

        if (picture && !user.profilePic) {
            // Update profile pic if it was missing
            const updatedUser = { ...user, profilePic: picture };
            setCurrentUser(updatedUser);
            updateDoc(doc(db, 'users', user.id), { profilePic: picture }).catch(console.error);
            return { isNewUser: false, user: updatedUser };
        }

        setCurrentUser(user);
        return { isNewUser: false, user };
    };

    const createPost = async (postData: Omit<Post, 'id' | 'createdAt' | 'status'>) => {
        const newPost: Post = {
            ...postData,
            id: `p${Date.now()}`,
            createdAt: Date.now(),
            status: 'open'
        };

        try {
            await setDoc(doc(db, 'posts', newPost.id), newPost);

            // Notify others if this is a doubt based on College Name
            if (postData.type === 'doubt' && currentUser && currentUser.collegeName) {
                const peerEmails = users
                    .filter(u => u.id !== currentUser.id && u.collegeName?.toLowerCase() === currentUser.collegeName?.toLowerCase())
                    .map(u => u.email);

                if (peerEmails.length > 0) {
                    fetch('/api/send-email', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            to: peerEmails,
                            subject: `EduBridge: Someone at your college needs help with ${newPost.subject}!`,
                            html: `
                                <div style="font-family: sans-serif; padding: 20px; color: #333;">
                                    <h2 style="color: #6366f1;">New Doubt Posted!</h2>
                                    <p><strong>${currentUser.name}</strong> from your college (${currentUser.collegeName}) just posted a doubt and is looking for a mentor.</p>
                                    <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
                                        <h3 style="margin-top: 0; color: #111;">${newPost.title}</h3>
                                        <span style="display: inline-block; background: #e0e7ff; color: #4338ca; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold; margin-bottom: 10px;">SUBJECT: ${newPost.subject.toUpperCase()}</span>
                                        <p style="margin-bottom: 0;">${newPost.description}</p>
                                    </div>
                                    <p>If you know the answer, log into EduBridge and click "Offer Help" on their post.</p>
                                    <a href="https://edu-bridge-sage-three.vercel.app" style="display: inline-block; background: #6366f1; color: white; padding: 10px 20px; text-decoration: none; border-radius: 6px; font-weight: bold; margin-top: 10px;">Open EduBridge</a>
                                </div>
                            `
                        })
                    }).catch(err => console.error('Failed to trigger email API', err));
                }
            }
        } catch (error) {
            console.error("Error creating post:", error);
        }
    };

    const createMatch = async (postId: string, mentorId: string) => {
        const post = posts.find(p => p.id === postId);
        if (!post) return;

        const newMatch: Match = {
            id: `m${Date.now()}`,
            postId,
            learnerId: post.authorId,
            mentorId,
            status: 'pending'
        };

        try {
            await setDoc(doc(db, 'matches', newMatch.id), newMatch);
        } catch (error) {
            console.error("Error creating match: ", error);
        }
    };

    const acceptMatch = async (matchId: string) => {
        const match = matches.find(m => m.id === matchId);
        if (match) {
            try {
                // Perform concurrent updates
                await Promise.all([
                    updateDoc(doc(db, 'matches', matchId), { status: 'accepted' }),
                    updateDoc(doc(db, 'posts', match.postId), { status: 'matched' })
                ]);
            } catch (error) {
                console.error("Error accepting match: ", error);
            }
        }
    };

    return (
        <AppContext.Provider value={{ users, currentUser, posts, matches, login, register, logout, createPost, createMatch, acceptMatch, loginWithGoogle }}>
            {children}
        </AppContext.Provider>
    );
};

export const useAppContext = () => {
    const context = useContext(AppContext);
    if (context === undefined) {
        throw new Error('useAppContext must be used within an AppProvider');
    }
    return context;
};
