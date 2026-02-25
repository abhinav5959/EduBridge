import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import { useAppContext } from '../context/AppContext';

const Auth: React.FC = () => {
    const [params] = useSearchParams();
    const navigate = useNavigate();
    const { login, register, currentUser, loginWithGoogle } = useAppContext();

    const [isLogin, setIsLogin] = useState(params.get('tab') !== 'register');
    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
    const [role, setRole] = useState<'learner' | 'mentor'>('learner');
    const [subjectInput, setSubjectInput] = useState('');

    const [error, setError] = useState('');

    useEffect(() => {
        if (currentUser) {
            navigate('/dashboard');
        }
    }, [currentUser, navigate]);

    const handleGoogleSuccess = (credentialResponse: any) => {
        try {
            const decoded: any = jwtDecode(credentialResponse.credential);
            loginWithGoogle(decoded.email, decoded.name, decoded.picture);
            navigate('/dashboard');
        } catch (err) {
            console.error('Error decoding Google JWT', err);
            setError('Google Login failed. Please try again.');
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (isLogin) {
            const success = login(email);
            if (!success) {
                setError('Invalid email. Please try again or register.');
            } else {
                navigate('/dashboard');
            }
        } else {
            if (!name || !email || !subjectInput) {
                setError('Please fill in all fields.');
                return;
            }
            const subjects = subjectInput.split(',').map(s => s.trim()).filter(s => s);
            register({
                name,
                email,
                role,
                subjects,
                rating: role === 'mentor' ? 5.0 : undefined
            });
            navigate('/dashboard');
        }
    };

    return (
        <div className="flex justify-center items-center" style={{ minHeight: '70vh' }}>
            <div className="glass-panel animate-fade-in" style={{ width: '100%', maxWidth: '450px', padding: '2.5rem' }}>
                <h2 style={{ textAlign: 'center', marginBottom: '2rem', fontSize: '2rem' }}>
                    {isLogin ? 'Welcome Back' : 'Join EduBridge'}
                </h2>

                {error && (
                    <div className="badge badge-warning" style={{ display: 'block', textAlign: 'center', marginBottom: '1.5rem', padding: '0.75rem' }}>
                        {error}
                    </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
                    <GoogleLogin
                        onSuccess={handleGoogleSuccess}
                        onError={() => setError('Google Login Failed')}
                        useOneTap
                        theme="filled_black"
                        shape="pill"
                    />
                </div>

                <div style={{ textAlign: 'center', margin: '1.5rem 0', color: 'var(--text-muted)', position: 'relative' }}>
                    <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, borderTop: '1px solid var(--border-color)', zIndex: 1 }}></div>
                    <span style={{ background: 'var(--color-surface)', padding: '0 10px', position: 'relative', zIndex: 2, fontSize: '0.875rem' }}>OR CONTINUE WITH EMAIL</span>
                </div>

                <form onSubmit={handleSubmit}>
                    {!isLogin && (
                        <div className="input-group">
                            <label>Full Name</label>
                            <input
                                type="text"
                                className="input-field"
                                placeholder="John Doe"
                                value={name}
                                onChange={e => setName(e.target.value)}
                            />
                        </div>
                    )}

                    <div className="input-group">
                        <label>Email Address</label>
                        <input
                            type="email"
                            className="input-field"
                            placeholder="you@university.edu"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    {!isLogin && (
                        <>
                            <div className="input-group">
                                <label>I want to...</label>
                                <div className="flex gap-4" style={{ marginTop: '0.5rem' }}>
                                    <label className="flex items-center gap-2" style={{ cursor: 'pointer', flex: 1, padding: '1rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', background: role === 'learner' ? 'rgba(99, 102, 241, 0.2)' : 'transparent', transition: 'var(--transition-fast)' }}>
                                        <input
                                            type="radio"
                                            checked={role === 'learner'}
                                            onChange={() => setRole('learner')}
                                            style={{ accentColor: 'var(--color-primary)' }}
                                        />
                                        Learn (Post doubts)
                                    </label>
                                    <label className="flex items-center gap-2" style={{ cursor: 'pointer', flex: 1, padding: '1rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', background: role === 'mentor' ? 'rgba(99, 102, 241, 0.2)' : 'transparent', transition: 'var(--transition-fast)' }}>
                                        <input
                                            type="radio"
                                            checked={role === 'mentor'}
                                            onChange={() => setRole('mentor')}
                                            style={{ accentColor: 'var(--color-primary)' }}
                                        />
                                        Mentor (Help others)
                                    </label>
                                </div>
                            </div>

                            <div className="input-group">
                                <label>Subjects (Comma separated)</label>
                                <input
                                    type="text"
                                    className="input-field"
                                    placeholder="e.g. Calculus, Physics, Python"
                                    value={subjectInput}
                                    onChange={e => setSubjectInput(e.target.value)}
                                />
                            </div>
                        </>
                    )}

                    <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem', padding: '1rem' }}>
                        {isLogin ? 'Sign In' : 'Create Account'}
                    </button>
                </form>

                <p style={{ textAlign: 'center', marginTop: '2rem', color: 'var(--text-muted)' }}>
                    {isLogin ? "Don't have an account? " : "Already have an account? "}
                    <button
                        type="button"
                        onClick={() => setIsLogin(!isLogin)}
                        style={{ background: 'none', border: 'none', color: 'var(--color-primary)', fontWeight: 600, cursor: 'pointer', fontSize: '1rem' }}
                    >
                        {isLogin ? 'Register now.' : 'Sign in.'}
                    </button>
                </p>
            </div>
        </div>
    );
};

export default Auth;
