import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { UserCircle, Star, BookOpen, Clock, Calendar } from 'lucide-react';

const Profile: React.FC = () => {
    const { currentUser, matches, users, posts } = useAppContext();
    const navigate = useNavigate();

    if (!currentUser) {
        navigate('/auth');
        return null;
    }

    // Find accepted matches for the user
    const myMatches = matches.filter(
        m => (m.learnerId === currentUser.id || m.mentorId === currentUser.id) && m.status === 'accepted'
    );

    return (
        <div className="animate-fade-in" style={{ maxWidth: '900px', margin: '0 auto' }}>
            <div className="glass-panel" style={{ padding: '3rem', display: 'flex', gap: '2rem', alignItems: 'center', marginBottom: '2rem' }}>
                <div style={{ background: 'var(--color-primary)', padding: '1rem', borderRadius: '50%' }}>
                    <UserCircle size={80} color="white" />
                </div>
                <div>
                    <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>{currentUser.name}</h1>
                    <div className="flex gap-4 items-center">
                        <span className="badge badge-primary">EduBridge Member</span>
                        {currentUser.rating && (
                            <span className="flex items-center text-gradient" style={{ fontWeight: 600, gap: '4px' }}>
                                <Star size={18} fill="currentColor" /> {currentUser.rating} Rating
                            </span>
                        )}
                        <span className="text-muted" style={{ fontSize: '0.9rem' }}>{currentUser.email}</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
                <div className="glass-panel" style={{ padding: '2rem' }}>
                    <h2 className="flex items-center gap-2" style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                        <BookOpen size={24} className="text-gradient" /> My Subjects
                    </h2>
                    <div className="flex" style={{ gap: '0.5rem', flexWrap: 'wrap' }}>
                        {currentUser.subjects.map(sub => (
                            <span key={sub} className="badge" style={{ background: 'rgba(255,255,255,0.05)', fontSize: '0.9rem', padding: '0.5rem 1rem' }}>
                                {sub}
                            </span>
                        ))}
                    </div>
                </div>

                <div className="glass-panel" style={{ padding: '2rem' }}>
                    <h2 className="flex items-center gap-2" style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                        <Calendar size={24} className="text-gradient" /> Upcoming Sessions
                    </h2>

                    {myMatches.length === 0 ? (
                        <p className="text-muted flex items-center gap-2 justify-center" style={{ height: '100px' }}>
                            <Clock size={20} /> No upcoming sessions yet.
                        </p>
                    ) : (
                        <ul style={{ listStyle: 'none' }}>
                            {myMatches.map(match => {
                                const isMentor = match.mentorId === currentUser.id;
                                const otherUserId = isMentor ? match.learnerId : match.mentorId;
                                const otherUser = users.find(u => u.id === otherUserId);
                                const post = posts.find(p => p.id === match.postId);

                                return (
                                    <li key={match.id} style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1rem' }}>
                                        <div style={{ fontWeight: 600, marginBottom: '0.2rem' }}>Session with {otherUser?.name}</div>
                                        <div className="text-muted" style={{ fontSize: '0.85rem', marginBottom: '0.5rem' }}>Topic: {post?.title}</div>
                                        <div className="flex justify-between items-center" style={{ fontSize: '0.8rem' }}>
                                            <span style={{ color: 'var(--color-primary)' }}>{otherUser?.email}</span>
                                            <span className="badge badge-success">Confirmed</span>
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Profile;
