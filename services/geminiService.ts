
import { GoogleGenAI } from "@google/genai";
import { UserProfile, AnalysisResult } from '../types';

const getAiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key not found");
  }
  return new GoogleGenAI({ apiKey });
};

// Helper to get longitude from place name
export const resolveLongitude = async (placeName: string): Promise<string> => {
  if (!placeName) return "120.0";
  
  try {
    const ai = getAiClient();
    // Prompt specifically for a number to avoid parsing issues
    const prompt = `
      Please provide the longitude of "${placeName}".
      Rules:
      1. Return ONLY the numeric value (e.g., 121.47 or -74.00).
      2. East is positive, West is negative.
      3. Do not include any text, letters, or symbols other than the number.
      4. If the place is unknown, return 120.0.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    
    const text = response.text?.trim();
    // Validate if it looks like a number
    if (text && !isNaN(parseFloat(text))) {
      return text;
    }
    return "120.0";
  } catch (error) {
    console.warn("Failed to resolve longitude, using default.", error);
    return "120.0";
  }
};

export const analyzeDestiny = async (profile: UserProfile, targetYear: number): Promise<AnalysisResult> => {
  const ai = getAiClient();

  const prompt = `
    你是一位精通紫微斗數、四柱八字和五行八卦的東方玄學大師。
    請根據以下用戶信息進行詳細排盤分析：
    
    姓名：${profile.name}
    性別：${profile.gender}
    出生地：${profile.birthPlace}
    (經度校正參考: ${profile.longitude})
    出生日期：${profile.birthDate}
    出生時間：${profile.birthTime}
    
    重點分析年份（流年）：${targetYear}年
    
    任務：
    1. 結合【四柱八字】（分析日主強弱、喜用神）。
    2. 結合【紫微斗數】（分析命宮主星、三方四正）。
    3. 預測${targetYear}年流年運勢。
    4. 給出開運建議（顏色、數字等）。

    【重要要求】：
    - 請使用**淺顯易懂、白話文**的語言，避免過多艱澀術語，讓普通人也能看懂。
    - 語氣要溫和、具有指導性，充滿正能量。

    請嚴格按照以下JSON格式返回結果（不要包含Markdown代碼塊標記，直接返回JSON字符串）：
    {
      "centralSummary": "僅用一個【四字成語】概括此命盤的核心特質或今年運勢主軸（例如：紫府同宮、否極泰來）。",
      "baziAnalysis": "八字分析（白話版），包含日主五行屬性、個性優點及喜用神建議（100字以內）。",
      "destinyPattern": "紫微斗數命宮格局解讀（白話版），解釋這個格局代表的性格與人生方向（100字以內）。",
      "fiveElementsBalance": "五行能量分析，指出性格上的優勢與潛在弱點（100字以內）。",
      "currentYearFortune": "針對${targetYear}年的流年運勢預測（白話版），包括事業、財運、感情及健康的具體吉凶與機會（150字以內）。",
      "advice": "大師給予${targetYear}年的趨吉避凶箴言，請給出具體可行的生活建議（100字以內）。",
      "luckyData": {
        "luckyColor": "例如：紅色、金色",
        "luckyNumber": "例如：3, 8",
        "luckyDirection": "例如：南方",
        "noblePerson": "例如：屬鼠或屬猴的人"
      }
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json'
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from Oracle");

    return JSON.parse(text) as AnalysisResult;
  } catch (error) {
    console.error("Oracle Error:", error);
    return {
      centralSummary: "天機隱現",
      baziAnalysis: "八字乾坤，氣運流轉。天機暫未顯現。",
      destinyPattern: "天機隱現，雲霧繚繞。暫無法看清格局。",
      fiveElementsBalance: "五行流轉，靜待天時。",
      currentYearFortune: "運勢如水，隨遇而安。",
      advice: "心靜則明，稍後再試。",
      luckyData: {
         luckyColor: "紅", luckyNumber: "9", luckyDirection: "南", noblePerson: "自己"
      }
    };
  }
};
