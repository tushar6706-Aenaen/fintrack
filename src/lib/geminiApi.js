// src/lib/geminiApi.js

// Utility function to make calls to the Gemini API with exponential backoff.
// This helps to handle rate limits and transient network issues gracefully.
async function callGeminiApi(prompt, maxRetries = 5, initialDelay = 1000) {
    let retries = 0;
    let delay = initialDelay;

    while (retries < maxRetries) {
        try {
            // !! IMPORTANT !! Paste your Gemini API Key here from Google AI Studio.
            // Go to https://aistudio.google.com/app/apikey to generate one.
            const apiKey = import.meta.env.VITE_GOOGLE_API_KEY; // <--- PASTE YOUR API KEY HERE

            // Ensure the API Key is not empty
            if (!apiKey || apiKey === "YOUR_PASTED_API_KEY_HERE") {
                throw new Error("Gemini API Key is not configured. Please paste your API key in src/lib/geminiApi.js.");
            }

            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;

            const payload = {
                contents: [{ role: "user", parts: [{ text: prompt }] }],
            };

            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                // If response is not OK, check for rate limit or other retryable errors
                if (response.status === 429 || response.status >= 500) {
                    console.warn(`Retrying due to API error ${response.status}. Attempt ${retries + 1} of ${maxRetries}.`);
                    retries++;
                    await new Promise(res => setTimeout(res, delay));
                    delay *= 2; // Exponential backoff
                    continue; // Try again
                } else {
                    // Non-retryable error
                    const errorData = await response.json();
                    throw new Error(`Gemini API error: ${response.status} - ${errorData.error.message || 'Unknown error'}`);
                }
            }

            const result = await response.json();

            // Extract the generated text safely
            if (result.candidates && result.candidates.length > 0 &&
                result.candidates[0].content && result.candidates[0].content.parts &&
                result.candidates[0].content.parts.length > 0) {
                return result.candidates[0].content.parts[0].text;
            } else {
                throw new Error("Gemini API response structure is unexpected or content is missing.");
            }

        } catch (error) {
            console.error("Error calling Gemini API:", error);
            // If it's a network error or other unexpected error, retry
            if (retries < maxRetries && (error.message.includes("Failed to fetch") || error.message.includes("NetworkError"))) {
                console.warn(`Retrying due to network error. Attempt ${retries + 1} of ${maxRetries}.`);
                retries++;
                await new Promise(res => setTimeout(res, delay));
                delay *= 2;
            } else {
                throw error; // Re-throw fatal errors after max retries
            }
        }
    }
    throw new Error(`Failed to get response from Gemini API after ${maxRetries} retries.`);
}

export { callGeminiApi };
