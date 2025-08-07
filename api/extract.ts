
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI, Type } from "@google/genai";
import formidable from 'formidable';
import fs from 'fs';

// Disable Vercel's default body parser to handle multipart/form-data
export const config = {
    api: {
        bodyParser: false,
    },
};

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

const extractTableFromImageOnServer = async (imageBuffer: Buffer, mimeType: string) => {
    const imagePart = {
        inlineData: {
            data: imageBuffer.toString('base64'),
            mimeType: mimeType,
        },
    };

    const textPart = {
        text: `Analyze the image and extract the tabular data. Return the data as a valid JSON array of arrays. The first inner array must represent the column headers, and each subsequent inner array must represent a data row. All values in the arrays should be strings. Make sure the output is only the JSON text.`
    };

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: { parts: [textPart, imagePart] },
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    description: "An array of arrays representing the table. The first inner array is the header row, and subsequent arrays are data rows.",
                    items: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.STRING
                        }
                    }
                }
            }
        });
        
        const jsonText = response.text.trim();
        const parsedData = JSON.parse(jsonText);
        
        if (!Array.isArray(parsedData) || !parsedData.every(row => Array.isArray(row))) {
            throw new Error("AI response is not in the expected table format.");
        }

        return parsedData;

    } catch (error) {
        console.error("Error in Gemini API call:", error);
        throw new Error("Failed to extract data from AI service.");
    }
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', 'POST');
        return res.status(405).end('Method Not Allowed');
    }
    
    // Check for API Key on the server
    if (!process.env.API_KEY) {
        console.error("API_KEY environment variable not set on server.");
        return res.status(500).json({ error: 'Server configuration error: Missing API Key.' });
    }

    const form = formidable({});

    try {
        const [, files] = await form.parse(req);
        
        const imageFile = files.image?.[0];

        if (!imageFile) {
            return res.status(400).json({ error: 'No image file uploaded.' });
        }

        const imageBuffer = fs.readFileSync(imageFile.filepath);
        const tableData = await extractTableFromImageOnServer(imageBuffer, imageFile.mimetype || 'image/png');

        return res.status(200).json(tableData);

    } catch (error) {
        console.error('Error processing file upload:', error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown server error occurred.';
        return res.status(500).json({ error: errorMessage });
    }
}
