import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import Navbar from '../components/Navbar';
import { showMessage, showConfirmModal } from '../utils/notifications';

function Admin() {
    const navigate = useNavigate();
    const { 
        loggedInUser, 
        users, 
        applications, 
        internships,
        updateApplicationStatus, 
        deleteApplication,
        addTaskFeedback,
        addAdminFeedback 
    } = useAppContext();
    const [activeTab, setActiveTab] = useState('applications');
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [feedbackForm, setFeedbackForm] = useState({ feedback: '', evaluation: 'Good' });
    const [taskFeedbackForm, setTaskFeedbackForm] = useState({ taskId: null, feedback: '' });
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalInternships: 6,
        totalApplications: 0,
        activeUsers: 0
    });

    useEffect(() => {
        if (!loggedInUser) {
            showMessage('Please login to access this page', 'warning');
            setTimeout(() => navigate('/login'), 1000);
            return;
        }
        
        if (!loggedInUser.isAdmin) {
            showMessage('Access denied. Admin privileges required.', 'error');
            setTimeout(() => navigate('/dashboard'), 1000);
            return;
        }
        
        calculateStats();
    }, [loggedInUser, users, applications, navigate]);

    const calculateStats = () => {
        const activeUserEmails = new Set(applications.map(app => app.userId));
        setStats({
            totalUsers: users.length,
            totalInternships: internships.length,
            totalApplications: applications.length,
            activeUsers: activeUserEmails.size
        });
    };

    const viewStudentDetails = (userEmail) => {
        const student = users.find(u => u.email === userEmail);
        const studentApps = applications.filter(app => app.userId === userEmail);
        setSelectedStudent({
            ...student,
            applications: studentApps
        });
    };

    const handleUpdateStatus = (applicationId, newStatus) => {
        updateApplicationStatus(applicationId, newStatus);
        showMessage(`Application status updated to ${newStatus}`, 'success');
    };

    const handleDeleteApplication = (applicationId) => {
        showConfirmModal('Are you sure you want to delete this application?', () => {
            deleteApplication(applicationId);
            showMessage('Application deleted successfully', 'success');
            if (selectedStudent) {
                viewStudentDetails(selectedStudent.email);
            }
        });
    };

    const handleAddFeedback = (applicationId) => {
        if (!feedbackForm.feedback.trim()) {
            showMessage('Please enter feedback', 'warning');
            return;
        }
        addAdminFeedback(applicationId, feedbackForm.feedback, feedbackForm.evaluation);
        showMessage('Feedback saved successfully', 'success');
        setFeedbackForm({ feedback: '', evaluation: 'Good' });
        if (selectedStudent) {
            viewStudentDetails(selectedStudent.email);
        }
    };

    const handleAddTaskFeedback = (applicationId) => {
        if (!taskFeedbackForm.feedback.trim()) {
            showMessage('Please enter task feedback', 'warning');
            return;
        }
        addTaskFeedback(applicationId, taskFeedbackForm.taskId, taskFeedbackForm.feedback);
        showMessage('Task feedback saved successfully', 'success');
        setTaskFeedbackForm({ taskId: null, feedback: '' });
        if (selectedStudent) {
            viewStudentDetails(selectedStudent.email);
        }
    };

    const getInitials = (name) => {
        if (!name) return 'AD';
        const nameParts = name.split(' ');
        return nameParts.map(part => part.charAt(0).toUpperCase()).join('');
    };

    if (!loggedInUser) return null;

    return (
        <>
            <Navbar />
            
            {/* Page Header */}
            <section className="page-header admin-header">
                <div className="container">
                    <div className="admin-profile-header">
                        <div className="admin-avatar">
                            <span id="adminInitials">{getInitials(loggedInUser.username)}</span>
                        </div>
                        <div className="admin-info">
                            <h1>👨‍💼 Admin Control Panel</h1>
                            <p className="admin-name" id="adminName">{loggedInUser.username}</p>
                            <p className="admin-role">
                                System Administrator • <span id="adminRollId">{loggedInUser.rollId ? `ID: ${loggedInUser.rollId}` : ''}</span> • <span id="adminCollege">{loggedInUser.college || 'KL University'}</span>
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Admin Stats */}
            <section className="admin-stats">
                <div className="container">
                    <div className="stats-grid">
                        <div className="stat-card stat-users">
                            <div className="stat-icon">👥</div>
                            <div className="stat-info">
                                <h3>{stats.totalUsers}</h3>
                                <p>Total Users</p>
                            </div>
                        </div>
                        <div className="stat-card stat-internships">
                            <div className="stat-icon">💼</div>
                            <div className="stat-info">
                                <h3>{stats.totalInternships}</h3>
                                <p>Total Internships</p>
                            </div>
                        </div>
                        <div className="stat-card stat-applications">
                            <div className="stat-icon">📋</div>
                            <div className="stat-info">
                                <h3>{stats.totalApplications}</h3>
                                <p>Total Applications</p>
                            </div>
                        </div>
                        <div className="stat-card stat-active">
                            <div className="stat-icon">✓</div>
                            <div className="stat-info">
                                <h3>{stats.activeUsers}</h3>
                                <p>Active Users</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Tab Navigation */}
            <section className="admin-section">
                <div className="container">
                    <div className="admin-tabs">
                        <button 
                            className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}
                            onClick={() => setActiveTab('users')}
                        >
                            👥 User Management
                        </button>
                        <button 
                            className={`tab-btn ${activeTab === 'applications' ? 'active' : ''}`}
                            onClick={() => setActiveTab('applications')}
                        >
                            📋 Application Manager
                        </button>
                        <button 
                            className={`tab-btn ${activeTab === 'evaluations' ? 'active' : ''}`}
                            onClick={() => setActiveTab('evaluations')}
                        >
                            📊 Student Progress & Evaluation
                        </button>
                    </div>

                    {/* User Management Tab */}
                    {activeTab === 'users' && (
                        <div className="tab-content active">
                            <div className="section-header">
                                <h2>Registered Users</h2>
                                <button className="btn-danger" onClick={clearAllUsers}>
                                    🗑️ Clear All Users
                                </button>
                            </div>
                            <div className="admin-table-container">
                                {users.length === 0 ? (
                                    <p className="no-data">No users registered yet</p>
                                ) : (
                                    <table className="admin-table">
                                        <thead>
                                            <tr>
                                                <th>#</th>
                                                <th>Username</th>
                                                <th>Email</th>
                                                <th>College</th>
                                                <th>Role</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {users.map((u, index) => (
                                                <tr key={index}>
                                                    <td>{index + 1}</td>
                                                    <td>{u.username}</td>
                                                    <td>{u.email}</td>
                                                    <td>{u.college || 'N/A'}</td>
                                                    <td>{u.isAdmin ? 'Admin' : 'Student'}</td>
                                                    <td>
                                                        {!u.isAdmin && (
                                                            <button 
                                                                className="btn-small btn-primary"
                                                                onClick={() => viewStudentDetails(u.email)}
                                                            >
                                                                View Progress
                                                            </button>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Application Manager Tab */}
                    {activeTab === 'applications' && (
                        <div className="tab-content active">
                            <div className="section-header">
                                <h2>Application Manager</h2>
                                <p className="section-subtitle">Manage all internship applications</p>
                            </div>
                            <div className="admin-table-container">
                                {allApplications.length === 0 ? (
                                    <p className="no-data">No applications submitted yet</p>
                                ) : (
                                    <table className="admin-table">
                                        <thead>
                                            <tr>
                                                <th>#</th>
                                                <th>Student</th>
                                                <th>Email</th>
                                                <th>Internship</th>
                                                <th>Company</th>
                                                <th>Applied On</th>
                                                <th>Status</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {allApplications.map((app, index) => (
                                                <tr key={index}>
                                                    <td>{index + 1}</td>
                                                    <td>{app.userName || 'N/A'}</td>
                                                    <td>{app.userEmail}</td>
                                                    <td>{app.internshipTitle}</td>
                                                    <td>{app.company}</td>
                                                    <td>{new Date(app.appliedDate).toLocaleDateString()}</td>
                                                    <td>
                                                        <span className={`status-badge status-${(app.status || 'pending').toLowerCase().replace(' ', '-')}`}>
                                                            {app.status || 'Pending'}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <div className="action-buttons">
                                                            <select
                                                                value={app.status || 'Pending'}
                                                                onChange={(e) => updateApplicationStatus(app.id, e.target.value)}
                                                                className="status-select"
                                                            >
                                                                <option value="Pending">Pending</option>
                                                                <option value="Under Review">Under Review</option>
                                                                <option value="Accepted">Accepted</option>
                                                                <option value="Rejected">Rejected</option>
                                                            </select>
                                                            <button 
                                                                className="btn-small btn-danger"
                                                                onClick={() => deleteApplication(app.id)}
                                                            >
                                                                🗑️
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Student Progress & Evaluation Tab */}
                    {activeTab === 'evaluations' && (
                        <div className="tab-content active">
                            <div className="section-header">
                                <h2>Student Progress & Evaluation</h2>
                            </div>
                            {selectedStudent ? (
                                <StudentProgressView 
                                    student={selectedStudent}
                                    onClose={() => setSelectedStudent(null)}
                                    onSaveFeedback={addFeedback}
                                />
                            ) : (
                                <div className="students-grid">
                                    {users.filter(u => !u.isAdmin).map((student, index) => {
                                        const studentEnrollments = applications.filter(e => e.userEmail === student.email);
                                        return (
                                            <div key={index} className="student-card" onClick={() => viewStudentDetails(student.email)}>
                                                <div className="student-avatar-small">
                                                    {getInitials(student.username)}
                                                </div>
                                                <div className="student-info-small">
                                                    <h3>{student.username}</h3>
                                                    <p>{student.email}</p>
                                                    <span className="enrollment-count">
                                                        {studentEnrollments.length} internship(s)
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </section>

            <footer className="footer">
                <div className="container">
                    <p>&copy; 2025 InternHub Admin Panel. All rights reserved.</p>
                </div>
            </footer>
        </>
    );
}

// Student Progress View Component
function StudentProgressView({ student, onClose, onSaveFeedback }) {
    const [feedbackData, setFeedbackData] = useState({});

    const handleFeedbackChange = (enrollmentIndex, field, value) => {
        setFeedbackData(prev => ({
            ...prev,
            [enrollmentIndex]: {
                ...prev[enrollmentIndex],
                [field]: value
            }
        }));
    };

    const saveFeedback = (enrollmentIndex) => {
        const data = feedbackData[enrollmentIndex] || {};
        onSaveFeedback(enrollmentIndex, data.feedback || '', data.evaluation || 'Pending');
        setFeedbackData(prev => ({
            ...prev,
            [enrollmentIndex]: {}
        }));
    };

    return (
        <div className="student-detail-view">
            <button className="btn-back" onClick={onClose}>← Back to Students</button>
            <h3>{student.username}'s Progress</h3>
            
            {student.enrollments && student.enrollments.length > 0 ? (
                student.enrollments.map((enrollment, index) => {
                    const enrollments = JSON.parse(localStorage.getItem('enrollments') || '[]');
                    const enrollmentIndex = enrollments.findIndex(
                        e => e.userEmail === student.email && e.internshipId === enrollment.internshipId
                    );
                    
                    return (
                        <div key={index} className="enrollment-detail-card">
                            <h4>{enrollment.internshipTitle}</h4>
                            <p><strong>Company:</strong> {enrollment.company}</p>
                            
                            {/* Progress */}
                            <div className="progress-section">
                                <p><strong>Progress:</strong> {enrollment.progress || 0}%</p>
                                <div className="progress-bar-container">
                                    <div 
                                        className="progress-bar-fill" 
                                        style={{width: `${enrollment.progress || 0}%`}}
                                    ></div>
                                </div>
                            </div>

                            {/* Tasks */}
                            <div className="tasks-section">
                                <h5>📋 Tasks ({enrollment.tasks?.length || 0})</h5>
                                {enrollment.tasks && enrollment.tasks.length > 0 ? (
                                    <ul className="task-list-admin">
                                        {enrollment.tasks.map((task, taskIndex) => (
                                            <li key={taskIndex} className={`task-item-admin ${task.status}`}>
                                                <span className="task-status-icon">
                                                    {task.status === 'Done' ? '✓' : '○'}
                                                </span>
                                                <span className="task-title">{task.title}</span>
                                                {task.notes && <span className="task-notes">({task.notes})</span>}
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="no-tasks">No tasks added yet</p>
                                )}
                            </div>

                            {/* Feedback Section */}
                            <div className="feedback-section">
                                <h5>💬 Mentor Feedback</h5>
                                <textarea
                                    placeholder="Add feedback for this student..."
                                    value={feedbackData[enrollmentIndex]?.feedback || enrollment.feedback || ''}
                                    onChange={(e) => handleFeedbackChange(enrollmentIndex, 'feedback', e.target.value)}
                                    rows="3"
                                ></textarea>
                                
                                <div className="evaluation-select">
                                    <label>Evaluation Status:</label>
                                    <select
                                        value={feedbackData[enrollmentIndex]?.evaluation || enrollment.evaluation || 'Pending'}
                                        onChange={(e) => handleFeedbackChange(enrollmentIndex, 'evaluation', e.target.value)}
                                    >
                                        <option value="Pending">Pending</option>
                                        <option value="Completed">Completed</option>
                                        <option value="Needs Improvement">Needs Improvement</option>
                                    </select>
                                </div>
                                
                                <button 
                                    className="btn-primary btn-small"
                                    onClick={() => saveFeedback(enrollmentIndex)}
                                >
                                    💾 Save Feedback
                                </button>
                                
                                {enrollment.feedbackDate && (
                                    <p className="feedback-date">
                                        Last updated: {new Date(enrollment.feedbackDate).toLocaleDateString()}
                                    </p>
                                )}
                            </div>
                        </div>
                    );
                })
            ) : (
                <p className="no-enrollments">This student hasn't enrolled in any internships yet.</p>
            )}
        </div>
    );
}

export default Admin;
