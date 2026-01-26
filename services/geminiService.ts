
import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult } from "../types";

// Always use const ai = new GoogleGenAI({apiKey: process.env.API_KEY});
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Select gemini-3-pro-preview for complex reasoning and strategic business matching.
const modelName = "gemini-3-pro-preview";

// Define the response schema as a plain object using the Type enum.
const analysisSchema = {
  type: Type.OBJECT,
  properties: {
    overallScore: {
      type: Type.NUMBER,
      description: "The overall 'Business Index' (0-100) for the entire group based on synergy potential.",
    },
    summary: {
      type: Type.STRING,
      description: "A short executive summary (max 2 sentences) in Portuguese about the networking potential.",
    },
    participants: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          name: { type: Type.STRING },
          company: { type: Type.STRING },
          segment: { type: Type.STRING },
          eventName: { type: Type.STRING },
          isHost: { type: Type.BOOLEAN, description: "True if this participant is the Host." }
        },
        required: ["id", "name", "company", "segment"],
      },
    },
    individualScores: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          participantId: { type: Type.STRING },
          score: { type: Type.NUMBER, description: "Individual Business Index (0-100). How valuable is this person to the room?" },
          potentialConnections: { type: Type.NUMBER, description: "Number of high-probability connections found" },
          scoreReasoning: { type: Type.STRING, description: "A very short phrase explaining the score." },
          recommendedConnections: {
            type: Type.ARRAY,
            description: "List of the top 5 to 10 most relevant connections for this specific participant.",
            items: {
              type: Type.OBJECT,
              properties: {
                partnerId: { type: Type.STRING },
                score: { type: Type.NUMBER, description: "Match strength 0-100" },
                reason: { type: Type.STRING, description: "Specific business reason for this connection (e.g., 'Supplier-Client relationship', 'Complementary services')." }
                type: { 
                  type: Type.STRING, 
                  enum: ["buyer", "seller", "partner"],
                  description: "Categorize as: 'buyer' (the partner is a potential customer for this participant), 'seller' (the partner is a potential supplier for this participant), or 'partner' (strategic partnership/referral)."
                }
              },
              required: ["partnerId", "score", "reason", "type"]
            }
          }
        },
        required: ["participantId", "score", "potentialConnections", "recommendedConnections"],
      },
    },
    topMatches: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          participant1Id: { type: Type.STRING },
          participant2Id: { type: Type.STRING },
          score: { type: Type.NUMBER, description: "Connection strength 0-100" },
          reasoning: { type: Type.STRING, description: "Why these two match (in Portuguese)" },
        },
        required: ["participant1Id", "participant2Id", "score", "reasoning"],
      },
    },
    segmentDistribution: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          value: { type: Type.NUMBER },
        },
        required: ["name", "value"],
      },
    },
    suggestedLayout: {
      type: Type.STRING,
      enum: ['teatro', 'sala_aula', 'mesa_o', 'conferencia', 'mesa_u', 'mesa_t', 'recepcao', 'buffet', 'custom'],
      description: "The best room layout based on participant count and networking goals."
    },
    seatingGroups: {
      type: Type.ARRAY,
      description: "An array of arrays. Each inner array contains Participant IDs that should sit together (clusters of 4-8 people).",
      items: {
        type: Type.ARRAY,
        items: { type: Type.STRING }
      }
    }
  },
  required: ["overallScore", "summary", "participants", "individualScores", "topMatches", "segmentDistribution", "suggestedLayout", "seatingGroups"],
};

export const analyzeNetworkingData = async (rawData: string): Promise<AnalysisResult> => {
  const prompt = `
    You are a Senior Strategic Business Connector. Analyze the provided list of event participants.
    
    **Task:** Calculate the "Rampup IN" (Business Index) for networking synergy.
    
    **Deep Analysis Instructions:**
    1. **Parse & Enrich:** Identify participants, their companies, and segments.
    2. **Strategic Matching:** Identify relationships based on Value Chains. Look for:
       - **Supply Chain:** Who buys from whom?
       - **B2B Services:** Who provides essential services (Legal, Financial, Tech) to whom?
       - **Complementary:** Who targets the same customer base but doesn't compete (e.g., Event Planner + Photographer)?
    3. **Trend Analysis:** Consider current market trends (e.g., Digital Transformation, ESG, AI adoption). If a company is in "Tech", they are high value to "Traditional Retail" looking to modernize.
    4. **Business Goals Inference:** Infer likely business goals based on company descriptions (e.g., A "Startup" likely needs "Capital" or "Mentorship").

    **Output Requirements:**
    - The 'reason' for connections must be **specific and granular**. Avoid generic phrases like "Same segment". Instead use: "Company A's logistics services can optimize Company B's e-commerce supply chain."
    - Calculate scores based on the *strategic value* each person brings to the specific room composition.
    - Suggest layout and seating groups that maximize these high-value transactions.
    
    Return strict JSON matching the schema.
    
    Raw Data:
    ${rawData}
  `;

  return callGemini(prompt);
};

export const analyzeHostPotential = async (hostsData: string, participantsData: string): Promise<AnalysisResult> => {
    const prompt = `
      You are a Senior Business Strategist focusing on HOST analysis.
  
      **Context:**
      We have one or more HOSTS (the organizers or main VIPs) and a list of GUESTS (participants).
  
      **Goal:**
      Analyze how valuable the GUESTS are specifically for the HOSTS based on business goals and industry fit.
  
      **Deep Analysis Instructions:**
      1. **Host Profile:** Understand the Host's business model deeply. What do they sell? Who do they need?
      2. **Priority Analysis:** 
         - **Sales Targets:** Guests who fit the Host's Ideal Customer Profile (ICP).
         - **Strategic Partners:** Guests who can amplify the Host's reach.
         - **Trend Alignment:** Guests operating in high-growth sectors relevant to the Host.
      3. **Granular Reasoning:** The 'reason' field MUST explain *why* this is good for the Host. E.g., "Guest X represents a major retail account for Host's logistics solution."
      4. **Seating:** Ensure HOSTS are seated with their highest value targets (High scores).
      
      **Inputs:**
      HOSTS DATA:
      ${hostsData}
  
      GUESTS DATA:
      ${participantsData}
  
      Return strict JSON matching the schema.
    `;
  
    return callGemini(prompt);
};

const callGemini = async (prompt: string): Promise<AnalysisResult> => {
    try {
        // Use ai.models.generateContent to query GenAI with both the model name and prompt.
        const response = await ai.models.generateContent({
          model: modelName,
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            responseSchema: analysisSchema,
            temperature: 0.2,
            // Complex tasks benefit from reasoning tokens.
            thinkingConfig: { thinkingBudget: 4096 }
          },
        });
    
        // Correctly extract text output from response.text property (not a method).
        const jsonText = response.text;
        if (!jsonText) throw new Error("No data returned from AI");
        
        return JSON.parse(jsonText) as AnalysisResult;
      } catch (error) {
        console.error("Analysis failed:", error);
        throw new Error("Failed to analyze networking data.");
      }
}
