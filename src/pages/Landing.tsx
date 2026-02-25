import React from 'react';
import { Link } from 'react-router-dom';
import { Globe2, Users, BookOpen } from 'lucide-react';

const Landing: React.FC = () => {
    return (
        <div className="flex-col justify-center items-center" style={{ minHeight: '70vh', textAlign: 'center' }}>
            <div className="animate-fade-in" style={{ maxWidth: '800px', margin: '0 auto', paddingTop: '4rem' }}>
                <h1 style={{ fontSize: '4rem', lineHeight: 1.1, marginBottom: '1.5rem', position: 'relative' }}>
                    Bridge the Gap in <br />
                    <span className="text-gradient">Quality Education</span>
                </h1>
                <p className="text-muted" style={{ fontSize: '1.2rem', marginBottom: '2.5rem', padding: '0 2rem' }}>
                    Connect with peers to share knowledge, ask questions, and offer mentorship.
                    A supportive student community built for accessible and collaborative learning.
                </p>

                <div className="flex justify-center gap-4 delay-200 animate-fade-in">
                    <Link to="/auth?tab=register" className="btn btn-primary" style={{ padding: '1rem 2.5rem', fontSize: '1.1rem' }}>
                        Get Started
                    </Link>
                    <Link to="/auth" className="btn btn-secondary" style={{ padding: '1rem 2.5rem', fontSize: '1.1rem' }}>
                        Sign In
                    </Link>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-6 animate-fade-in delay-300" style={{ marginTop: '5rem' }}>
                <div className="glass-panel" style={{ padding: '2rem', textAlign: 'left' }}>
                    <div style={{ background: 'var(--color-primary)', display: 'inline-flex', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1rem' }}>
                        <Users size={28} color="white" />
                    </div>
                    <h3>Peer Mentorship</h3>
                    <p className="text-muted" style={{ fontSize: '0.9rem' }}>Learn from students who recently mastered the same subjects.</p>
                </div>

                <div className="glass-panel" style={{ padding: '2rem', textAlign: 'left' }}>
                    <div style={{ background: 'var(--color-secondary)', display: 'inline-flex', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1rem' }}>
                        <BookOpen size={28} color="white" />
                    </div>
                    <h3>Post Doubts</h3>
                    <p className="text-muted" style={{ fontSize: '0.9rem' }}>Stuck on a problem? Post it and get matched with someone who can help immediately.</p>
                </div>

                <div className="glass-panel" style={{ padding: '2rem', textAlign: 'left' }}>
                    <div style={{ background: 'var(--color-accent)', display: 'inline-flex', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1rem' }}>
                        <Globe2 size={28} color="white" />
                    </div>
                    <h3>SDG 4 Impact</h3>
                    <p className="text-muted" style={{ fontSize: '0.9rem' }}>Making learning collaborative, accessible, and affordable for everyone.</p>
                </div>
            </div>
        </div>
    );
};

export default Landing;
