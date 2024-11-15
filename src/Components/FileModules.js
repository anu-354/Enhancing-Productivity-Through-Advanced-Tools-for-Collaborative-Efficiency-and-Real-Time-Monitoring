// src/components/FileModules.js
import React, { useState } from 'react';
import axios from 'axios';
import Sidebar from './Sidebar';
import './FileModules.css';

const FileModules = () => {
    const [moduleId, setModuleId] = useState('');
    const [files, setFiles] = useState([]);
    const [error, setError] = useState('');
    const [showInput, setShowInput] = useState(false);

    // Function to handle search button click
    const handleSearchClick = () => {
        setShowInput(true);
    };

    // Function to handle form submission
    const handleSearch = async (e) => {
        e.preventDefault();
        if (moduleId) {
            try {
                const response = await axios.get(`http://localhost:5000/api/files/${moduleId}`);
                setFiles(response.data.files);
                setError(''); // Clear any previous errors
            } catch (err) {
                console.error('Error fetching files:', err.response ? err.response.data : err.message);
                setError('Error fetching files. Please ensure the Module ID is correct.');
                setFiles([]); // Clear files on error
            }
        }
    };

    return (
        <div className="team-lead-interface">
            <Sidebar />
            <main className="main-content">
                <h1>File Modules</h1>
                <p>Manage and review files and modules here.</p>
                {!showInput ? (
                    <button onClick={handleSearchClick} className="btn btn-primary search-btn">
                        Search Files by Module ID
                    </button>
                ) : (
                    <form onSubmit={handleSearch} className="search-form">
                        <input
                            type="text"
                            value={moduleId}
                            onChange={(e) => setModuleId(e.target.value)}
                            placeholder="Enter Module ID"
                            className="form-control module-input"
                        />
                        <button type="submit" className="btn btn-primary mt-2">
                            Submit
                        </button>
                    </form>
                )}

                {error && <div className="alert alert-danger mt-3 error-message">{error}</div>}

                {files.length > 0 && (
                    <div className="files-list mt-3">
                        <h2>Files for Module ID: {moduleId}</h2>
                        <ul className="file-list">
                            {files.map((file, index) => (
                                <li key={index} className="file-item">
                                    <strong>Day {file.dayIndex}</strong>
                                    <a
                                        href={file.fileUrl}
                                        download
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="file-link"
                                    >
                                        Download
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </main>
        </div>
    );
};

export default FileModules;
