// src/components/EmployeeDashboard.js
import React from 'react';
import EmployeeSidebar from './EmployeeSidebar'; // Keep sidebar consistent
// import './EmployeeDashboard.css';

const EmployeeDashboard = () => {
    return (
        <div className="employee-interface">
            <EmployeeSidebar />
            <main className="main-content">
                <h1>Employee Dashboard</h1>
                <p>Overview of tasks, progress, and upcoming deadlines.</p>
            </main>
        </div>
    );
};

export default EmployeeDashboard;
