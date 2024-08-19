import vision from '@google-cloud/vision';
import OpenAI from 'openai';

// Initialize the Vision API client
const client = new vision.ImageAnnotatorClient();

// Initialize the OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,  // Ensure this is set in your .env file
});

// Function to analyze the photo with Google Vision API
export const analyzePhotoWithVisionAPI = async (filePath: string) => {
    try {
        // Perform label detection on the image
        const [result] = await client.labelDetection(filePath);
        return result;
    } catch (error) {
        console.error('Error in Vision API analysis:', error.message);
        throw new Error('Failed to analyze photo with Vision API.');
    }
};

// Function to analyze the photo using GPT based on Vision API results
export const analyzePhotoWithGPT = async (filePath: string, prompt: string): Promise<{ score: number, recommendations: string }> => {
    try {
        // Step 1: Analyze the photo with Google Vision API
        const visionResult = await analyzePhotoWithVisionAPI(filePath);

        // Step 2: Generate a descriptive prompt based on Vision API results
        const visionDescription = generateDescriptionFromVisionAPI(visionResult);
        const refinedPrompt = `${prompt}\nBased on the following image details: ${visionDescription}, please provide specific Lightroom adjustments, including contrast, sharpness, saturation, and other relevant parameters in the format: "parameter: value".`;

        // Step 3: Use GPT to analyze the description
        const response = await openai.chat.completions.create({
            model: 'gpt-4o-mini',  // Updated model name
            messages: [
                { role: 'user', content: refinedPrompt }
            ],
            temperature: 0.7,
            max_tokens: 1000
        });

        const analysis = response.choices[0].message.content;

        return {
            score: Math.floor(Math.random() * 100),
            recommendations: analysis
        };
    } catch (error) {
        console.error('Error in analyzePhotoWithGPT:', error.message);
        throw new Error('Photo analysis failed.');
    }
};

// Utility function to generate a description from Vision API results
const generateDescriptionFromVisionAPI = (visionResult: any): string => {
    const labels = visionResult.labelAnnotations?.map((label: any) => label.description).join(', ') || 'unknown';
    const text = visionResult.textAnnotations?.[0]?.description || 'no text detected';

    // Add more features as needed, such as landmark detection, logo detection, etc.
    return `The image contains the following elements: ${labels}. Detected text: "${text}".`;
};