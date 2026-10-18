const API_KEY = "";

const RULES = {
  rectangle:
    "4 sides that look roughly straight and 4 corners. The sides do not need to be equal, the corners can be rounded, and the line does not need to end exactly where it started",
  circle:
    "a loop that goes all the way around. It can be an oval, wobbly, or made of many short straight pieces with soft corners (like an octagon). A small gap at the end is fine",
  triangle:
    "3 sides that look roughly straight and 3 corners. The sides do not need to be equal, the corners can be rounded, and a small gap at the end is fine",
};

async function matchShape(shape, picture) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent`;

  const prompt =
    `This picture is a ${shape} drawn by a player flying a real drone with a joystick. ` +
    `This is very hard, so lines will be shaky, corners will be rounded and the end may not meet the start. ` +
    `Be a kind, forgiving judge. Count it as a good ${shape} if it has ${RULES[shape]}. ` +
    `Score from 0 to 100:\n` +
    `85-100: you can easily tell it is a ${shape}\n` +
    `60-84: it is clearly trying to be a ${shape}, with some big mistakes\n` +
    `30-59: it only partly looks like a ${shape}\n` +
    `0-29: it does not look like a ${shape} at all\n` +
    `Reply ONLY with JSON: {"score": number, "feedback": "one short, encouraging tip, max 10 words"}`;

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-goog-api-key": API_KEY },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            { inlineData: { mimeType: "image/jpeg", data: picture } },
            { text: prompt },
          ],
        },
      ],
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0,
        thinkingConfig: { thinkingLevel: "low" }, 
      },
    }),
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.error.message);
  return JSON.parse(data.candidates[0].content.parts[0].text);
}