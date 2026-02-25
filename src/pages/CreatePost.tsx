import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';

const CreatePost: React.FC = () => {
    const { currentUser, createPost } = useAppContext();
    const navigate = useNavigate();

    const [type, setType] = useState<'doubt' | 'offer'>(currentUser?.role === 'mentor' ? 'offer' : 'doubt');
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [subject, setSubject] = useState('');

    if (!currentUser) {
        navigate('/auth');
        return null;
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title || !description || !subject) return;

        createPost({
            type,
            authorId: currentUser.id,
            title,
            description,
            subject
        });

        navigate('/dashboard');
    };

    return (
        <div className="flex justify-center" style={{ padding: '2rem 0' }}>
            <div className="glass-panel animate-fade-in" style={{ width: '100%', maxWidth: '600px', padding: '2.5rem' }}>
                <h2 style={{ marginBottom: '2rem' }}>Create a New Post</h2>

                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label>Post Type</label>
                        <div className="flex gap-4" style={{ marginTop: '0.5rem' }}>
                            <label
                                className="flex items-center gap-2"
                                style={{ cursor: 'pointer', flex: 1, padding: '1rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', background: type === 'doubt' ? 'rgba(99, 102, 241, 0.2)' : 'transparent', transition: 'var(--transition-fast)' }}
                            >
                                <input
                                    type="radio"
                                    checked={type === 'doubt'}
                                    onChange={() => setType('doubt')}
                                    style={{ accentColor: 'var(--color-primary)' }}
                                />
                                Ask a Doubt
                            </label>
                            <label
                                className="flex items-center gap-2"
                                style={{ cursor: 'pointer', flex: 1, padding: '1rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', background: type === 'offer' ? 'rgba(99, 102, 241, 0.2)' : 'transparent', transition: 'var(--transition-fast)', opacity: currentUser.role === 'learner' ? 0.5 : 1 }}
                            >
                                <input
                                    type="radio"
                                    checked={type === 'offer'}
                                    onChange={() => {
                                        if (currentUser.role === 'mentor') setType('offer');
                                    }}
                                    disabled={currentUser.role === 'learner'}
                                    style={{ accentColor: 'var(--color-primary)' }}
                                />
                                Offer a Session
                            </label>
                        </div>
                        {currentUser.role === 'learner' && (
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>Only mentors can post session offers.</p>
                        )}
                    </div>

                    <div className="input-group">
                        <label>Subject</label>
                        <input
                            type="text"
                            className="input-field"
                            placeholder="e.g. Physics, Calculus, React"
                            value={subject}
                            onChange={e => setSubject(e.target.value)}
                            required
                        />
                    </div>

                    <div className="input-group">
                        <label>Title</label>
                        <input
                            type="text"
                            className="input-field"
                            placeholder={type === 'doubt' ? "What do you need help with?" : "What will you teach?"}
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            required
                        />
                    </div>

                    <div className="input-group">
                        <label>Details</label>
                        <textarea
                            className="input-field"
                            placeholder="Provide more context or details here..."
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            rows={5}
                            required
                            style={{ resize: 'vertical' }}
                        />
                    </div>

                    <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem', padding: '1rem' }}>
                        Publish Post
                    </button>
                </form>
            </div>
        </div>
    );
};

export default CreatePost;
