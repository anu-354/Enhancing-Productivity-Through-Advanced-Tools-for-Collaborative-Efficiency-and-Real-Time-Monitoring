// src/components/CreateTask.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './CreateTask.css';
import axios from 'axios';

const CreateTask = () => {
    const [teamLead, setTeamLead] = useState('');
    const [taskName, setTaskName] = useState('');
    const [assignEmail, setAssignEmail] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [taskFile, setTaskFile] = useState(null);
    const [moduleId, setModuleId] = useState(''); // New state for moduleId
    const navigate = useNavigate();

    const handleFileChange = (e) => {
        setTaskFile(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Create a new FormData object to manage the task data including the file
        const formData = new FormData();
        formData.append('teamLead', teamLead);
        formData.append('taskName', taskName);
        formData.append('assignEmail', assignEmail);
        formData.append('startDate', startDate);
        formData.append('endDate', endDate);
        formData.append('moduleId', moduleId); // Include moduleId in the form data
        if (taskFile) {
            formData.append('taskFile', taskFile);
        }

        try {
            // Send POST request to backend
            const response = await axios.post('http://localhost:5000/api/tasks', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (response.status === 201) {
                // Assuming task is successfully created, redirect to Progress page
                navigate('/team-lead-interface');
            }
        } catch (error) {
            console.error('Error creating task:', error);
        }
    };

    return (
        <div className="create-task-container">
            <h2>Create Task</h2>
            <form onSubmit={handleSubmit}>
                <label>Team Lead:</label>
                <select value={teamLead} onChange={(e) => setTeamLead(e.target.value)} required>
                    <option value="">Select</option>
                    <option value="yes">Yes</option>
                    <option value="no">No</option>
                </select>
                <label>Task Name</label>
                <input
                    type="text"
                    placeholder="Task Name"
                    value={taskName}
                    onChange={(e) => setTaskName(e.target.value)}
                    required
                />
                <label>Assign Email</label>
                <input
                    type="email"
                    placeholder="Assign Email"
                    value={assignEmail}
                    onChange={(e) => setAssignEmail(e.target.value)}
                    required
                />
                <label>Module ID</label> 
                <input
                    type="text"
                    placeholder="Module ID"
                    value={moduleId}
                    onChange={(e) => setModuleId(e.target.value)}
                    required
                />
                <label>Task Description (File Upload):</label>
                <input
                    type="file"
                    accept=".pdf,.doc,.docx,.txt"
                    onChange={handleFileChange}
                    required
                />
                <label>Start Date</label>
                <input
                    type="date"
                    placeholder="Start Date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    required
                />
                <label>End Date</label>
                <input
                    type="date"
                    placeholder="End Date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    required
                />
                
                <button type="submit">Create Task</button>
            </form>
        </div>
    );
};

export default CreateTask;
