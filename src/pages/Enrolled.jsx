import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { showMessage, showConfirmModal } from '../utils/notifications';

function Enrolled() {
    const navigate = useNavigate();
    const { 
        loggedInUser, 
        getUserApplications, 
        addTaskToApplication, 
        updateTaskStatus, 
        deleteTask,
        deleteApplication,
        internships 
    } = useAppContext();
    const [enrolledInternships, setEnrolledInternships] = useState([]);
    const [expandedInternship, setExpandedInternship] = useState(null);
    const [newTask, setNewTask] = useState({ title: '', description: '' });

    useEffect(() => {
        if (!loggedInUser) {
            showMessage('Please login to access this page', 'warning');
            setTimeout(() => navigate('/login'), 1000);
            return;
        }
        loadEnrolledInternships();
    }, [loggedInUser, navigate]);

    const loadEnrolledInternships = () => {
        const userApps = getUserApplications();
        // Enrich with internship details
        const enrichedApps = userApps.map(app => {
            const internship = internships.find(i => i.id === app.internshipId);
            return {
                ...app,
                internshipTitle: internship?.title || app.internshipTitle,
                company: internship?.company || app.company
            };
        });
        setEnrolledInternships(enrichedApps);
    };

    const handleAddTask = (applicationId) => {
        if (!newTask.title.trim()) {
            showMessage('Task title is required', 'warning');
            return;
        }

        addTaskToApplication(applicationId, newTask);
        showMessage('Task added successfully', 'success');
        setNewTask({ title: '', description: '' });
        loadEnrolledInternships();
    };

    const handleToggleTaskStatus = (applicationId, taskId, currentStatus) => {
        const newStatus = currentStatus === 'Completed' ? 'Pending' : 'Completed';
        updateTaskStatus(applicationId, taskId, newStatus);
        showMessage('Task status updated', 'success');
        loadEnrolledInternships();
    };

    const handleDeleteTask = (applicationId, taskId) => {
        showConfirmModal('Are you sure you want to delete this task?', () => {
            deleteTask(applicationId, taskId);
            showMessage('Task deleted successfully', 'success');
            loadEnrolledInternships();
        });
    };

    const toggleExpanded = (applicationId) => {
        setExpandedInternship(expandedInternship === applicationId ? null : applicationId);
        setNewTask({ title: '', description: '' });
    };

    if (!loggedInUser) return null;

    return (
        <>
            <Navbar />
            
            {/* Page Header */}
            <section className="page-header">
                <div className="container">
                    <h1>My Enrolled Internships</h1>
                    <p>View and manage your internship applications</p>
                </div>
            </section>

            {/* Enrolled Internships Section */}
            <section className="enrolled-section">
                <div className="container">
                    <div className="enrolled-header">
                        <h2>Your Applications (<span id="enrolledCount">{enrolledInternships.length}</span>)</h2>
                        {enrolledInternships.length > 0 && (
                            <button className="btn btn-secondary" onClick={clearAllEnrollments}>Clear All</button>
                        )}
                    </div>
                    
                    <div className="enrollments-container" id="enrolledTableContainer">
                        {enrolledInternships.length === 0 ? (
                            <p className="no-applications">
                                You haven't applied to any internships yet. <Link to="/internships">Browse internships</Link>
                            </p>
                        ) : (
                            enrolledInternships.map((enrollment, index) => (
                                <div key={index} className="enrollment-card">
                                    <div className="enrollment-header">
                                        <div className="enrollment-info">
                                            <h3>{enrollment.internshipTitle}</h3>
                                            <p className="company-name">{enrollment.company}</p>
                                            <p className="applied-date">Applied: {new Date(enrollment.appliedAt).toLocaleDateString()}</p>
                                        </div>
                                        <div className="enrollment-actions">
                                            <button 
                                                className="btn-expand"
                                                onClick={() => toggleExpanded(enrollment.id)}
                                            >
                                                {expandedInternship === enrollment.id ? '▼ Collapse' : '▶ Tasks & Progress'}
                                            </button>
                                            <button 
                                                className="btn-remove"
                                                onClick={() => deleteApplication(enrollment.id)}
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    </div>

                                    {/* Progress Bar */}
                                    <div className="progress-section">
                                        <div className="progress-header">
                                            <span>Progress</span>
                                            <span className="progress-percentage">{enrollment.progress || 0}%</span>
                                        </div>
                                        <div className="progress-bar-container">
                                            <div 
                                                className="progress-bar-fill" 
                                                style={{width: `${enrollment.progress || 0}%`}}
                                            ></div>
                                        </div>
                                    </div>

                                    {/* Expanded Tasks & Feedback Section */}
                                    {expandedInternship === enrollment.id && (
                                        <div className="tasks-management-section">
                                            {/* Admin Feedback Display */}
                                            {(enrollment.adminFeedback || enrollment.evaluation !== 'Not Evaluated') && (
                                                <div className="feedback-display">
                                                    <h4>💬 Admin Feedback</h4>
                                                    {enrollment.adminFeedback && <p className="feedback-text">{enrollment.adminFeedback}</p>}
                                                    <span className={`evaluation-badge evaluation-${enrollment.evaluation?.toLowerCase().replace(' ', '-')}`}>
                                                        {enrollment.evaluation || 'Not Evaluated'}
                                                    </span>
                                                </div>
                                            )}

                                            {/* Task List */}
                                            <div className="task-list-section">
                                                <h4>📋 Tasks ({enrollment.tasks?.length || 0})</h4>
                                                
                                                {enrollment.tasks && enrollment.tasks.length > 0 && (
                                                    <ul className="task-list">
                                                        {enrollment.tasks.map((task) => (
                                                            <li key={task.id} className={`task-item ${task.status.toLowerCase()}`}>
                                                                <button 
                                                                    className="task-checkbox"
                                                                    onClick={() => handleToggleTaskStatus(enrollment.id, task.id, task.status)}
                                                                >
                                                                    {task.status === 'Completed' ? '✓' : '○'}
                                                                </button>
                                                                <div className="task-content">
                                                                    <span className="task-title">{task.title}</span>
                                                                    {task.description && <span className="task-notes">{task.description}</span>}
                                                                    {task.feedback && (
                                                                        <div className="task-feedback">
                                                                            <strong>Admin Feedback:</strong> {task.feedback}
                                                                        </div>
                                                                    )}
                                                                    {task.completedAt && (
                                                                        <span className="task-completed-date">
                                                                            Completed: {new Date(task.completedAt).toLocaleDateString()}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                <button 
                                                                    className="task-delete"
                                                                    onClick={() => handleDeleteTask(enrollment.id, task.id)}
                                                                >
                                                                    🗑️
                                                                </button>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                )}

                                                {/* Add Task Form */}
                                                <div className="add-task-form">
                                                    <input
                                                        type="text"
                                                        placeholder="Task title *"
                                                        value={newTask.title}
                                                        onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                                                        onKeyPress={(e) => {
                                                            if (e.key === 'Enter') handleAddTask(enrollment.id);
                                                        }}
                                                    />
                                                    <textarea
                                                        placeholder="Description (optional)"
                                                        value={newTask.description}
                                                        onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                                                        rows="2"
                                                    />
                                                    <button 
                                                        className="btn-add-task"
                                                        onClick={() => handleAddTask(enrollment.id)}
                                                    >
                                                        ➕ Add Task
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </section>

            <Footer />
        </>
    );
}

export default Enrolled;
