const { getExpertCodingSolution } = require('../services/gemini.service');

const chatWithAI = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const aiResponse = await getExpertCodingSolution(message);

    // Split the AI response into explanation, code, and resources
    const explanationPart = aiResponse.split('Code:')[0].replace('Explanation:', '').trim();
    const codePart = aiResponse.split('Code:')[1]?.split('Resources:')[0]?.trim() || '';
    const resourcesPart = aiResponse.split('Resources:')[1]?.trim() || '';

    // Returning explanation, code, and resources
    res.json({ explanation: explanationPart, code: codePart, resources: resourcesPart });
    
  } catch (error) {
    console.error('Error in chatWithAI:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  chatWithAI
};
