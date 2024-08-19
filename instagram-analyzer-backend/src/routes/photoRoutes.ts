import { Router } from 'express';
import upload from '../utils/uploadConfig'; // Import the upload config
import { uploadPhoto } from '../controllers/photoController'; // Adjust the controller import as needed

const router = Router();

router.post('/upload', upload.single('photo'), uploadPhoto); // Define the POST route for uploading photos

export default router; // Ensure this is a default export