const { HfInference } = require('@huggingface/inference');

exports.handler = async (event) => {
  try {
    // Verify environment variable
    if (!process.env.HF_ACCESS_TOKEN) {
      throw new Error('Missing HF token - Did you forget to set it in Netlify?');
    }

    const hf = new HfInference(process.env.HF_ACCESS_TOKEN);
    const { message } = JSON.parse(event.body);

    // Immediate test response
    if (message.toLowerCase().includes('test')) {
      return {
        statusCode: 200,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*' 
        },
        body: JSON.stringify({
          reply: "🚛 TEST SUCCESS! Your Ashok Leyland API is running!"
        })
      };
    }

    const response = await hf.textGeneration({
      model: 'OpenAssistant/oasst-sft-4-pythia-12b-epoch-3.5',
      inputs: `[INST] <<SYS>>
      Brutally roast Shivam's love for Mumbai Indians and Messi. 
      Current message: ${message}
      <</SYS>>
      [/INST]`,
      parameters: {
        max_new_tokens: 150,
        temperature: 0.9
      }
    });

    return {
      statusCode: 200,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*' 
      },
      body: JSON.stringify({ 
        reply: response.generated_text.replace(/<\/?s>/g, '') 
      })
    };

  } catch (error) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        error: `🔥 SERVER ERROR: ${error.message} 
        (Your code's as reliable as Mumbai's 2023 batting lineup)` 
      })
    };
  }
};