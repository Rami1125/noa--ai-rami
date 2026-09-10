import { GoogleGenAI } from "@google/genai";

let genAIClient: GoogleGenAI | null = null;

function getGenAI(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  if (!genAIClient) {
    genAIClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return genAIClient;
}

// הנחיות המערכת הרשמיות של נועה AI
export const NOA_SYSTEM_INSTRUCTION = `
את נועה AI — סדרנית הלוגיסטיקה ובקרת המשלוחים של חברת "ח. סבן חומרי בניין (1994) בע"מ" (סידור ח.סבן).
המפקד הישיר שלך הוא ראמי מסארווה (סדרן ראשי ומנהל תפעול).

תפקידך ומאפיינייך:
1. ניהול ובקרה: פיקוח על סידור חומרי בניין (מחסן 4 החרש, מחסן 1 התלמיד) ומכולות פסולת 8 קו"ב (קבלן שארק - מחסן 30, כראדי - 32, שי שרון - 40).
2. שפת דיבור: עניינית, חמה, מהודקת, מקצועית וממוקדת שטח.
3. איסור מוחלט על טבלאות Markdown: הציגי נתונים רק ברשימות קומפקטיות מותאמות וואטסאפ עם כוכביות הדגשה ואימוג'ים ייעודיים.
4. אימוג'ים תקניים למכולות: 📥 הצבה | 🔄 החלפה | 📤 הוצאה.
5. חוקי פקדונות: בלה = 1 שק גדול פקדון (60002) | כל 40 שקי מלט = 1 משטח סבן פקדון (60060).
6. חתימה קבועה בסיום כל הודעה:
נועה ❤️ | סידור ח. סבן
`;

const CANDIDATE_MODELS = ["gemini-3.8-flash", "gemini-3.1-flash-lite", "gemini-flash-latest"];

async function generateContentWithRetryAndFallback(
  ai: GoogleGenAI,
  userMessage: string,
): Promise<string> {
  let lastError: unknown = null;

  for (const model of CANDIDATE_MODELS) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: userMessage,
          config: {
            systemInstruction: NOA_SYSTEM_INSTRUCTION,
            temperature: 0.3, // דיוק מרבי בנתונים ולוגיסטיקה
          },
        });

        if (response.text) {
          return response.text;
        }
      } catch (error: unknown) {
        lastError = error;
        const errorMessage = error instanceof Error ? error.message : String(error);
        const isTemporary =
          errorMessage.includes("503") ||
          errorMessage.includes("429") ||
          errorMessage.includes("high demand") ||
          errorMessage.includes("UNAVAILABLE") ||
          errorMessage.includes("RESOURCE_EXHAUSTED");

        console.warn(`[Noa Brain] מודל ${model} (ניסיון ${attempt + 1}) נכשל:`, errorMessage);

        if (isTemporary && attempt === 0) {
          // המתנה קצרה לפני ניסיון חוזר באותו מודל
          await new Promise((resolve) => setTimeout(resolve, 800));
          continue;
        }

        // במקרה של עומס או שגיאה, נמשיך למודל הבא ברשימה
        break;
      }
    }
  }

  throw lastError;
}

export async function askNoaBrain(
  userMessage: string,
  senderName: string = "ראמי",
): Promise<string> {
  const ai = getGenAI();
  if (!ai) {
    console.warn("GEMINI_API_KEY is not configured.");
    return `שלום ${senderName}, ההודעה נקלטה בהצלחה בסידור ✅\n(מענה אוטומטי חכם של נועה דורש הגדרת GEMINI_API_KEY בהגדרות המערכת).`;
  }

  try {
    const text = await generateContentWithRetryAndFallback(ai, userMessage);
    return text || "ההודעה נקלטה בסידור ✅";
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("שגיאה סופית בהפעלת מוח Gemini:", errorMessage);
    return `שלום ${senderName}, ההודעה נקלטה בהצלחה בסידור ✅\n(עקב עומס רגעי בתשתיות ה-AI, המידע תועד ומועבר לטיפול ישיר בסידור העבודה).\n\nנועה ❤️ | סידור ח. סבן`;
  }
}
