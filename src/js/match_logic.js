const API_KEY = "Write your API key here"; // Replace with your actual API key

async function askAI(shape, coordinates) {
   

    const response = await fetch(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-goog-api-key": API_KEY
            },
            body: JSON.stringify({
                systemInstruction: {
                    parts: [{
                        text: `You are a shape matching evaluator.

                        You will receive:
                        1. A target shape (circle, square, etc.).
                        2. A sequence of X,Y coordinates representing a drawn path.

                        Evaluate how closely the path matches the target shape.

                        Return ONLY JSON:
                        {
                            "match": boolean,
                            "percentage": number
                        }

                        Percentage must be between 0 and 100.
                        Match is true if percentage >= 80.

                        Do not include explanations or additional text.`
                    }]
                },

                contents: [{
                    parts: [{
                        text: JSON.stringify({ shape, coordinates })
                    }]
                }],

                generationConfig: {
                    responseMimeType: "application/json",
                    temperature: 0
                }
            })
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error?.message || `API Error: ${response.status}`);
    }

    const result = data.candidates?.[0]?.content?.parts
        ?.map(part => part.text || "")
        .join("");

    if (!result) {
        throw new Error("No AI response received");
    }

    return JSON.parse(result);
}


// TEST
const coordinates = [
    [20, 30],
    [21, 30],
    [22, 30],
    [23, 30],
    [24, 30]
];

askAI("square", coordinates)
    .then(result => {
        console.log("Match:", result.match);
        console.log("Percentage:", result.percentage + "%");
    })
    .catch(error => console.error(error));
