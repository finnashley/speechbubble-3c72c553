
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { vocabulary, count = 1 } = await req.json();
    
    if (!vocabulary || !Array.isArray(vocabulary) || vocabulary.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Vocabulary must be a non-empty array' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const vocabList = vocabulary.join(', ');
    const systemPrompt = `You are a Japanese language tutor helping students practice vocabulary. 
    Create ${count} simple Japanese sentences using ONLY the following vocabulary words: ${vocabList}. 
    You may use basic grammatical particles and common words not in the list (like です, は, が, を, に, で, etc.).
    Each sentence should be short (5-8 words maximum) and suitable for beginners.`;
    
    const userPrompt = `Create ${count} short Japanese sentences using only these words: ${vocabList}.
    Return the response in the following JSON format:
    {
      "sentences": [
        {
          "japanese": "Japanese sentence here",
          "english": "English translation here",
          "usedVocabulary": ["word1", "word2"]
        }
      ]
    }`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        response_format: { type: "json_object" }
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(`OpenAI API error: ${data.error?.message || 'Unknown error'}`);
    }

    // Parse the response content as JSON
    let parsedContent;
    try {
      parsedContent = JSON.parse(data.choices[0].message.content);
    } catch (e) {
      // If parsing fails, return the raw content
      return new Response(
        JSON.stringify({ 
          error: 'Failed to parse OpenAI response',
          rawResponse: data.choices[0].message.content
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify(parsedContent),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in generate-sentence function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
