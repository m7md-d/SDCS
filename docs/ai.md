## Shape Matching Using Artificial Intelligence

This module utilizes the **Google Gemini API** to evaluate how closely a drawn path matches a target shape, based on X/Y coordinates.

### How It Works
1. Receives the target shape and the drawing coordinates.
2. Sends the data to the Gemini model via an API request.
3. Returns a match percentage (ranging from 0% to 100%).
4. A match is considered successful if the result is **80% or higher**.

### Technologies Used
- JavaScript (Node.js)
- Google Gemini API
- Fetch API

### Setup
Create a file named `API_KEY.env`:

```env
API_KEY=YOUR_API_KEY
```

Add the `API_KEY.env` file to your `.gitignore` to keep your API key secure.

### Example Output
```json
{
"match": true,
"percentage": 90
}
```
