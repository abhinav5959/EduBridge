import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, UserCircle, LogOut, PlusCircle, CheckCircle } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

const Navbar: React.FC = () => {
    const { currentUser, logout, matches } = useAppContext();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const pendingMatches = matches.filter(
        m => m.learnerId === currentUser?.id && m.status === 'accepted'
    ).length;

    return (
        <nav className="glass-panel" style={{ position: 'sticky', top: '1rem', zIndex: 50, margin: '1rem', padding: '1rem 2rem' }}>
            <div className="flex justify-between items-center">
                <Link to="/" className="flex items-center gap-2" style={{ textDecoration: 'none' }}>
                    <div style={{ background: 'var(--color-primary)', padding: '0.5rem', borderRadius: 'var(--radius-md)' }}>
                        <BookOpen size={24} color="white" />
                    </div>
                    <span className="text-gradient" style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.05em' }}>
                        EduBridge
                    </span>
                </Link>

                <div className="flex items-center gap-6">
                    {currentUser ? (
                        <>
                            <Link to="/dashboard" className="text-muted" style={{ textDecoration: 'none', fontWeight: 500 }}>Dashboard</Link>
                            <Link to="/create-post" className="btn btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}>
                                <PlusCircle size={18} />
                                New Path
                            </Link>
                            <div className="flex items-center gap-4" style={{ marginLeft: '1rem', borderLeft: '1px solid var(--border-color)', paddingLeft: '1.5rem' }}>
                                <Link to="/profile" className="flex items-center gap-2" style={{ color: 'var(--text-main)', textDecoration: 'none' }}>
                                    <UserCircle size={24} />
                                    <span style={{ fontWeight: 600 }}>{currentUser.name}</span>
                                    {pendingMatches > 0 && (
                                        <span className="badge badge-success" style={{ marginLeft: '0.5rem', padding: '0.1rem 0.5rem' }}>
                                            <CheckCircle size={12} style={{ display: 'inline', marginRight: '4px' }} />
                                            {pendingMatches} New
                                        </span>
                                    )}
                                </Link>
                                <button onClick={handleLogout} className="btn btn-secondary" style={{ padding: '0.5rem', borderRadius: 'var(--radius-md)', border: 'none' }}>
                                    <LogOut size={20} />
                                </button>
                            </div>
                        </>
                    ) : (
                        <>
                            <Link to="/auth" className="btn btn-secondary text-muted" style={{ textDecoration: 'none' }}>Sign In</Link>
                            <Link to="/auth?tab=register" className="btn btn-primary">Join Now</Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
