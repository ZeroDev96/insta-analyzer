import { Request, Response } from 'express';
import { analyzePhotosWithGPT } from '../services/analysisService';
import fs from 'fs/promises';

const feedbackFile = './feedback.json';

// Function to save user feedback
const saveFeedback = async (feedback: { rating: number, comments: string }) => {
    try {
        const existingFeedback = await fs.readFile(feedbackFile, 'utf8');
        const feedbackData = JSON.parse(existingFeedback);
        feedbackData.push(feedback);
        await fs.writeFile(feedbackFile, JSON.stringify(feedbackData, null, 2));
    } catch (error) {
        await fs.writeFile(feedbackFile, JSON.stringify([feedback], null, 2));
    }
};

// Controller to handle photo uploads and analysis
export const uploadPhotos = async (req: Request, res: Response) => {
    const { prompt, description, rating, comments } = req.body;

    try {
        const files = req.files as Express.Multer.File[];
        if (files && files.length > 0) {
            const filePaths = files.map(file => file.path);

            // Analyze the set of photos
            const analysisResult = await analyzePhotosWithGPT(filePaths, prompt, description);

            // Save feedback if provided
            if (rating && comments) {
                await saveFeedback({ rating, comments });
            }

            return res.status(200).json({
                analysis: analysisResult,
                filePaths: filePaths.map(filePath => `/uploads/${filePath.split('/').pop()}`)
            });
        } else {
            return res.status(400).json({ error: 'No files uploaded.' });
        }
    } catch (error) {
        console.error('Error in uploadPhotos:', error);
        return res.status(500).json({ error: 'Photo analysis failed.' });
    }
};