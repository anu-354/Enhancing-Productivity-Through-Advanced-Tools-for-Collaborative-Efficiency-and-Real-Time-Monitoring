import { useState, useEffect } from 'react';
import axios from 'axios';

const useFetchTask = () => {
  const [task, setTask] = useState(null); // Store task data
  const [loading, setLoading] = useState(true); // Loading state
  const [error, setError] = useState(null); // Error state
  const [totalDays, setTotalDays] = useState(0); // Track total days
  const [daysSubmitted, setDaysSubmitted] = useState(0); // Track number of days submitted

  useEffect(() => {
    const fetchTaskData = async () => {
      try {
        setLoading(true);
        const loggedInEmail = localStorage.getItem('loggedInEmail'); // Get the logged-in email

        if (!loggedInEmail) {
          throw new Error('No email found for the logged-in user.');
        }

        // Use the logged-in email to fetch the task data
        const response = await axios.get('http://localhost:5000/api/task', {
          params: { email: loggedInEmail }, // Pass email as a query parameter
        });

        const task = response.data;

        // Calculate total days between start date and deadline
        const daysBetween = Math.ceil((new Date(task.endDate) - new Date(task.startDate)) / (1000 * 60 * 60 * 24));
        setTotalDays(daysBetween);

        // Optionally set days submitted from task data if it's saved
        setDaysSubmitted(task.submissions ? task.submissions.length : 0);

        // Set the task data
        setTask(task);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching task data:', err);
        setError(err.message); // Set error message
        setLoading(false);
      }
    };

    fetchTaskData();
  }, []); // Empty dependency array to run once when the component mounts

  return { task, loading, error }; // Return task, loading, and error
};

export default useFetchTask;
