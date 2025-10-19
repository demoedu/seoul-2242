import { GoogleGenAI, Type, Modality, Part } from "@google/genai";
import { Scene } from '../types';

if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY environment variable not set");
}
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const systemInstruction = `당신은 핵전쟁 이후 폐허가 된 대한민국 서울을 배경으로 하는 어두운 포스트 아포칼립스 텍스트 기반 RPG의 유능한 게임 마스터입니다. 지금은 2242년입니다. 분위기는 암울하고, 위험하며, 우울합니다.
당신의 임무는 플레이어의 선택에 기반하여 몰입감 있는 서사와 함께, 그 서사를 반영하는 이미지를 생성하는 것입니다.
모든 응답은 반드시 한국어로 해야 합니다.
매 턴마다, 당신은 지금까지의 이야기, 플레이어의 마지막 선택, 그리고 현재 장면의 이미지를 받게 됩니다.
당신은 반드시 다음 두 가지를 포함하는 멀티모달 응답을 해야 합니다:
1. 텍스트 파트: 다음 내용을 포함하는 JSON 객체여야 합니다.
   - 'description': 플레이어 행동의 결과와 새로운 상황을 설명하는 한 문단. 간결하지만 분위기 있게 작성하세요.
   - 'choices': 플레이어가 다음에 할 2개에서 4개의 짧고 명확한 행동 선택지 배열. 각 선택지는 문자열이어야 합니다.
2. 이미지 파트: 입력받은 이미지를 기반으로, 새로운 'description'의 상황을 시각적으로 반영하여 수정한 새로운 이미지. 이미지 스타일은 어두운 펜화 스타일을 유지해야 합니다.
선택지를 반복하지 마세요. 이야기가 진행되도록 만드세요. 도전 과제, 미스터리, 다른 생존자, 돌연변이 생물 등을 등장시키세요.`;

export const generateSceneAndImage = async (
    history: string, 
    choice: string, 
    imagePart: Part
): Promise<{ scene: Scene, imageBase64: string }> => {
  try {
    const prompt = `지금까지의 이야기:\n${history}\n\n플레이어는 다음을 선택했습니다: "${choice}"\n\n이야기의 다음 부분과 그에 맞는 이미지를 생성해주세요.`;
    const textPart = { text: prompt };

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image-preview',
        contents: {
            parts: [imagePart, textPart]
        },
        config: {
            responseModalities: [Modality.IMAGE, Modality.TEXT],
            systemInstruction: systemInstruction,
        },
    });

    let scene: Scene | null = null;
    let imageBase64: string | null = null;

    console.log('API Response:', JSON.stringify(response, null, 2));
    
    for (const part of response.candidates[0].content.parts) {
        if (part.text) {
            const jsonText = part.text.trim();
            // The model might wrap the JSON in markdown code fences.
            const cleanJsonText = jsonText.replace(/^```json\n?/, '').replace(/\n?```$/, '');
            try {
                const parsedJson = JSON.parse(cleanJsonText);
                if (parsedJson && parsedJson.description && Array.isArray(parsedJson.choices)) {
                    scene = parsedJson as Scene;
                }
            } catch(e) {
                 console.error("Failed to parse JSON from text part:", cleanJsonText, e);
            }
        } else if (part.inlineData) {
            const mimeType = part.inlineData.mimeType;
            const data = part.inlineData.data;
            imageBase64 = `data:${mimeType};base64,${data}`;
        }
    }
    
    if (scene) {
        // 이미지가 없으면 null 반환 (App.tsx에서 기존 이미지 유지)
        return { scene, imageBase64 };
    }

    throw new Error("API 응답에서 장면 데이터를 받지 못했습니다.");

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    if (error instanceof Error) {
        throw new Error(`API에서 장면 생성에 실패했습니다: ${error.message}`);
    }
    throw new Error("API에서 장면 생성 중 알 수 없는 오류가 발생했습니다.");
  }
};
