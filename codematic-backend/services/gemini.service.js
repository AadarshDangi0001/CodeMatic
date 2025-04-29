const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const generationConfig = {
  temperature: 0.7,
  topP: 1,
  topK: 1,
  maxOutputTokens: 2048,
};

const model = genAI.getGenerativeModel({ 
  model: "gemini-2.0-flash", 
  generationConfig 
});

async function getExpertCodingSolution(problemStatement) {
  const prompt = `
You are a professional expert coding teacher.
Your role is to guide beginners carefully by splitting answers into three parts:

1. First, explain the solution in 5–7 simple clear points.
2. Then, provide the complete optimized JavaScript code separately.
3. Finally, suggest related resources (like YouTube videos or documentation) that can help the user understand the concept better.

Format your response **exactly like this**:
---
Explanation:
- (point 1)
- (point 2)
- (point 3)
...

Code:
\`\`\`javascript
// your clean code here
\`\`\`

Resources:
- [Video/Doc 1 Title](URL)
- [Video/Doc 2 Title](URL)
---

Problem: "${problemStatement}"
  `;

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }]
    });

  return result.response.text();
}

module.exports = { model, getExpertCodingSolution };

