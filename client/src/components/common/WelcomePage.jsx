import { useState, useEffect } from 'react'
import './WelcomePage.css'

export default function WelcomePage({ onLoginClick, onManualClick }) {
    const [scrollY, setScrollY] = useState(0)
    const [showAbout, setShowAbout] = useState(false)

    useEffect(() => {
        const handleScroll = () => setScrollY(window.scrollY)
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    const scrollToSection = (id) => {
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ 
                behavior: 'smooth',
                block: 'start'
            });
        }
    }

    // Removed testimonials array as section deleted

    return (
        <div className="welcome-page">
            {/* Enhanced Background Patterns */}
            <div className="bg-patterns">
                <div className="connection-nodes">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div 
                            key={i} 
                            className="node" 
                            style={{ 
                                '--delay': `${i * 0.5}s`,
                                top: `${20 + i * 12}%`,
                                left: `${10 + (i % 3) * 30}%`
                            }}
                        />
                    ))}
                </div>
                <div className="particles">
                    {Array.from({ length: 12 }).map((_, i) => (
                        <div 
                            key={i} 
                            className="particle" 
                            style={{ 
                                '--delay': `${i * 1.2}s`,
                                top: `${Math.random() * 100}%`,
                                left: `${Math.random() * 100}%`
                            }}
                        />
                    ))}
                </div>
            </div>

            {/* Navigation Bar */}
            <nav className="navbar">
                <div className="nav-left">
                    <div className="logo">
                        <span className="logo-text">DigitalRutin</span>
                    </div>
                </div>
                <div className="nav-center">
                    <button className="nav-btn" onClick={() => setShowAbout(true)}>About Us</button>
                    <a onClick={onManualClick} style={{ cursor: 'pointer' }}>User Manual</a>
                </div>
                <div className="nav-right">
                    <button className="login-btn" onClick={onLoginClick}>Get Started</button>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="hero-section" id="hero">
                <div className="hero-content">
                    <h1 className="hero-title">
                        Welcome to <span className="highlight">Digital</span><br />
                        Attendance Management<br />
                        <span className="highlight">System</span>
                    </h1>
                    <p className="hero-subtitle">
                        Streamline attendance tracking, class scheduling, and academic management 
                        with our intuitive platform built for modern educational institutions.
                    </p>
                    <div className="hero-stats">
                        <div className="stat">
                            <div className="stat-number">500+</div>
                            <div style={{ color: 'black'   }} className="stat-label">Students Managed</div>
                        </div>
                        <div className="stat">
                            <div className="stat-number">50+</div>
                            <div style={{ color: 'black' }}
                             className="stat-label">Teachers</div>
                        </div>
                        <div className="stat">
                            <div className="stat-number">99.9%</div>
                            <div style={{ color: 'black' }} className="stat-label">Uptime</div>
                        </div>
                    </div>
                    <div className="hero-buttons">
                        <button style={{color :'black'}} className="cta-primary" onClick={onLoginClick}>Get Started</button>
                    </div>
                </div>
            </section>

            {showAbout && (
                <div className="about-modal">
                    <div className="about-overlay" onClick={() => setShowAbout(false)}></div>
                    <div className="about-content">
                        <button className="modal-close" onClick={() => setShowAbout(false)}>×</button>
                        <h2>About Us</h2>
                        <p>
                            DigitalRutin is developed by <strong>Kapil Giri, Chandra Kamal Ghimire, Pramit Giri, and Binita Gautam</strong> 
                            from Group A, Mid-West University Surkhet, Nepal. 
                            Our mission is to modernize attendance management for educational institutions with 
                            intuitive, reliable, and scalable digital solutions.
                        </p>
                        <button className="about-close-btn" onClick={() => setShowAbout(false)}>Close</button>
                    </div>
                </div>
            )}

            {/* Footer */}
            <footer className="footer">
                <div className="footer-content">
                    <div className="footer-left">
                        <span className="logo-text-small">DigitalRutin</span>
                        <span className="copyright">© 2025 Group A - Mid-West University Surkhet, Nepal</span>
                    </div>
                    <div className="footer-center">
                        <div className="resources">
                            <h4>Resources</h4>
                            <div className="resource-links">
                                <a onClick={onManualClick} style={{ cursor: 'pointer' }}>User Manual</a>
                                <a href="mailto:groupaproject100@gmail.com">Contact Support</a>
                                <a href="#privacy">Privacy Policy</a>
                            </div>
                        </div>
                    </div>
                <div className="footer-bottom">
                    <div className="contact-info">
                        groupaproject100@gmail.com
                    </div>
                </div>

                <button 
                    className="scroll-top-btn" 
                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                    style={{ 
                        position: 'fixed', 
                        bottom: '30px', 
                        right: '30px',
                        opacity: scrollY > 300 ? 1 : 0,
                        transition: 'opacity 0.3s, transform 0.3s',
                        zIndex: 1001,
                        background: 'rgba(0, 212, 255, 0.2)',
                        color: 'var(--accent-primary)',
                        border: '2px solid var(--accent-primary)',
                        borderRadius: '50%',
                        width: '60px',
                        height: '60px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '24px',
                        cursor: 'pointer'
                    }}
                    title="Scroll to Top"
                >
                    ⬆
                </button>
                </div>
            </footer>
        </div>
    )
}

