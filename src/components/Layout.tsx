import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

const Layout: React.FC = () => {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Navbar />
            <main className="container animate-fade-in" style={{ flex: 1, padding: '2rem 1.5rem', width: '100%' }}>
                <Outlet />
            </main>
            <footer style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', borderTop: '1px solid var(--border-color)', marginTop: 'auto' }}>
                <p>© 2026 EduBridge. Empowering SDG 4: Quality Education.</p>
            </footer>
        </div>
    );
};

export default Layout;
