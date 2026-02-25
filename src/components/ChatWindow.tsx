import React, { useState, useEffect, useRef } from 'react';
import { collection, addDoc, onSnapshot, query, where, orderBy } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../utils/firebase';
import type { Message } from '../types';
import { useAppContext } from '../context/AppContext';
import { Send, Paperclip, X, Download, FileText, Image as ImageIcon } from 'lucide-react';

interface ChatWindowProps {
    matchId: string;
    onClose: () => void;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ matchId, onClose }) => {
    const { currentUser, users } = useAppContext();
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [uploading, setUploading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Fetch messages for this match
    useEffect(() => {
        const q = query(
            collection(db, 'messages'),
            where('matchId', '==', matchId),
            orderBy('timestamp', 'asc')
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedMessages = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data() // Assume all fields map perfectly to Message interface
            })) as Message[];
            setMessages(fetchedMessages);
        });

        return () => unsubscribe();
    }, [matchId]);

    // Auto-scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() && !uploading) return;
        if (!currentUser) return;

        const messageData: Omit<Message, 'id'> = {
            matchId,
            senderId: currentUser.id,
            text: newMessage.trim(),
            timestamp: Date.now(),
        };

        setNewMessage('');
        try {
            await addDoc(collection(db, 'messages'), messageData);
        } catch (error) {
            console.error('Error sending message:', error);
        }
    };

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file || !currentUser) return;

        // Limit file size to 5MB for the free tier
        if (file.size > 5 * 1024 * 1024) {
            alert('File size must be less than 5MB');
            return;
        }

        setUploading(true);
        const storageRef = ref(storage, `chat_files/${matchId}/${Date.now()}_${file.name}`);
        const uploadTask = uploadBytesResumable(storageRef, file);

        uploadTask.on(
            'state_changed',
            () => {
                // Monitor progress if desired
            },
            (error) => {
                console.error("Upload failed", error);
                alert('File upload failed. Did you enable Firebase Storage in the console?');
                setUploading(false);
            },
            async () => {
                const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);

                const messageData: Omit<Message, 'id'> = {
                    matchId,
                    senderId: currentUser.id,
                    text: '', // Empty text for pure file uploads
                    timestamp: Date.now(),
                    fileUrl: downloadURL,
                    fileName: file.name,
                    fileType: file.type,
                };

                await addDoc(collection(db, 'messages'), messageData);
                setUploading(false);
            }
        );

        // Reset input
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const getSenderName = (senderId: string) => {
        if (senderId === currentUser?.id) return 'You';
        return users.find(u => u.id === senderId)?.name || 'User';
    };

    return (
        <div style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            width: '350px',
            height: '500px',
            backgroundColor: 'var(--color-surface)',
            borderRadius: 'var(--radius-lg)',
            boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
            border: '1px solid var(--border-color)',
            display: 'flex',
            flexDirection: 'column',
            zIndex: 1000,
            overflow: 'hidden'
        }}>
            {/* Header */}
            <div style={{
                padding: '1rem',
                borderBottom: '1px solid var(--border-color)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundColor: 'rgba(255,255,255,0.02)'
            }}>
                <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Chat Session</h3>
                <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                    <X size={20} />
                </button>
            </div>

            {/* Messages Area */}
            <div style={{
                flex: 1,
                padding: '1rem',
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem'
            }}>
                {messages.length === 0 ? (
                    <div style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: '2rem' }}>
                        No messages yet. Say hello!
                    </div>
                ) : (
                    messages.map((msg) => {
                        const isMine = msg.senderId === currentUser?.id;
                        return (
                            <div key={msg.id} style={{
                                alignSelf: isMine ? 'flex-end' : 'flex-start',
                                maxWidth: '85%',
                            }}>
                                <div style={{
                                    fontSize: '0.75rem',
                                    color: 'var(--text-muted)',
                                    marginBottom: '4px',
                                    textAlign: isMine ? 'right' : 'left'
                                }}>
                                    {getSenderName(msg.senderId)}
                                </div>
                                <div style={{
                                    backgroundColor: isMine ? 'var(--color-primary)' : 'rgba(255,255,255,0.1)',
                                    padding: '0.75rem 1rem',
                                    borderRadius: '12px',
                                    borderBottomRightRadius: isMine ? '2px' : '12px',
                                    borderBottomLeftRadius: !isMine ? '2px' : '12px',
                                    color: isMine ? '#fff' : 'var(--text-primary)',
                                    wordBreak: 'break-word'
                                }}>
                                    {msg.text && <div style={{ marginBottom: msg.fileUrl ? '8px' : '0' }}>{msg.text}</div>}

                                    {/* File Attachment Render */}
                                    {msg.fileUrl && (
                                        <div style={{
                                            marginTop: msg.text ? '8px' : '0',
                                            padding: '8px',
                                            backgroundColor: 'rgba(0,0,0,0.2)',
                                            borderRadius: '8px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px',
                                            cursor: 'pointer'
                                        }} onClick={() => window.open(msg.fileUrl, '_blank')}>
                                            {msg.fileType?.startsWith('image/') ? (
                                                <ImageIcon size={24} style={{ flexShrink: 0 }} />
                                            ) : (
                                                <FileText size={24} style={{ flexShrink: 0 }} />
                                            )}
                                            <div style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '0.85rem' }}>
                                                {msg.fileName}
                                            </div>
                                            <Download size={16} />
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <form onSubmit={handleSendMessage} style={{
                padding: '1rem',
                borderTop: '1px solid var(--border-color)',
                display: 'flex',
                gap: '0.5rem',
                backgroundColor: 'rgba(255,255,255,0.02)',
                alignItems: 'center'
            }}>
                <input
                    type="file"
                    ref={fileInputRef}
                    style={{ display: 'none' }}
                    onChange={handleFileUpload}
                    accept="image/*,.pdf,.doc,.docx,.txt"
                />
                <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--text-muted)',
                        cursor: uploading ? 'not-allowed' : 'pointer',
                        padding: '0.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: '50%',
                        transition: 'background-color 0.2s',
                    }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)'}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                    <Paperclip size={20} />
                </button>
                <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder={uploading ? "Uploading..." : "Type a message..."}
                    style={{
                        flex: 1,
                        padding: '0.75rem',
                        borderRadius: '20px',
                        border: '1px solid var(--border-color)',
                        backgroundColor: 'var(--color-bg)',
                        color: 'var(--text-primary)',
                        outline: 'none',
                    }}
                    disabled={uploading}
                />
                <button
                    type="submit"
                    disabled={(!newMessage.trim() && !uploading) || uploading}
                    style={{
                        background: 'var(--color-primary)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '50%',
                        width: '40px',
                        height: '40px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: (!newMessage.trim() && !uploading) || uploading ? 'not-allowed' : 'pointer',
                        opacity: (!newMessage.trim() && !uploading) || uploading ? 0.5 : 1
                    }}
                >
                    <Send size={18} style={{ marginLeft: '2px' }} />
                </button>
            </form>
        </div>
    );
};

export default ChatWindow;
