import multer from 'multer';
import path from 'path';

// Define the storage configuration for multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Set the destination folder for uploads
    cb(null, 'uploads/'); // The folder where the files will be stored
  },
  filename: (req, file, cb) => {
    // Define the file name format
    const ext = path.extname(file.originalname); // Extract the file extension
    const filename = `${Date.now()}-${Math.round(Math.random() * 1E9)}${ext}`; // Generate a unique filename
    cb(null, filename);
  },
});

// Create a multer upload instance with file size limit and file filter
const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // Max file size 10 MB
  },
  fileFilter: (req, file, cb) => {
    // Allowed file types (e.g., only images)
    const allowedTypes = /jpeg|jpg|png|gif|pdf/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
      return cb(null, true);
    } else {
      return cb(new Error('Only image files (jpeg, jpg, png, gif) or pdf files are allowed.'));
    }
  },
});

export default upload;
