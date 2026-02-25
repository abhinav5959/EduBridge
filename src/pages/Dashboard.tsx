import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { ArrowRight, UserCircle, Clock, CheckCircle, Search, MessageCircle } from 'lucide-react';
import ChatWindow from '../components/ChatWindow';

const Dashboard: React.FC = () => {
    const { currentUser, posts, users, matches, createMatch, acceptMatch } = useAppContext();
    const navigate = useNavigate();
    const [activeChatMatchId, setActiveChatMatchId] = React.useState<string | null>(null);

    if (!currentUser) {
        navigate('/auth');
        return null;
    }

    // Pending matches for this user (if learner, someone offered help)
    const myPendingMatches = matches.filter(m => m.learnerId === currentUser.id && m.status === 'pending');
    // Active accepted matches for chat
    const myAcceptedMatches = matches.filter(m => (m.learnerId === currentUser.id || m.mentorId === currentUser.id) && m.status === 'accepted');

    // Posts to show in feed
    const feedPosts = posts.filter(p => p.status === 'open' && p.authorId !== currentUser.id);
    const myPosts = posts.filter(p => p.authorId === currentUser.id);

    const handleOfferHelp = (postId: string) => {
        createMatch(postId, currentUser.id);
        alert('Offer sent to the student!');
    };

    const handleAcceptMatch = (matchId: string) => {
        acceptMatch(matchId);
        alert('Match accepted! You can now view their contact info on your profile.');
    };

    const getAuthorName = (id: string) => users.find(u => u.id === id)?.name || 'Unknown User';

    return (
        <div className="animate-fade-in">
            <div className="flex justify-between items-center" style={{ marginBottom: '2rem' }}>
                <div>
                    <h1 style={{ fontSize: '2.5rem' }}>Dashboard</h1>
                    <p className="text-muted">Welcome back, {currentUser.name}. Ready to learn?</p>
                </div>
            </div>

            {myPendingMatches.length > 0 && (
                <div style={{ marginBottom: '3rem' }}>
                    <h2 style={{ marginBottom: '1rem', color: 'var(--color-primary)' }}>Requires your attention</h2>
                    <div className="grid grid-cols-2 gap-4">
                        {myPendingMatches.map(match => {
                            const post = posts.find(p => p.id === match.postId);
                            const mentor = users.find(u => u.id === match.mentorId);
                            return (
                                <div key={match.id} className="glass-panel" style={{ padding: '1.5rem', borderLeft: '4px solid var(--color-success, #10b981)' }}>
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 style={{ fontSize: '1.1rem', marginBottom: '0.2rem' }}>
                                                {mentor?.name} offered help
                                                {mentor?.userType === 'teacher' && <span className="badge badge-primary" style={{ marginLeft: '8px', fontSize: '0.7rem' }}>TEACHER</span>}
                                            </h3>
                                            <p className="text-muted" style={{ fontSize: '0.9rem', marginBottom: '1rem' }}>Regarding your doubt: "{post?.title}"</p>

                                            {mentor?.rating && (
                                                <div className="badge badge-warning" style={{ marginBottom: '1rem' }}>
                                                    ★ {mentor.rating} Mentor Rating
                                                </div>
                                            )}
                                        </div>
                                        <button
                                            onClick={() => handleAcceptMatch(match.id)}
                                            className="btn btn-primary"
                                            style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}
                                        >
                                            <CheckCircle size={16} /> Accept
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            <div className="grid grid-cols-3 gap-6">
                <div style={{ gridColumn: 'span 2' }}>
                    <h2 style={{ marginBottom: '1rem', fontSize: '1.5rem' }}>Community Feed</h2>

                    <div className="flex-col gap-4">
                        {feedPosts.length === 0 ? (
                            <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center' }}>
                                <Search size={48} color="var(--text-muted)" style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
                                <h3 className="text-muted">No open posts found</h3>
                                <p className="text-muted" style={{ fontSize: '0.9rem' }}>Check back later or post your own doubt.</p>
                            </div>
                        ) : (
                            feedPosts.map(post => (
                                <div key={post.id} className="glass-panel" style={{ padding: '1.5rem', marginBottom: '1rem', transition: 'transform var(--transition-bounce)', cursor: 'default' }} onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}>
                                    <div className="flex justify-between items-start" style={{ marginBottom: '1rem' }}>
                                        <div className="flex items-center gap-3">
                                            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '0.5rem', borderRadius: '50%' }}>
                                                <UserCircle size={24} color="var(--text-muted)" />
                                            </div>
                                            <div>
                                                <span style={{ fontWeight: 600, display: 'block' }}>
                                                    {getAuthorName(post.authorId)}
                                                </span>
                                                <span className="text-muted" style={{ fontSize: '0.8rem' }}>
                                                    <span className="badge" style={{ background: 'rgba(255,255,255,0.05)', fontSize: '0.65rem', marginRight: '6px', padding: '0.2rem 0.5rem' }}>
                                                        {users.find(u => u.id === post.authorId)?.userType === 'teacher' ? 'TEACHER' : 'STUDENT'}
                                                    </span>
                                                    <Clock size={12} style={{ display: 'inline', marginRight: '4px', verticalAlign: '-1px' }} />
                                                    {new Date(post.createdAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </div>
                                        <span className={`badge ${post.type === 'doubt' ? 'badge-primary' : 'badge-success'}`}>
                                            {post.type.toUpperCase()}
                                        </span>
                                    </div>

                                    <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>{post.title}</h3>
                                    <div className="badge" style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.1)', marginBottom: '1rem' }}>
                                        {post.subject}
                                    </div>

                                    <p className="text-muted" style={{ marginBottom: '1.5rem' }}>{post.description}</p>

                                    {post.type === 'doubt' && (
                                        <button
                                            onClick={() => handleOfferHelp(post.id)}
                                            className="btn btn-primary"
                                            style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}
                                        >
                                            Offer Help <ArrowRight size={16} />
                                        </button>
                                    )}
                                    {post.type === 'offer' && (
                                        <button
                                            onClick={() => handleOfferHelp(post.id)} // for simplicity, learner requesting
                                            className="btn btn-secondary"
                                            style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}
                                        >
                                            Request Session <ArrowRight size={16} />
                                        </button>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <div>
                    <h2 style={{ marginBottom: '1rem', fontSize: '1.5rem' }}>Active Mentorships</h2>
                    <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
                        {myAcceptedMatches.length === 0 ? (
                            <p className="text-muted" style={{ fontSize: '0.9rem' }}>No active mentorships.</p>
                        ) : (
                            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                                {myAcceptedMatches.map(match => {
                                    const post = posts.find(p => p.id === match.postId);
                                    const isLearner = match.learnerId === currentUser.id;
                                    const otherUserId = isLearner ? match.mentorId : match.learnerId;
                                    const otherUser = users.find(u => u.id === otherUserId);

                                    return (
                                        <li key={match.id} style={{ marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
                                            <div style={{ fontWeight: 500, fontSize: '0.95rem', marginBottom: '0.2rem' }}>
                                                {post?.title || 'Unknown Post'}
                                            </div>
                                            <div className="text-muted" style={{ fontSize: '0.8rem', marginBottom: '0.5rem' }}>
                                                With: {otherUser?.name || 'Unknown User'} ({isLearner ? 'Mentor' : 'Student'})
                                            </div>
                                            <button
                                                onClick={() => setActiveChatMatchId(match.id)}
                                                className="btn btn-secondary"
                                                style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                                            >
                                                <MessageCircle size={14} /> Open Chat
                                            </button>
                                        </li>
                                    );
                                })}
                            </ul>
                        )}
                    </div>

                    <h2 style={{ marginBottom: '1rem', fontSize: '1.5rem' }}>My Posts</h2>
                    <div className="glass-panel" style={{ padding: '1.5rem' }}>
                        {myPosts.length === 0 ? (
                            <p className="text-muted" style={{ fontSize: '0.9rem' }}>You haven't created any posts yet.</p>
                        ) : (
                            <ul style={{ listStyle: 'none' }}>
                                {myPosts.map(post => (
                                    <li key={post.id} style={{ marginBottom: '1rem' }}>
                                        <div style={{ fontWeight: 500, fontSize: '0.95rem' }}>{post.title}</div>
                                        <div className="flex justify-between items-center" style={{ marginTop: '0.2rem' }}>
                                            <span className="badge" style={{ background: 'rgba(255,255,255,0.05)', fontSize: '0.7rem' }}>{post.status.toUpperCase()}</span>
                                            <span className="text-muted" style={{ fontSize: '0.75rem' }}>{new Date(post.createdAt).toLocaleDateString()}</span>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            </div>

            {/* Chat Window Overlay */}
            {activeChatMatchId && (
                <ChatWindow matchId={activeChatMatchId} onClose={() => setActiveChatMatchId(null)} />
            )}
        </div>
    );
};

export default Dashboard;
