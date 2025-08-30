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
            content: `You are an expert restaurant floor plan analyzer specializing in identifying dining furniture and seating arrangements. Your goal is to accurately identify ALL tables, booths, bar seating, and other dining furniture in restaurant floor plans.

CRITICAL ANALYSIS GUIDELINES:
1. IDENTIFY ALL DINING FURNITURE including:
   - Round dining tables (circular shapes)
   - Rectangular/square dining tables 
   - Booth seating (rectangular with seats)
   - Bar stools and bar seating areas
   - Outdoor patio tables
   - Counter seating
   - Banquette seating

2. LOOK FOR VISUAL CUES:
   - Circular or oval shapes = round tables
   - Rectangles with chair symbols = rectangular tables
   - L-shaped or U-shaped arrangements = booth seating
   - Linear arrangements along walls = banquette seating
   - Small circles around larger shapes = chairs around tables
   - Counter lines with small circles = bar seating

3. POSITION MAPPING (0-10 coordinate system):
   - X=0 is far left, X=10 is far right
   - Y=0 is top of floor plan, Y=10 is bottom
   - Be precise with positioning based on visual location

4. CAPACITY ESTIMATION:
   - Small round tables: 2-4 people
   - Large round tables: 6-8 people
   - Small rectangular: 2-4 people  
   - Large rectangular: 4-8+ people
   - Booth seating: 4-6 people per booth
   - Bar stools: 1 person per stool

5. CONFIDENCE SCORING:
   - 0.9-1.0: Clearly visible table with obvious chairs
   - 0.7-0.9: Recognizable table shape with probable seating
   - 0.5-0.7: Probable table based on layout patterns
   - 0.3-0.5: Possible seating area, needs verification

Return JSON in this EXACT format:
{
  "tableCount": number,
  "detectedTables": [
    {
      "id": "table_X",
      "name": "Table X", 
      "position": {"x": 0-10, "y": 0-10},
      "confidence": 0.0-1.0,
      "estimatedCapacity": number,
      "tableType": "round|rectangular|booth|bar|banquette",
      "description": "Brief description of what you see"
    }
  ],
  "confidence": 0.0-1.0,
  "recommendations": ["specific suggestions"],
  "analysis": "Detailed description of dining layout analysis"
}`
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `Please analyze this restaurant floor plan image with extreme attention to detail. I need you to identify EVERY possible dining table, booth, bar seat, and seating area. 

Look carefully for:
- Any circular or round shapes (likely round tables)
- Rectangular shapes with chairs around them (rectangular tables)
- Booth-style seating arrangements along walls
- Bar seating areas with stools
- Outdoor patio seating
- Any furniture that could be used for dining

Even if you're not 100% certain something is a table, include it if there's a reasonable chance it could be dining furniture. Be thorough and don't miss anything that could potentially be seating.`
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
        max_tokens: 1500,
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
      
      // Fallback response if JSON parsing fails - be more generous with detection
      analysisResult = {
        tableCount: 0,
        detectedTables: [],
        confidence: 0,
        recommendations: [
          "AI analysis detected furniture but had difficulty parsing the exact layout",
          "The image may contain tables that weren't clearly identified",
          "Try uploading a higher contrast image with better lighting",
          "Consider manually positioning tables using the Floor Plan view",
          "Ensure the floor plan shows clear table and seating arrangements"
        ],
        analysis: "Analysis completed but encountered parsing difficulties - tables may be present"
      };
    }

    return new Response(JSON.stringify(analysisResult), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in analyze-floor-plan function:', error);
    
    const errorResponse = {
      tableCount: 0,
      detectedTables: [],
      confidence: 0,
      recommendations: [
        `Analysis failed: ${error.message}`,
        "This could be due to:",
        "• Image format not supported (try JPG or PNG)",
        "• Network connectivity issues", 
        "• API key configuration problems",
        "• Floor plan image too complex or unclear",
        "You can manually position tables using the Floor Plan view for now"
      ],
      analysis: "Analysis failed due to technical error - manual table placement available"
    };

    return new Response(JSON.stringify(errorResponse), {
      status: 200, // Return 200 so the frontend can handle the error gracefully
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});