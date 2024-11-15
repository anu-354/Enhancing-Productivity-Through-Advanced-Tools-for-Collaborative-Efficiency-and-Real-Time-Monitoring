// routes/task.js
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const nodemailer = require('nodemailer');
const Data = require('../models/Data');
const Task = require('../models/Task');
const upload = require('../middleware/uploads');

const router = express.Router();

// Ensure the uploads folder exists
const uploadDirectory = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDirectory)) {
    fs.mkdirSync(uploadDirectory, { recursive: true });
}

// Multer configuration for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDirectory);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});



// Create transporter object using nodemailer for sending emails
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const generateAccessKey = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
};

// Email function with moduleId included
const sendTaskEmail = async ({ taskName, assignEmail, startDate, endDate, taskFile, accessKey, moduleId, req }, retries = 3) => {
    const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${path.basename(taskFile)}`;

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: assignEmail,
        subject: 'New Task Assigned',
        html: `
            <div style="font-family: Arial; max-width: 600px; padding: 20px; border: 1px solid #ddd;">
                <h2 style="color: #4CAF50;">🎉 New Task Assigned</h2>
                <p>You have been assigned a new task. Please find the details below:</p>
                <p><strong>Task Name:</strong> ${taskName}</p>
                <p><strong>Email:</strong> ${assignEmail}</p>
                <p><strong>Module ID:</strong> ${moduleId}</p>  <!-- New Module ID field in email -->
                <p><strong>Start Date:</strong> ${startDate}</p>
                <p><strong>End Date:</strong> ${endDate}</p>
                <p><strong>Access Key:</strong> ${accessKey}</p>
                <p>You can download the task file <a href="${fileUrl}">here</a>.</p>
                <p>Best regards,<br>Team Management System</p>
            </div>
        `,
        attachments: taskFile ? [{ filename: path.basename(taskFile), path: taskFile }] : []
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Email sent successfully to:', assignEmail);
    } catch (error) {
        console.error('Error sending email:', error);
        if (retries > 0 && error.code === 'ECONNRESET') {
            console.log(`Retrying... Attempts left: ${retries - 1}`);
            await new Promise(res => setTimeout(res, 2000));
            return sendTaskEmail({ taskName, assignEmail, startDate, endDate, taskFile, accessKey, moduleId, req }, retries - 1);
        }
    }
};

// POST request to create a task
router.post('/tasks', upload.single('taskFile'), async (req, res) => {
    const { teamLead, taskName, assignEmail, startDate, endDate, moduleId } = req.body;
    const taskFile = req.file ? req.file.path : null;
    const accessKey = generateAccessKey();

    try {
        // Create a new Task document with moduleId included
        const newTask = new Task({ teamLead, taskName, assignEmail, startDate, endDate, taskFile, accessKey, moduleId });
        await newTask.save();

        // Send email with the task details including moduleId
        sendTaskEmail({ taskName, assignEmail, startDate, endDate, taskFile, accessKey, moduleId, req });

        res.status(201).json({ message: 'Task created and email is being sent', task: newTask });
    } catch (err) {
        res.status(500).json({ error: 'Error creating task', details: err.message });
    }
});

// Fetch all tasks
router.get('/tasks', async (req, res) => {
    try {
        const tasks = await Task.find();
        res.status(200).json(tasks);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Fetch task based on email (assignEmail in the database)
router.get('/task', async (req, res) => {
    const { email } = req.query; // Get email from query parameters

    // Validate that email is provided
    if (!email) {
        return res.status(400).json({ message: 'Email is required' });
    }

    try {
        // Find the task by assigned email (assignEmail)
        const task = await Task.findOne({ assignEmail: email });

        // If no task is found, return a 404 error
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        // If the task is found, return it
        res.status(200).json(task);
    } catch (error) {
        console.error('Error fetching task:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Route to fetch task details by moduleID
router.get('/tasks/:moduleID', async (req, res) => {
  const { moduleID } = req.params; // Extract moduleID from URL parameter

  try {
    // Find the task by moduleID
    const task = await Task.findOne({ moduleId: moduleID });

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Return the task data
    res.status(200).json(task);
  } catch (error) {
    console.error('Error fetching task details:', error);
    res.status(500).json({ message: 'Server error' });
  }
});


// router.get('/data/:assignEmail/count', async (req, res) => {
//   const { email } = req.params;

//   try {
//     // Find the task by moduleId
//     const task = await Task.findOne({ assignEmail:email });

//     if (!task) {
//       return res.status(404).json({ message: 'Task not found' });
//     }

//     // Count the number of submissions
//     const submissionCount = task.submissions.length;

//     res.status(200).json({ count: submissionCount });
//   } catch (error) {
//     console.error('Error fetching submission count:', error);
//     res.status(500).json({ message: 'Server error' });
//   }
// });

// router.post('/data', upload.single('file'), async (req, res) => {
//   const { moduleId, dayIndex } = req.body;

//   if (!req.file) {
//     return res.status(400).send('No file uploaded');
//   }

//   try {
//     const newData = new Data({
//       moduleId,
//       dayIndex,
//       fileUrl: req.file.path // Save the file path
//     });

//     await newData.save();

//     res.status(200).send('File uploaded and data saved successfully');
//   } catch (error) {
//     console.error('Error saving data:', error);
//     res.status(500).send('Failed to save data');
//   }
// });


// router.post('/data', upload.single('file'), async (req, res) => {
//   const { moduleId, dayIndex, assignEmail } = req.body;

//   if (!req.file) {
//     return res.status(400).send('No file uploaded');
//   }

//   try {
//     // Save submission to the data collection
//     const newData = new Data({
//       moduleId,
//       assignEmail,
//       dayIndex,
//       fileUrl: req.file.path // Save the file path
//     });

//     await newData.save();

//     // Update the task with the new submission
//     const task = await Task.findOne({ moduleId, assignEmail });
//     if (task) {
//       task.submissions.push({
//         filePath: req.file.path,
//         assignedEmail: assignEmail,
//         day: `Day-${dayIndex}`,
//       });
//       await task.save();
//     }

//     res.status(200).send('File uploaded and data saved successfully');
//   } catch (error) {
//     console.error('Error saving data:', error);
//     res.status(500).send('Failed to save data');
//   }
// });

// POST endpoint for submitting a task


router.post('/submit-task', upload.single('file'), async (req, res) => {
  console.log('Received data:', req.body);
  console.log('Received file:', req.file);

  try {
    // Extract data from the request body
    const { moduleId, assignEmail, dayIndex } = req.body;
    const fileUrl = req.file.path;  // Get the file path from multer

    // Validate input data
    if (!moduleId || !assignEmail || !dayIndex || !fileUrl) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Step 1: Save the data into the Data collection
    const newData = new Data({
      moduleId,
      assignEmail,
      dayIndex,
      fileUrl
    });

    // Save new data document
    await newData.save();

    // Step 2: Update the Tasks collection
    const submission = {
      filePath: fileUrl,
      assignedEmail: assignEmail,
      day: dayIndex.toString(), // Convert to string if necessary
    };

    // await Task.updateOne(
    //   { 'submission.assignEmail': assignEmail},
    //   { $push: { submissions: submission } }
    // );
  const task = await Task.findOne({ moduleId, assignEmail });
  console.log('Matched Task:', task);
  const result = await Task.updateOne({ moduleId, assignEmail }, { $push: { submissions: submission } });
if (result.matchedCount === 0) {
  console.error('No matching document found');
}
// await Task.updateOne(
//   { moduleId, assignEmail }, // Query matches document with these fields
//   { $push: { submissions: submission } } // Pushes the new submission to the array
// );



    // Step 3: Respond with success message
    return res.status(200).json({ message: 'Task submitted successfully' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.get('/data/:moduleId/count', async (req, res) => {
  try {
    const { moduleId } = req.params;
    // console.log(moduleId)

    // Validate input
    if (!moduleId) {
      return res.status(400).json({ message: 'Module ID is required' });
    }

    // Find the task document by moduleId and get the count of submissions
    const task = await Task.findOne({ moduleId });

    if (!task) {
      return res.status(404).json({ message: 'Task not found for the given module ID' });
    }

    // Get the count of submissions
    const submissionsCount = task.submissions.length;
    // console.log(submissionsCount)

    // Respond with the count
    res.status(200).json({ count: submissionsCount });

  } catch (error) {
    console.error('Error fetching submissions count:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// DELETE route to delete a task by ID (use the correct field, e.g., _id)
router.delete('/tasks/:taskId', async (req, res) => {
  const { taskId } = req.params; // Extract taskId from URL parameter

  try {
    // Find and delete the task by _id
    const deletedTask = await Task.findByIdAndDelete(taskId);

    // If no task is found, return a 404 error
    if (!deletedTask) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Return a success message
    res.status(200).json({ message: 'Task deleted successfully', deletedTask });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.get('/files/:moduleId', async (req, res) => {
  try {
    const { moduleId } = req.params;
    
    // Fetch files from the database by moduleId
    const files = await Data.find({ moduleId });

    if (files.length === 0) {
      return res.status(404).json({ message: 'No files found for the given Module ID' });
    }

    // Respond with the file data
    res.status(200).json({ files });
  } catch (error) {
    console.error('Error fetching files:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});



module.exports = router;
