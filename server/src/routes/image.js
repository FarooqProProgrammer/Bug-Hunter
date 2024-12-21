import express from "express";
import upload from "../config/multer.js";
import path from "path";

const imageRouter = express.Router();

// Single file upload example (e.g., profile picture)
imageRouter.post('/upload', upload.single('file'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        // Construct the full URL for the uploaded file
        const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;

        // Return the file details (e.g., filename, path, etc.)
        res.status(200).json({
            message: 'File uploaded successfully',
            file: {
                filename: req.file.filename,
                url: fileUrl, // Full URL of the uploaded file
            },
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'File upload failed', error: error.message });
    }
});

// Multiple file upload example (e.g., documents)
imageRouter.post('/upload-multiple', upload.array('files', 5), (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ message: 'No files uploaded' });
        }

        // Map through the uploaded files and create the full URLs
        const files = req.files.map(file => {
            return {
                filename: file.filename,
                url: `${req.protocol}://${req.get('host')}/uploads/${file.filename}`,
            };
        });

        res.status(200).json({
            message: 'Files uploaded successfully',
            files: files, // Array of files with their full URLs
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'File upload failed', error: error.message });
    }
});


imageRouter.get('/upload/:filename', (req, res) => {
    const { filename } = req.params; // Get the filename from the URL parameter

    // Use import.meta.url to get the current directory and resolve the file path
    const filePath = path.join(new URL(import.meta.url).pathname, 'uploads', filename); 

    // Check if the file exists
    res.sendFile(filePath, (err) => {
        if (err) {
            console.error(err);
            return res.status(404).json({ message: 'File not found' });
        }
    });
});

export default imageRouter;
