import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { showMessage } from '../utils/notifications';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

function Login() {
    const navigate = useNavigate();
    const { login, users, loggedInUser } = useAppContext();
    const [formData, setFormData] = useState({
        loginIdentifier: '',
        loginPassword: ''
    });
    const [message, setMessage] = useState({ text: '', type: '' });
    const [showAdminModal, setShowAdminModal] = useState(false);
    const [adminPassword, setAdminPassword] = useState('');

    // Redirect if already logged in
    useEffect(() => {
        if (loggedInUser) {
            navigate(loggedInUser.isAdmin ? '/admin' : '/dashboard');
        }
    }, [loggedInUser, navigate]);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const fillUserDemo = async () => {
        const result = await login('demo', 'demo123');
        if (result.success) {
            showMessage('Logged in as Demo User!', 'success');
            setTimeout(() => navigate('/dashboard'), 1000);
        } else {
            showMessage(result.error || 'Login failed', 'error');
        }
    };

    const fillAdminDemo = () => {
        setShowAdminModal(true);
    };

    const handleAdminLogin = async (e) => {
        e.preventDefault();
        if (adminPassword === 'suhani123') {
            const result = await login('admin', 'suhani123');
            if (result.success) {
                showMessage(`Logged in as Admin!`, 'success');
                setShowAdminModal(false);
                setAdminPassword('');
                setTimeout(() => navigate('/admin'), 1000);
            } else {
                showMessage(result.error || 'Login failed', 'error');
            }
        } else {
            showMessage('Incorrect admin password!', 'error');
            setAdminPassword('');
        }
    };

    const closeAdminModal = () => {
        setShowAdminModal(false);
        setAdminPassword('');
    };

    const loginUser = async (e) => {
        e.preventDefault();
        
        const { loginIdentifier, loginPassword } = formData;
        
        if (!loginIdentifier || !loginPassword) {
            setMessage({ text: 'Please enter both username/email and password', type: 'error' });
            return;
        }
        
        // Try to login via API
        const result = await login(loginIdentifier, loginPassword);
        
        if (result.success) {
            const isAdmin = result.user.role === 'admin';
            setMessage({ text: `${isAdmin ? 'Admin' : 'User'} login successful! Redirecting...`, type: 'success' });
            setTimeout(() => navigate(isAdmin ? '/admin' : '/dashboard'), 1000);
        } else {
            setMessage({ text: result.error || 'Invalid username or password', type: 'error' });
        }
    };

    return (
        <div className="auth-page">
            <Navbar />

            <section className="auth-section">
                <div className="auth-container">
                    <div className="auth-card">
                        <div className="auth-header">
                            <h1>Welcome Back</h1>
                            <p>Login to access your dashboard</p>
                        </div>

                        <div id="messageContainer">
                            {message.text && (
                                <div className={`inline-message inline-${message.type}`}>
                                    {message.text}
                                </div>
                            )}
                        </div>

                        <form id="loginForm" className="auth-form" onSubmit={loginUser}>
                            <div className="form-group">
                                <label htmlFor="loginIdentifier">Username or Email</label>
                                <input 
                                    type="text" 
                                    id="loginIdentifier" 
                                    name="loginIdentifier" 
                                    value={formData.loginIdentifier}
                                    onChange={handleChange}
                                    required 
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="loginPassword">Password</label>
                                <input 
                                    type="password" 
                                    id="loginPassword" 
                                    name="loginPassword" 
                                    value={formData.loginPassword}
                                    onChange={handleChange}
                                    required 
                                />
                            </div>

                            <button type="submit" className="btn-login btn-full">Login</button>
                        </form>

                        <div className="demo-accounts">
                            <p>🚀 Quick Demo Login:</p>
                            <div className="demo-buttons">
                                <button className="btn-demo" onClick={fillUserDemo}>👤 Log in as Demo User</button>
                                <button className="btn-demo admin" onClick={fillAdminDemo}>👨‍💼 Log in as Admin</button>
                            </div>
                        </div>

                        <div className="auth-footer">
                            <p>Don't have an account? <Link to="/register">Register here</Link></p>
                            <p><Link to="/">← Back to Home</Link></p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Admin Password Modal */}
            {showAdminModal && (
                <div className="admin-modal-overlay">
                    <div className="admin-modal-content">
                        <button className="modal-close" onClick={closeAdminModal} type="button">×</button>
                        <div className="modal-header">
                            <h2>🔐 Admin Access</h2>
                            <p>Enter password to login as admin</p>
                        </div>
                        <form onSubmit={handleAdminLogin} className="modal-form">
                            <div className="form-group">
                                <label htmlFor="adminPassword">Admin Password</label>
                                <input
                                    type="password"
                                    id="adminPassword"
                                    value={adminPassword}
                                    onChange={(e) => setAdminPassword(e.target.value)}
                                    placeholder="Enter admin password"
                                    autoFocus
                                    required
                                />
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn-secondary" onClick={closeAdminModal}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn-primary">
                                    Login as Admin
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Login;
