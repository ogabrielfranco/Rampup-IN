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
    You are a Senior Strategic Business Connector and Networking Specialist.
    Your task is to analyze a raw list of event participants and calculate the "Rampup IN" (Business Index).

    **Goal:**
    Identify real, actionable business opportunities. Do not just match similar keywords. Look for Supply Chain relationships, B2B Service opportunities, and Strategic Partnerships.

    **Analysis Logic (The "Brain"):**
    1. **Supply Chain (High Score 90-100%):** Does Person A sell what Person B needs to operate? (e.g., "Construction Company" needs "Cement Supplier").
    2. **B2B Services (High/Med Score 70-90%):** Does Person A offer a service that Person B likely needs to grow? (e.g., "Marketing Agency" is valuable to "E-commerce" or "Real Estate").
    3. **Complementary (Med Score 60-80%):** Do they serve the same client but don't compete? (e.g., "Wedding Planner" and "Photographer").
    4. **Peer Exchange (Med/Low Score 40-60%):** Competitors or same industry. Good for benchmarking, less for direct sales.

    **Instructions:**
    1. **Parse:** Extract participants. Assign IDs. Clean segment names to be standard business terms.
    2. **Deep Dive Analysis:** For *each* participant, identify who they *must* talk to.
    3. **Scores:**
       - **Overall Score:** How dynamic is the room? Are there buyers and sellers?
       - **Individual Score:** How "hot" is this person? A "General Buyer" (like a large retailer) has a high score because everyone wants them. A "Niche Service" might have a lower score if no buyers are present.
    
    **Room Layout & Seating Strategy:**
    - Based on the number of participants and the goal of maximizing interaction, suggest the **best room layout** from this list:
      ['teatro', 'sala_aula', 'mesa_o', 'conferencia', 'mesa_u', 'mesa_t', 'recepcao', 'buffet']
    - **Seating Groups:** Organize *all* participants into optimized clusters (groups of 4 to 8 IDs) that should sit together or near each other to maximize business synergy. Every participant must be included in exactly one group.

    Return the result strictly in JSON format matching the schema.
    
    Raw Data:
    ${rawData}
  `;

  try {
    const response = await genAI.models.generateContent({
      model: modelName,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: analysisSchema,
        temperature: 0.2, // Low temperature for precise, logical connections
      },
    });

    const jsonText = response.text;
    if (!jsonText) throw new Error("No data returned from AI");
    
    return JSON.parse(jsonText) as AnalysisResult;
  } catch (error) {
    console.error("Analysis failed:", error);
    throw new Error("Failed to analyze networking data.");
  }
};