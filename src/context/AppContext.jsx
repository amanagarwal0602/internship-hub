import React, { createContext, useContext, useEffect, useState } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';
import api from '../api/index.js';

// Create Context
const AppContext = createContext();

// Custom hook to use the AppContext
export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within AppContextProvider');
  }
  return context;
};

// Context Provider Component
export const AppContextProvider = ({ children }) => {
  // State management - using API + localStorage for logged in user only
  const [loggedInUser, setLoggedInUser] = useLocalStorage('loggedInUser', null);
  const [users, setUsers] = useState([]);
  const [internships, setInternships] = useState([]);
  const [applications, setApplications] = useState([]);
  const [darkMode, setDarkMode] = useLocalStorage('darkMode', false);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch all data on mount
  useEffect(() => {
    fetchAllData();
  }, []);

  // Apply dark mode class to body
  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, [darkMode]);

  // Fetch all data from API
  const fetchAllData = async () => {
    setIsLoading(true);
    try {
      // Fetch internships, users, and applications in parallel
      const [internshipsData, usersData, applicationsData] = await Promise.all([
        api.internships.getAll().catch(() => []),
        api.users.getAll().catch(() => []),
        loggedInUser ? api.applications.getAll(loggedInUser.id).catch(() => []) : Promise.resolve([])
      ]);

      setInternships(internshipsData.length > 0 ? internshipsData : getFallbackInternships());
      setUsers(usersData);
      setApplications(applicationsData);
    } catch (error) {
      console.error('Error fetching data:', error);
      // Use fallback data if API fails
      setInternships(getFallbackInternships());
    } finally {
      setIsLoading(false);
    }
  };

  // Fallback internships data for offline mode
  const getFallbackInternships = () => [
    {
      _id: '1',
      title: "Frontend Developer Intern",
      company: "TechCorp Solutions",
      duration: "3 Months",
      location: "Remote",
      stipend: "₹15,000/month",
      description: "Work on modern web applications using React, Vue, or Angular.",
      skills: ["HTML", "CSS", "JavaScript", "React"],
      type: "Full-time"
    },
    {
      _id: '2',
      title: "Backend Developer Intern",
      company: "CloudTech Systems",
      duration: "4 Months",
      location: "Hyderabad",
      stipend: "₹18,000/month",
      description: "Build scalable APIs and work with databases, microservices, and cloud platforms.",
      skills: ["Node.js", "MongoDB", "REST API", "Docker"],
      type: "Full-time"
    },
    {
      _id: '3',
      title: "Data Science Intern",
      company: "Analytics Pro",
      duration: "6 Months",
      location: "Pune",
      stipend: "₹20,000/month",
      description: "Work on machine learning projects and data analysis.",
      skills: ["Python", "TensorFlow", "Pandas", "Machine Learning"],
      type: "Full-time"
    }
  ];

  // Login function
  const login = async (username, password) => {
    try {
      // Try API first
      const userData = await api.users.login({ username, password });
      setLoggedInUser(userData);
      // Fetch user's applications after login
      const userApps = await api.applications.getAll(userData.id);
      setApplications(userApps);
      return { success: true, user: userData };
    } catch (error) {
      console.log('API login failed, trying offline mode...', error);
      
      // Fallback to demo users for offline mode
      const demoUsers = [
        {
          id: 'demo-user',
          username: 'demo',
          email: 'demo@internhub.com',
          fullName: 'Demo Student',
          role: 'student',
          password: 'demo123',
          isAdmin: false
        },
        {
          id: 'admin-user',
          username: 'admin',
          email: 'admin@internhub.com',
          fullName: 'Admin User',
          role: 'admin',
          password: 'suhani123',
          isAdmin: true
        }
      ];
      
      const offlineUser = demoUsers.find(u => 
        u.username === username && u.password === password
      );
      
      if (offlineUser) {
        const { password: _, ...userWithoutPassword } = offlineUser;
        setLoggedInUser(userWithoutPassword);
        
        // Load applications from localStorage
        const storedApps = JSON.parse(localStorage.getItem('applications') || '[]');
        const userApps = storedApps.filter(app => app.userId === offlineUser.id);
        setApplications(userApps);
        
        return { success: true, user: userWithoutPassword, offline: true };
      }
      
      return { success: false, error: 'Invalid credentials' };
    }
  };

  // Logout function
  const logout = () => {
    setLoggedInUser(null);
    setApplications([]);
  };

  // Register new user
  const register = async (newUser) => {
    try {
      const userData = await api.users.register(newUser);
      return { success: true, user: userData };
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, error: error.message };
    }
  };

  // Apply for internship
  const applyForInternship = async (internshipId) => {
    if (!loggedInUser) return false;
    
    try {
      const applicationData = {
        userId: loggedInUser.id,
        internshipId: internshipId
      };
      
      const newApplication = await api.applications.create(applicationData);
      setApplications([...applications, newApplication]);
      return true;
    } catch (error) {
      console.log('API apply failed, using offline mode...');
      
      // Offline fallback - save to localStorage
      const internship = internships.find(i => i._id === internshipId || i.id === internshipId);
      const offlineApp = {
        _id: Date.now().toString(),
        userId: loggedInUser.id,
        internshipId: internship,
        status: 'Pending',
        appliedDate: new Date().toISOString(),
        adminFeedback: ''
      };
      
      const updatedApps = [...applications, offlineApp];
      setApplications(updatedApps);
      
      // Save to localStorage
      localStorage.setItem('applications', JSON.stringify(updatedApps));
      
      return true;
    }
  };

  // Get user applications
  const getUserApplications = () => {
    if (!loggedInUser) return [];
    return applications.filter(app => app.userId._id === loggedInUser.id || app.userId === loggedInUser.id);
  };

  // Check if user has applied for an internship
  const hasApplied = (internshipId) => {
    if (!loggedInUser) return false;
    return applications.some(
      app => {
        const userId = app.userId._id || app.userId;
        const appInternshipId = app.internshipId._id || app.internshipId;
        return userId === loggedInUser.id && appInternshipId === internshipId;
      }
    );
  };

  // Toggle dark mode
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  // Update application status (admin only)
  const updateApplicationStatus = async (applicationId, newStatus) => {
    try {
      const updatedApp = await api.applications.update(applicationId, { status: newStatus });
      const updatedApplications = applications.map(app =>
        app._id === applicationId ? updatedApp : app
      );
      setApplications(updatedApplications);
      return true;
    } catch (error) {
      console.error('Update status error:', error);
      return false;
    }
  };

  // Delete application (admin only)
  const deleteApplication = async (applicationId) => {
    try {
      await api.applications.delete(applicationId);
      const updatedApplications = applications.filter(app => app._id !== applicationId);
      setApplications(updatedApplications);
      return true;
    } catch (error) {
      console.error('Delete application error:', error);
      return false;
    }
  };

  // Add task to application (student or admin)
  const addTaskToApplication = async (applicationId, taskData) => {
    try {
      const newTask = await api.tasks.create({
        applicationId: applicationId,
        userId: loggedInUser.id,
        title: taskData.title,
        completed: false
      });
      
      // Refresh applications to get updated data
      await fetchAllData();
      return true;
    } catch (error) {
      console.error('Add task error:', error);
      return false;
    }
  };

  // Update task status
  const updateTaskStatus = async (taskId, completed) => {
    try {
      await api.tasks.update(taskId, { completed });
      // Refresh applications to get updated data
      await fetchAllData();
      return true;
    } catch (error) {
      console.error('Update task error:', error);
      return false;
    }
  };

  // Add feedback to task (admin only)
  const addTaskFeedback = async (taskId, feedback) => {
    try {
      await api.tasks.update(taskId, { adminFeedback: feedback });
      // Refresh applications to get updated data
      await fetchAllData();
      return true;
    } catch (error) {
      console.error('Add feedback error:', error);
      return false;
    }
  };

  // Add admin feedback to application
  // Add admin feedback to application
  const addAdminFeedback = async (applicationId, feedback) => {
    try {
      const updatedApp = await api.applications.update(applicationId, { adminFeedback: feedback });
      const updatedApplications = applications.map(app =>
        app._id === applicationId ? updatedApp : app
      );
      setApplications(updatedApplications);
      return true;
    } catch (error) {
      console.error('Add feedback error:', error);
      return false;
    }
  };

  // Delete task
  const deleteTask = async (taskId) => {
    try {
      await api.tasks.delete(taskId);
      // Refresh applications to get updated data
      await fetchAllData();
      return true;
    } catch (error) {
      console.error('Delete task error:', error);
      return false;
    }
  };

  // Context value
  const value = {
    // State
    loggedInUser,
    users,
    internships,
    applications,
    darkMode,
    isLoading,
    
    // Functions
    login,
    logout,
    register,
    applyForInternship,
    getUserApplications,
    hasApplied,
    toggleDarkMode,
    updateApplicationStatus,
    deleteApplication,
    addTaskToApplication,
    updateTaskStatus,
    addTaskFeedback,
    addAdminFeedback,
    deleteTask,
    fetchAllData // Export this for manual refresh
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export default AppContext;
