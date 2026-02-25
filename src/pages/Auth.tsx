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
    const [collegeId, setCollegeId] = useState('');
    const [collegeName, setCollegeName] = useState('');
    const [userType, setUserType] = useState<'teacher' | 'student'>('student');
    const [subjectInput, setSubjectInput] = useState('');
    const [password, setPassword] = useState('');
    const [isGoogleSignIn, setIsGoogleSignIn] = useState(false);
    const [googleProfilePic, setGoogleProfilePic] = useState<string | undefined>(undefined);

    const [error, setError] = useState('');

    useEffect(() => {
        if (currentUser) {
            navigate('/dashboard');
        }
    }, [currentUser, navigate]);

    const handleGoogleSuccess = (credentialResponse: any) => {
        try {
            const decoded: any = jwtDecode(credentialResponse.credential);
            const result = loginWithGoogle(decoded.email, decoded.name, decoded.picture);

            if (result.isNewUser) {
                // Pre-fill the form and switch to registration
                setEmail(decoded.email);
                setName(decoded.name);
                setGoogleProfilePic(decoded.picture);
                setIsLogin(false);
                setIsGoogleSignIn(true);
                setError('Please complete your profile to finish signing up with Google.');
            } else {
                navigate('/dashboard');
            }
        } catch (err) {
            console.error('Error decoding Google JWT', err);
            setError('Google Login failed. Please try again.');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (isLogin) {
            try {
                const success = await login(email, password);
                if (!success) {
                    setError('Invalid email or password. Please try again or register.');
                } else {
                    navigate('/dashboard');
                }
            } catch (err: any) {
                setError(err.message || 'Login failed.');
            }
        } else {
            if (!name || !email || !collegeId || !collegeName || (!isLogin && !subjectInput) || (!isGoogleSignIn && !password)) {
                setError('Please fill in all required fields including your password.');
                return;
            }

            // Basic college email validation (e.g., must end in .edu or .ac.in or similar)
            if (!email.includes('.edu') && !email.includes('.ac.')) {
                setError('Please use a valid college email address (e.g. ending in .edu or .ac.in)');
                return;
            }

            // Registration ID format validation removed as per request

            const subjects = subjectInput.split(',').map(s => s.trim()).filter(s => s);
            try {
                await register({
                    name,
                    email,
                    role: 'user', // Default role since everyone is a mentor/learner now
                    userType,
                    subjects,
                    collegeId,
                    collegeName,
                    profilePic: googleProfilePic,
                    rating: 5.0 // Default rating for everyone since they can all mentor
                }, isGoogleSignIn ? undefined : password);
                navigate('/dashboard');
            } catch (err: any) {
                if (err.code === 'auth/email-already-in-use') {
                    setError('Email is already in use. Please sign in.');
                } else if (err.code === 'auth/weak-password') {
                    setError('Password is too weak. Please use at least 6 characters.');
                } else {
                    setError(err.message || 'Registration failed.');
                }
            }
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
                        <label>College Email Address</label>
                        <input
                            type="email"
                            className="input-field"
                            placeholder="you@university.edu"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    {!isGoogleSignIn && (
                        <div className="input-group">
                            <label>Password</label>
                            <input
                                type="password"
                                className="input-field"
                                placeholder="••••••••"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                required
                            />
                        </div>
                    )}

                    {!isLogin && (
                        <>
                            <div className="input-group">
                                <label>College / University Name</label>
                                <input
                                    type="text"
                                    className="input-field"
                                    placeholder="e.g. Stanford University"
                                    value={collegeName}
                                    onChange={e => setCollegeName(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="input-group">
                                <label>College ID Number {userType === 'teacher' && '(or Employee ID)'}</label>
                                <input
                                    type="text"
                                    className="input-field"
                                    placeholder={userType === 'teacher' ? "e.g. EMP1234" : "e.g. 21BCE1234"}
                                    value={collegeId}
                                    onChange={e => setCollegeId(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="input-group">
                                <label>I am a...</label>
                                <div className="flex gap-4" style={{ marginTop: '0.5rem' }}>
                                    <label className="flex items-center gap-2" style={{ cursor: 'pointer', flex: 1, padding: '1rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', background: userType === 'student' ? 'rgba(99, 102, 241, 0.2)' : 'transparent', transition: 'var(--transition-fast)' }}>
                                        <input
                                            type="radio"
                                            checked={userType === 'student'}
                                            onChange={() => setUserType('student')}
                                            style={{ accentColor: 'var(--color-primary)' }}
                                        />
                                        Student
                                    </label>
                                    <label className="flex items-center gap-2" style={{ cursor: 'pointer', flex: 1, padding: '1rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', background: userType === 'teacher' ? 'rgba(99, 102, 241, 0.2)' : 'transparent', transition: 'var(--transition-fast)' }}>
                                        <input
                                            type="radio"
                                            checked={userType === 'teacher'}
                                            onChange={() => setUserType('teacher')}
                                            style={{ accentColor: 'var(--color-primary)' }}
                                        />
                                        Teacher
                                    </label>
                                </div>
                            </div>
                        </>
                    )}

                    {!isLogin && (
                        <div className="input-group">
                            <label>Subjects you can help with or want to learn (Comma separated)</label>
                            <input
                                type="text"
                                className="input-field"
                                placeholder="e.g. Calculus, Physics, Python"
                                value={subjectInput}
                                onChange={e => setSubjectInput(e.target.value)}
                            />
                        </div>
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
