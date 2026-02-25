import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User, Post, Match } from '../types';

interface AppContextType {
    currentUser: User | null;
    users: User[];
    posts: Post[];
    matches: Match[];
    login: (email: string) => boolean;
    register: (user: Omit<User, 'id'>) => void;
    logout: () => void;
    createPost: (post: Omit<Post, 'id' | 'createdAt' | 'status'>) => void;
    createMatch: (postId: string, mentorId: string) => void;
    acceptMatch: (matchId: string) => void;
    loginWithGoogle: (email: string, name: string, picture: string) => { isNewUser: boolean, user?: User };
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const initialUsers: User[] = [
    { id: '1', name: 'Alice', email: 'alice@edu.com', role: 'user', userType: 'student', subjects: ['Math'] },
    { id: '2', name: 'Bob', email: 'bob@edu.com', role: 'user', userType: 'teacher', subjects: ['Math', 'Physics'], rating: 4.8 }
];

const initialPosts: Post[] = [
    { id: 'p1', type: 'doubt', authorId: '1', title: 'Calculus Integration', description: 'Need help understanding integration by parts.', subject: 'Math', createdAt: Date.now() - 3600000, status: 'open' }
];

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [users, setUsers] = useState<User[]>(() => {
        const saved = localStorage.getItem('edu_users');
        return saved ? JSON.parse(saved) : initialUsers;
    });

    const [currentUser, setCurrentUser] = useState<User | null>(() => {
        const saved = localStorage.getItem('edu_currentUser');
        return saved ? JSON.parse(saved) : null;
    });

    const [posts, setPosts] = useState<Post[]>(() => {
        const saved = localStorage.getItem('edu_posts');
        return saved ? JSON.parse(saved) : initialPosts;
    });

    const [matches, setMatches] = useState<Match[]>(() => {
        const saved = localStorage.getItem('edu_matches');
        return saved ? JSON.parse(saved) : [];
    });

    useEffect(() => {
        localStorage.setItem('edu_users', JSON.stringify(users));
    }, [users]);

    useEffect(() => {
        if (currentUser) {
            localStorage.setItem('edu_currentUser', JSON.stringify(currentUser));
        } else {
            localStorage.removeItem('edu_currentUser');
        }
    }, [currentUser]);

    useEffect(() => {
        localStorage.setItem('edu_posts', JSON.stringify(posts));
    }, [posts]);

    useEffect(() => {
        localStorage.setItem('edu_matches', JSON.stringify(matches));
    }, [matches]);

    const login = (email: string) => {
        const user = users.find(u => u.email === email);
        if (user) {
            setCurrentUser(user);
            return true;
        }
        return false;
    };

    const register = (userData: Omit<User, 'id'>) => {
        const newUser: User = { ...userData, id: Date.now().toString() };
        setUsers([...users, newUser]);
        setCurrentUser(newUser);
    };

    const logout = () => {
        setCurrentUser(null);
    };

    const loginWithGoogle = (email: string, _name: string, picture: string) => {
        let user = users.find(u => u.email === email);
        if (!user) {
            // User does not exist, return flag so Auth.tsx can prompt for College ID
            return { isNewUser: true };
        }

        if (picture && !user.profilePic) {
            // Update profile pic if it was missing
            const updatedUsers = users.map(u => u.id === user?.id ? { ...u, profilePic: picture } : u);
            setUsers(updatedUsers);
            user = { ...user, profilePic: picture };
        }
        setCurrentUser(user);
        return { isNewUser: false, user };
    };

    const createPost = (postData: Omit<Post, 'id' | 'createdAt' | 'status'>) => {
        const newPost: Post = {
            ...postData,
            id: `p${Date.now()}`,
            createdAt: Date.now(),
            status: 'open'
        };
        setPosts([newPost, ...posts]);

        // Notify others if this is a doubt
        if (postData.type === 'doubt' && currentUser) {
            try {
                const domain = currentUser.email.split('@')[1];
                if (domain) {
                    const peerEmails = users
                        .filter(u => u.id !== currentUser.id && u.email.endsWith(`@${domain}`))
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
                                        <p><strong>${currentUser.name}</strong> from your college just posted a doubt and is looking for a mentor.</p>
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
                console.error('Error triggering email notification:', error);
            }
        }
    };

    const createMatch = (postId: string, mentorId: string) => {
        const post = posts.find(p => p.id === postId);
        if (!post) return;

        const newMatch: Match = {
            id: `m${Date.now()}`,
            postId,
            learnerId: post.authorId,
            mentorId,
            status: 'pending'
        };
        setMatches([...matches, newMatch]);
    };

    const acceptMatch = (matchId: string) => {
        setMatches(matches.map(m => m.id === matchId ? { ...m, status: 'accepted' } : m));
        const match = matches.find(m => m.id === matchId);
        if (match) {
            setPosts(posts.map(p => p.id === match.postId ? { ...p, status: 'matched' } : p));
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
