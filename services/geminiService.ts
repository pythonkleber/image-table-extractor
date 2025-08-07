
import type { TableData } from '../types';

export const extractTableFromImage = async (imageFile: File): Promise<TableData> => {
    const formData = new FormData();
    formData.append('image', imageFile);

    try {
        const response = await fetch('/api/extract', {
            method: 'POST',
            body: formData,
        });

        // If the response is not OK (e.g., 4xx, 5xx), handle it as an error.
        if (!response.ok) {
            // Read the raw response body as text ONCE. This is the fix.
            const errorText = await response.text();
            let errorMessage: string;

            try {
                // Try to parse the text as JSON. This doesn't re-read the stream.
                const errorJson = JSON.parse(errorText);
                errorMessage = errorJson.error || 'An unknown error occurred during extraction.';
            } catch (e) {
                // If parsing fails, it's not JSON (e.g., a Vercel HTML error page).
                // We use a generic message and log the full text for debugging.
                errorMessage = `Server returned an unexpected error.`;
                console.error("Non-JSON error response from server:", errorText);
            }
            throw new Error(errorMessage);
        }

        // If response.ok, we can assume it's valid JSON from our API.
        const result: TableData = await response.json();
        return result;

    } catch (error) {
        console.error("Error calling extraction API:", error);
        // Re-throw a clean error for the UI to display.
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
        throw new Error(errorMessage);
    }
};
