import { GoogleGenAI, Type, Schema } from "@google/genai";
import { AnalysisResult } from "../types";

const genAI = new GoogleGenAI({ apiKey: process.env.API_KEY });

const modelName = "gemini-2.5-flash";

const analysisSchema: Schema = {
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
              },
              required: ["partnerId", "score", "reason"]
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
    
    **Rules:**
    1. Parse participants.
    2. Identify relationships: Supply Chain (High), B2B Services (High/Med), Complementary (Med), Peers (Low).
    3. Calculate scores based on the value each person brings to others in the room.
    4. Suggest layout and seating groups.
    
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
      Analyze how valuable the GUESTS are specifically for the HOSTS. 
      The "Individual Score" for the HOSTS should reflect how many opportunities exist for them in the room.
      The "Individual Score" for the GUESTS should reflect how valuable they are to the HOST.
  
      **Inputs:**
      HOSTS DATA:
      ${hostsData}
  
      GUESTS DATA:
      ${participantsData}
  
      **Instructions:**
      1. Parse both lists. Mark HOSTS with 'isHost: true'.
      2. **Priority Analysis:** Focus heavily on finding matches where the HOST sells to the Guest, or the Guest sells something strategic to the Host, or they are partners.
      3. **Top Matches:** The 'topMatches' array MUST prioritize connections involving at least one HOST.
      4. **Seating:** Ensure HOSTS are seated with their highest value targets (High scores).
      5. **Overall Score:** This now represents the "Success Probability for the Host".
  
      Return strict JSON matching the schema.
    `;
  
    return callGemini(prompt);
};

const callGemini = async (prompt: string): Promise<AnalysisResult> => {
    try {
        const response = await genAI.models.generateContent({
          model: modelName,
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            responseSchema: analysisSchema,
            temperature: 0.2,
          },
        });
    
        const jsonText = response.text;
        if (!jsonText) throw new Error("No data returned from AI");
        
        return JSON.parse(jsonText) as AnalysisResult;
      } catch (error) {
        console.error("Analysis failed:", error);
        throw new Error("Failed to analyze networking data.");
      }
}