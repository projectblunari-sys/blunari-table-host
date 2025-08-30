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
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const { imageBase64 } = await req.json();

    if (!imageBase64) {
      throw new Error('No image provided');
    }

    console.log('Analyzing floor plan with GPT-4 Vision...');

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: `You are an expert restaurant floor plan analyzer. Analyze the uploaded floor plan image and identify all dining tables/seating areas. 

Return a JSON response with this exact structure:
{
  "tableCount": number,
  "detectedTables": [
    {
      "id": "table_1",
      "name": "Table 1", 
      "position": {"x": 0-10, "y": 0-10},
      "confidence": 0.0-1.0,
      "estimatedCapacity": number,
      "tableType": "dining|booth|bar|outdoor"
    }
  ],
  "confidence": 0.0-1.0,
  "recommendations": ["recommendation1", "recommendation2"],
  "analysis": "Brief description of what you found"
}

Key guidelines:
- Position coordinates should be 0-10 representing relative position on the floor plan
- Estimate capacity based on table size (2-8 people typical)
- Identify different table types (dining tables, booths, bar seating)
- Provide confidence scores based on clarity of the floor plan
- Give practical recommendations for layout optimization
- Only count actual dining/seating furniture, not service areas`
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Please analyze this restaurant floor plan and identify all tables and seating areas. Focus on dining tables, booths, and bar seating that customers would use.'
              },
              {
                type: 'image_url',
                image_url: {
                  url: imageBase64
                }
              }
            ]
          }
        ],
        max_tokens: 1000,
        temperature: 0.1
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenAI API error:', response.status, errorData);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('GPT-4 Vision analysis complete');
    
    const content = data.choices[0].message.content;
    
    // Try to parse the JSON response
    let analysisResult;
    try {
      // Extract JSON from the response (in case it's wrapped in markdown)
      const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || content.match(/\{[\s\S]*\}/);
      const jsonString = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : content;
      analysisResult = JSON.parse(jsonString);
    } catch (parseError) {
      console.error('Failed to parse JSON response:', parseError);
      console.log('Raw response:', content);
      
      // Fallback response if JSON parsing fails
      analysisResult = {
        tableCount: 0,
        detectedTables: [],
        confidence: 0,
        recommendations: [
          "AI analysis completed but had difficulty parsing the floor plan",
          "Try uploading a clearer image with better contrast",
          "You can manually position tables using the Floor Plan view"
        ],
        analysis: "Analysis completed with parsing issues"
      };
    }

    return new Response(JSON.stringify(analysisResult), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in analyze-floor-plan function:', error);
    
    // Return a structured error response
    const errorResponse = {
      tableCount: 0,
      detectedTables: [],
      confidence: 0,
      recommendations: [
        `Analysis failed: ${error.message}`,
        "Please check your API key configuration",
        "You can manually position tables using the Floor Plan view"
      ],
      analysis: "Analysis failed due to technical error"
    };

    return new Response(JSON.stringify(errorResponse), {
      status: 200, // Return 200 so the frontend can handle the error gracefully
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});