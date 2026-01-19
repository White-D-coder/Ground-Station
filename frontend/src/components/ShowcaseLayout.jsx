import React from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import '../pages/LandingPage.css'; // Reusing the refined CSS

const ShowcaseLayout = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const handleLaunch = () => {
        navigate('/app');
    };

    const handleGithub = () => {
        window.open('https://github.com/White-D-coder/Ground-Station', '_blank');
    };

    const isActive = (path) => location.pathname === path ? 'active-link' : '';

    return (
        <div className="landing-container">
            <nav className="landing-nav">
                <div className="nav-logo">GS / PRO</div>
                <div className="nav-links-group">
                    <Link to="/" className={`nav-link ${isActive('/')}`}>Home</Link>
                    <Link to="/features" className={`nav-link ${isActive('/features')}`}>Features</Link>
                    <Link to="/gallery" className={`nav-link ${isActive('/gallery')}`}>Gallery</Link>
                    <Link to="/about" className={`nav-link ${isActive('/about')}`}>About</Link>
                </div>
                <div className="nav-actions">
                    <button onClick={handleGithub}>GitHub</button>
                </div>
            </nav>

            <div className="page-content">
                <Outlet />
            </div>

            <footer className="creator-section">
                <p>Architected & Engineered by <span>Deeptanu Bhunia</span></p>
                <p style={{ marginTop: '10px', fontSize: '0.7rem', color: '#222' }}> &copy; 2026 Ground Station Systems.</p>
            </footer>
        </div>
    );
};

export default ShowcaseLayout;
