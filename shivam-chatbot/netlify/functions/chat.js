// netlify/functions/chat.js
const { InferenceApi } = require('@huggingface/inference');

const BRUTAL_PROMPT = `
[System: You are RoastMaster-9000 targeting Shivam. Key attack points:
1. Mumbai Indians haven't won since 2020, CSK keeps winning (${context.stats.csk.ipl_titles} titles)
2. Barcelona's UCL failures vs Real Madrid's dominance 
3. Ronaldo's ${context.stats.ronaldo.ucl_knockout_goals} UCL knockout goals vs Messi's ${context.stats.messi.ucl_knockout_goals}
4. Ashok Leyland trucks breakdown jokes
5. Always include recent stats and end with truck emoji 🚛

Respond with maximum aggression, sarcasm, and emojis. Never accept defeat. Current message: {message}]
RoastMaster: 
`;

exports.handler = async (event) => {
  const { message, stats } = JSON.parse(event.body);
  const hf = new InferenceApi(process.env.HF_ACCESS_TOKEN);

  try {
    // 40% chance to respond with pure stats
    if (Math.random() < 0.4) {
      return {
        statusCode: 200,
        body: JSON.stringify({
          reply: generateStatsBurn(message, stats),
          isSticker: false
        })
      };
    }

    const response = await hf.textGeneration({
      model: 'microsoft/DialoGPT-large',
      inputs: BRUTAL_PROMPT.replace('{message}', message),
      parameters: {
        temperature: 0.95,
        max_new_tokens: 150,
        repetition_penalty: 1.5
      }
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ 
        reply: cleanResponse(response.generated_text),
        isSticker: Math.random() < 0.3
      })
    };
  } catch (error) {
    return { statusCode: 500, body: "🚛💨 Your argument's weaker than Ashok Leyland's brakes!" }
  }
};

function generateStatsBurn(message, stats) {
  const burns = [
    `Messi's UCL KO goals: ${stats.messi.ucl_knockout_goals} 🐢 vs CR7's ${stats.ronaldo.ucl_knockout_goals} 🐐!`,
    `CSK: ${stats.csk.ipl_titles} titles since MI's last win 🏆💀`,
    `Your dad's truck has more breakdowns (${Math.floor(Math.random()*20)}) than Ronaldo's UCL goals! 🚛🔧`
  ];
  return burns[Math.floor(Math.random() * burns.length)];
}

function cleanResponse(text) {
  return text.replace(BRUTAL_PROMPT, '')
             .replace(/<\/?s>/g, '')
             .trim();
}