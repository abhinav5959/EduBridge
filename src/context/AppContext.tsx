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
    loginWithGoogle: (email: string, name: string, picture: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const initialUsers: User[] = [
    { id: '1', name: 'Alice', email: 'alice@edu.com', role: 'learner', subjects: ['Math'] },
    { id: '2', name: 'Bob', email: 'bob@edu.com', role: 'mentor', subjects: ['Math', 'Physics'], rating: 4.8 }
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
        const newUser = { ...userData, id: Date.now().toString() };
        setUsers([...users, newUser]);
        setCurrentUser(newUser);
    };

    const logout = () => {
        setCurrentUser(null);
    };

    const loginWithGoogle = (email: string, name: string, picture: string) => {
        let user = users.find(u => u.email === email);
        if (!user) {
            user = {
                id: Date.now().toString(),
                name,
                email,
                role: 'learner', // Default role for Google signups
                subjects: [],
                profilePic: picture
            };
            setUsers([...users, user]);
        } else if (picture && !user.profilePic) {
            // Update profile pic if it was missing
            const updatedUsers = users.map(u => u.id === user?.id ? { ...u, profilePic: picture } : u);
            setUsers(updatedUsers);
            user = { ...user, profilePic: picture };
        }
        setCurrentUser(user);
    };

    const createPost = (postData: Omit<Post, 'id' | 'createdAt' | 'status'>) => {
        const newPost: Post = {
            ...postData,
            id: `p${Date.now()}`,
            createdAt: Date.now(),
            status: 'open'
        };
        setPosts([newPost, ...posts]);
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
