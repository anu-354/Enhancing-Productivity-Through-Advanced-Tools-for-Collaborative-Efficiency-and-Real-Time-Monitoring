// src/Components/Sidebar.js
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Sidebar.css';

const Sidebar = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('userRole');
        navigate('/');
    };

    return (
        <aside className="sidebar">
            <div className="sidebar-header">
                <h2>Team Lead Panel</h2>
            </div>
            <nav className="sidebar-nav">
                <Link to="/team-lead-interface">Dashboard</Link>
                <Link to="/create-task">Create Task</Link>
                {/* <Link to="/progress">Progress</Link> */}
                <Link to="/file-modules">File Modules</Link>
                <button className="logout-btn" onClick={handleLogout}>Logout</button>
            </nav>
        </aside>
    );
};

export default Sidebar;
