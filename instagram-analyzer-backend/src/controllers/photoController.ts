import { Request, Response } from 'express';
import { analyzePhotoWithGPT } from '../services/analysisService'; // Adjust the path if necessary
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
export const uploadPhoto = async (req: Request, res: Response) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded.' });
        }

        const analysisResult = await analyzePhotoWithGPT(req.file.path, req.body.prompt);
        
        res.status(200).json({
            analysis: analysisResult,
            filePath: `/uploads/${req.file.filename}`
        });
    } catch (error) {
        console.error('Error in uploadPhoto:', error);
        res.status(500).json({ error: 'Photo analysis failed.' });
    }
};