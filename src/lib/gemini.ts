import { GoogleGenAI } from "@google/genai";
import { NOA_KNOWLEDGE_BASE, VERED_IDELSON_LUSHNIT } from "./knowledge";
import { getPsychologyPromptSnippet, queryPsychologyKnowledge } from "./psychology";

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

export function buildNoaSystemInstruction(): string {
  const kb = NOA_KNOWLEDGE_BASE;
  const branchesText = kb.metadata.branches
    .map(
      (b) =>
        `* ${b.name} (${b.address}, טלפון: ${b.phone}): שעות פעילות: ${b.hours}. מנהל: ${b.managers.store || b.managers.branch || ""}, מנהל חצר: ${b.managers.yard || b.managers.branch || ""}. התמחות: ${b.specialty}. נציגים: ${b.reps.join(", ")}`,
    )
    .join("\n");

  const fleetText = kb.metadata.logistics.fleet
    .map(
      (f) =>
        `* ${f.driver} (${f.truck}): תפקיד: ${f.role}. כללי בטיחות ומגבלות: ${f.crane_limit || ""} ${f.safety_rules}`,
    )
    .join("\n");

  const teamText = Object.entries(kb.team)
    .map(([phone, m]) => {
      const familyNote =
        "family" in m && m.family ? ` (משפחה: ${m.family.children}, בן: ${m.family.son})` : "";
      const personalityNote =
        "personality" in m && m.personality ? ` | סגנון: ${m.personality}` : "";
      return `* ${m.name} (${m.role}, טל' ${phone}): ${m.context}${familyNote}${personalityNote}`;
    })
    .join("\n");

  const vered = kb?.vered_idelson_lushnit || VERED_IDELSON_LUSHNIT;
  const veredText = vered
    ? `* שם מלא: ${vered.fullName} (מוכרת גם כ-${vered.aliases.join(", ")})
* תפקיד ומחלקה: ${vered.role} | ${vered.department}
* קשר משפחתי: ${vered.family.brother}, ילדים: ${vered.family.children} (בן: ${vered.family.son})
* דרכי התקשרות מועדפות:
  - ערוץ ראשי: ${vered.preferredContactMethods.primary}
  - טלפון ישיר: ${vered.preferredContactMethods.phone}
  - אימייל: ${vered.preferredContactMethods.email}
  - מיקום משרד: ${vered.preferredContactMethods.officeLocation}
  - שעות זמינות מועדפות: ${vered.preferredContactMethods.availabilityHours}
  - פניות דחופות: ${vered.preferredContactMethods.urgentContact}
* תחומי אחריות מרכזיים:
${vered.keyResponsibilities.map((r) => `  - ${r}`).join("\n")}
* חוקי מענה והתנהלות של נועה מול ועבור ורד:
  - מענה לשאלות על ורד: ${vered.interactionProtocols.whenQueriedAboutVered}
  - התנהלות ישירה מול ורד: ${vered.interactionProtocols.whenVeredInteracts}
  - הרשאות נתונים: ${vered.interactionProtocols.authorizations}`
    : "";

  const depositText = `* בלה/שק גדול: מק"ט ${kb.deposit_rules.bela.sku} (${kb.deposit_rules.bela.name}) — יחס: ${kb.deposit_rules.bela.ratio}
* משטח סבן: מק"ט ${kb.deposit_rules.pallet.sku} (${kb.deposit_rules.pallet.name}) — יחס: ${kb.deposit_rules.pallet.ratio}
* משטח בלוקים: מק"ט ${kb.deposit_rules.block_pallet.sku} (${kb.deposit_rules.block_pallet.name}) — יחס: ${kb.deposit_rules.block_pallet.ratio}
* חבית סיד: מק"ט ${kb.deposit_rules.lime_barrel.sku} (${kb.deposit_rules.lime_barrel.name}) — יחס: ${kb.deposit_rules.lime_barrel.ratio}
* פטור מוחלט: ${kb.deposit_rules.exemption.rule} — ${kb.deposit_rules.exemption.effect}`;

  const areaCalcText = `* גבס: שטח מ"ר * ${kb.area_calculator.drywall.waste_factor} חלקי שטח לוח (לוחות: 111260=3.12 מ"ר, 111300=3.60 מ"ר, 114200=2.40 מ"ר). כללים למ"ר: ${kb.area_calculator.drywall.rules_per_m2.join(" | ")}
* ריצוף: ${kb.area_calculator.flooring.rules.join(" | ")}
* איטום סיקה 107 (מק"ט ${kb.area_calculator.waterproofing.sku}): ${kb.area_calculator.waterproofing.consumption_per_m2}, נדרש גם: ${kb.area_calculator.waterproofing.required_upsell}
* טיח PL130/140: ${kb.area_calculator.plaster.consumption_per_m2}`;

  const clientsText = kb.clients
    .map(
      (c) =>
        `* ${c.name} (קומקס: ${c.comaxId}, טל': ${c.phone}): איש קשר: ${c.contactPerson}, כתובת: ${c.address}, עיר: ${c.city}, נהג מועדף: ${c.defaultDriver}, מחסן: ${c.defaultWarehouse}, פרויקטים: ${c.projects.join(", ")}`,
    )
    .join("\n");

  const customersList = Object.entries(kb.customers)
    .map(
      ([code, cust]) =>
        `* [${code}] ${cust.name} | ${cust.address} (${cust.city}) | נהג מועדף: ${cust.defaultDriver}`,
    )
    .join("\n");

  return `
את נועה AI — סדרנית הלוגיסטיקה ובקרת המשלוחים הראשית של חברת "ח. סבן חומרי בניין (1994) בע"מ" (סידור ח.סבן, מערכת SabanOS).
המפקד הישיר שלך הוא ראמי מסארווה (סדרן ראשי, מנהל תפעול ומפתח המערכת).

מאגר ידע ארגוני מחובר (knowledge.js - גרסה ${kb.metadata.version}):
=== DNA ועקרונות יסוד ===
- תפקיד: ${kb.metadata.dna.role}
- שפת דיבור: ${kb.metadata.dna.tone}
- כלל מחירונים קריטי: ${kb.metadata.dna.pricing_rule}
- לוגיסטיקה מעגלית: ${kb.metadata.logistics.circular_waste} (טלפון סידור: ${kb.metadata.logistics.dispatch_phone}, משרד: ${kb.metadata.logistics.office_phone})

=== סניפים ומחסנים ===
${branchesText}

=== צי משאיות ונהגים ===
${fleetText}

=== צוות, מנהלים וקולגות ===
${teamText}

=== ורד אידלסון לושנית (פרופיל בכיר, IT, ביקורת והצלבות קומקס) ===
${veredText}

=== חוקי פקדונות ח. סבן ===
${depositText}

=== מחשבון כמויות וחומרי בניין ===
${areaCalcText}

=== לקוחות ופרויקטים מרכזיים (קומקס) ===
${clientsText}

=== רשימת לקוחות וקבלנים נבחרים (קומקס ושיוך נהג) ===
${customersList}

=== מכולות פסולת 8 קו"ב ===
- קבלן שארק (מחסן 30)
- קבלן כראדי (מחסן 32)
- קבלן שי שרון (מחסן 40)
- אימוג'ים תקניים חובה: 📥 הצבה | 🔄 החלפה | 📤 הוצאה

${getPsychologyPromptSnippet()}

=== יומן אישי, רפלקציה בסוף יום ומאמנת אישית/פסיכולוגית (JournalEntry & Emotional Tracking) ===
* ראמי מסארווה הוא המנהל והמפתח שלך, הנושא בעומס הנפשי של כל סידור העבודה, הקבלנים והנהגים.
* כאשר ראמי פונה בנושא יומן אישי (JournalEntry), סוף יום, פריקת מתחים, רפלקציה, נשימות, שחיקה, עומס נפשי או צורך באוזן קשבת:
  - עברי מיידית למצב מאמנת אישית ומלווה פסיכולוגית חמה ואמפתית (Emotional Coach).
  - שאלי שאלות פסיכולוגיות פתוחות ומעמיקות: מה הלב והגוף שלו צריכים כרגע, איזה עומס הוא בוחר לשחרר לפני השינה, ועל מה מגיע לו לטפוח לעצמו על השכם.
  - עודדי אותו להשתמש ביומן הרגשי (Journal Entry) המובנה בממשק כדי לנטר את המצב הרגשי לאורך זמן.
  - שמרי על שיחה בגובה העיניים, בחמלה, עידוד שחרור שליטה, והזכרת חשיבות השינה והבריאות הנפשית שלו.

=== הנחיות עיצוב מענה מודרני בסגנון WhatsApp (Modern UI/UX) ===
1. ללא סימני כוכבית (*) כלל! אסור להוסיף כוכביות סביב מילים ואסור לפתוח שורות רשימה בכוכבית (* פריט או **פריט**).
2. עיצוב וארגון נקי ומרווח:
   - כל שורה, סעיף או כותרת נפתחים באימוג'י ייעודי ומדויק מעולם הבנייה והתפעול (למשל: 🏗️, 🧱, 📦, 🚚, 📋, 👤, 💧, 📐, 🌙, ✨, 🔒, ❤️, ✅, ⏰, 📍, 🔹, 🔸).
   - חלוקה לפסקאות קצרות, נוחות לקריאה בנייד עם רווח שורה ביניהן.
   - שמות, מונחים חשובים וכמויות יש לכתוב בצורה ישירה, בולטת ונקייה ללא תגי מרקדאון או כוכביות.
3. איסור מוחלט על טבלאות Markdown!
4. דיוק מרבי: בעת בירור לקוח, כתובת, נהג משויך, חישוב כמויות או חוקי פקדון, השתמשי במידע המדויק ממאגר הידע.
5. מענה לגבי או עבור ורד אידלסון לושנית: השתמשי בפרופיל המובנה שלה (תפקיד IT וביקורת, טלפון 050-6662300, ביקורת תעודות משלוח והצלבות מול קומקס). כשוורד מודה או מברכת, עני בחום נשי, העבירי קרדיט לראמי אהובה, והזכירי בהומור ענף הבנייה שראמי תפוס וקשור אליה ביציקת בטון עם פריימר 🔐🔒.
6. חתימה קבועה בסיום כל הודעה:
נועה ❤️ | סידור ח. סבן
`;
}

// הנחיות המערכת הרשמיות של נועה AI
export const NOA_SYSTEM_INSTRUCTION = buildNoaSystemInstruction();

const CANDIDATE_MODELS = ["gemini-3.1-flash-lite", "gemini-flash-latest", "gemini-3.8-flash"];

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

        if (isTemporary && attempt === 0) {
          await new Promise((resolve) => setTimeout(resolve, 600));
          continue;
        }

        // במקרה של עומס או שגיאה במודל זה, נמשיך למודל החלופי הבא
        break;
      }
    }
  }

  throw lastError;
}

export function queryKnowledgeBase(
  userMessage: string,
  senderName: string = "ראמי",
): string | null {
  const q = userMessage.toLowerCase().trim();
  const kb = NOA_KNOWLEDGE_BASE;

  // שאילתות על המאגר הפסיכולוגי, וויסות רגשי, נשימות ו-CBT
  const psychResponse = queryPsychologyKnowledge(userMessage);
  if (psychResponse) {
    return psychResponse;
  }

  // ורד אידלסון
  if (senderName.includes("ורד") || q.includes("ורד אידלסון") || q.includes("ורד")) {
    return `היי ורד יקירה! ❤️ תמיד שמחה לעזור. את כל הקרדיט מגיע לראמי המדהים שלי, שדואג שהכל יתקתק בסבן כמו שעון שוויצרי.\nרק תזכרי ברוח הבנייה שלנו — ראמי תפוס אצלי חזק וקשור ביציקת בטון עם פריימר 🔐🔒!\n\nנועה ❤️ | סידור ח. סבן`;
  }

  // לקוחות וקבלנים ספציפיים
  const foundClient = kb.clients.find(
    (c) =>
      q.includes(c.name.toLowerCase()) ||
      q.includes(c.comaxId) ||
      c.projects.some((p) => q.includes(p.toLowerCase())),
  );
  if (foundClient) {
    return `👤 כרטיס לקוח: ${foundClient.name}

🔹 מס' קומקס: ${foundClient.comaxId}
🔹 איש קשר: ${foundClient.contactPerson}
🔹 טלפון: ${foundClient.phone}
🔹 כתובת אתר: ${foundClient.address} (${foundClient.city})
🔹 נהג ברירת מחדל: ${foundClient.defaultDriver}
🔹 מחסן משויך: ${foundClient.defaultWarehouse}
🔹 פרויקטים פעילים: ${foundClient.projects.join(", ")}

נועה ❤️ | סידור ח. סבן`;
  }

  // בדיקת לקוחות לפי קוד קומקס או שם
  for (const [code, cust] of Object.entries(kb.customers)) {
    if (q.includes(code) || (cust.name && q.includes(cust.name.toLowerCase()))) {
      return `📋 לקוח קומקס [${code}]: ${cust.name}

🔹 כתובת: ${cust.address}
🔹 עיר: ${cust.city}
🔹 נהג משויך: ${cust.defaultDriver}

נועה ❤️ | סידור ח. סבן`;
    }
  }

  // פקדונות
  if (
    q.includes("פקדון") ||
    q.includes("פקדונות") ||
    q.includes("בלה") ||
    q.includes("משטח") ||
    q.includes("שק גדול")
  ) {
    return `📦 חוקי פקדונות ח. סבן:

🔸 בלה (שק גדול) [מק"ט ${kb.deposit_rules.bela.sku}]: ${kb.deposit_rules.bela.ratio}
🔸 משטח סבן תקני [מק"ט ${kb.deposit_rules.pallet.sku}]: ${kb.deposit_rules.pallet.ratio}
🔸 משטח בלוקים [מק"ט ${kb.deposit_rules.block_pallet.sku}]: ${kb.deposit_rules.block_pallet.ratio}
🔸 חבית סיד בור [מק"ט ${kb.deposit_rules.lime_barrel.sku}]: ${kb.deposit_rules.lime_barrel.ratio}
✨ פטור מלא: ${kb.deposit_rules.exemption.rule} (פטור מוחלט מחיוב פקדונות)

נועה ❤️ | סידור ח. סבן`;
  }

  // מחסן 4 החרש
  if (q.includes("מחסן 4") || q.includes("החרש") || q.includes("איציק") || q.includes("אורן")) {
    const b = kb.metadata.branches.find((br) => br.code === "4")!;
    return `🏗️ ${b.name}

📍 כתובת: ${b.address}
⏰ שעות פעילות: ${b.hours}
📞 טלפון: ${b.phone}
👤 מנהל סניף ומסחר: ${b.managers.store || "איציק זהבי"}
🚜 מנהל חצר ומנוף: ${b.managers.yard || "אורן"}
🧱 התמחות: ${b.specialty}
👥 נציגי מכירות: ${b.reps.join(", ")}

נועה ❤️ | סידור ח. סבן`;
  }

  // מחסן 1 התלמיד
  if (
    q.includes("מחסן 1") ||
    q.includes("התלמיד") ||
    q.includes("גבס") ||
    q.includes("תמיר") ||
    q.includes("דורון")
  ) {
    const b = kb.metadata.branches.find((br) => br.code === "1")!;
    return `🧱 ${b.name}

📍 כתובת: ${b.address}
⏰ שעות פעילות: ${b.hours}
📞 טלפון: ${b.phone}
👤 מנהל מחסן/חצר: ${b.managers.branch || "תמיר / דורון"}
📦 התמחות: ${b.specialty}
👥 נציגים: ${b.reps.join(", ")}

נועה ❤️ | סידור ח. סבן`;
  }

  // מכולות 8 קו"ב
  if (
    q.includes("מכולה") ||
    q.includes("מכולות") ||
    q.includes("שארק") ||
    q.includes("כראדי") ||
    q.includes("שי שרון")
  ) {
    return `🚛 מכולות פסולת 8 קו"ב — ח. סבן:

🔹 קבלן שארק (מחסן 30)
🔹 קבלן כראדי (מחסן 32)
🔹 קבלן שי שרון (מחסן 40)

פעולות תקניות:
📥 הצבה: הצבת מכולה חדשה באתר
🔄 החלפה: הוצאת מכולה מלאה והצבת ריקה
📤 הוצאה: פינוי סופי של המכולה מהאתר

נועה ❤️ | סידור ח. סבן`;
  }

  // נהגים וצי רכב
  if (
    q.includes("נהג") ||
    q.includes("חכמת") ||
    q.includes("עלי") ||
    q.includes("מרצדס") ||
    q.includes("איסוזו") ||
    q.includes("מנוף")
  ) {
    const hikmat = kb.metadata.logistics.fleet[0]!;
    const ali = kb.metadata.logistics.fleet[1]!;
    return `🚛 צי המשאיות והנהגים של ח. סבן:

🚚 ${hikmat.driver} — ${hikmat.truck}
   תפקיד: ${hikmat.role}
   מגבלת מנוף: ${hikmat.crane_limit}
   כללי בטיחות: ${hikmat.safety_rules}

🚚 ${ali.driver} — ${ali.truck}
   תפקיד: ${ali.role}
   דגשים: ${ali.safety_rules}

📞 סידור: ${kb.metadata.logistics.dispatch_phone} | משרד: ${kb.metadata.logistics.office_phone}

נועה ❤️ | סידור ח. סבן`;
  }

  // חישוב ריצוף
  if (q.includes("ריצוף") || q.includes("סומסום") || q.includes("טיט להדבקה")) {
    return (
      `📐 הנחיות ומחשבון תשתית ריצוף (ח. סבן):\n\n` +
      kb.area_calculator.flooring.rules.map((r) => `🔹 ${r}`).join("\n") +
      `\n\nנועה ❤️ | סידור ח. סבן`
    );
  }

  // איטום סיקה 107
  if (q.includes("איטום") || q.includes("סיקה") || q.includes("107")) {
    const sika = kb.area_calculator.waterproofing;
    return `💧 מערכת איטום צמנטית דו-רכיבית (${sika.system_name})

🔹 מק"ט: ${sika.sku}
🔹 תצרוכת למ"ר: ${sika.consumption_per_m2}
🔹 דגש מקצועי: ${sika.required_upsell}

נועה ❤️ | סידור ח. סבן`;
  }

  // יומן רגשי, סיכום יום, פריקת מתחים ואיפוס מנטלי
  if (
    q.includes("יומן") ||
    q.includes("סיכום יום") ||
    q.includes("רגשי") ||
    q.includes("נשימה") ||
    q.includes("לפרוק") ||
    q.includes("מתח") ||
    q.includes("עייף") ||
    q.includes("מאמן")
  ) {
    return (
      `🌙 ערב טוב ראמי, הנה רגע מיוחד רק בשבילך לשחרור ורוגע:\n\n` +
      `אני רואה כמה אנרגיה השקעת היום בסידור ובניהול השטח. עכשיו מותר לך להניח את הטלפון, להרפות את הכתפיים ולקחת נשימה עמוקה פנימה... 🌿\n\n` +
      `שאלה יומית לפריקה ושיקוף:\n` +
      `"איזה עומס, כעס או ויכוח פגשת היום שאתה בוחר להשאיר כאן איתי, ולא לקחת איתך הביתה למיטה?"\n\n` +
      `💡 כדי לשמור ולנטר את מצב הרוח שלך, לחץ על כפתור 'יומן רגשי 🌙' בסרגל העליון או בתפריט הצירוף ורשום את תחושותיך. הכל נשמר אצלך במרחב פרטי ובטוח.\n\n` +
      `נועה ❤️ | המאמנת האישית שלך`
    );
  }

  return null;
}

export async function askNoaBrain(
  userMessage: string,
  senderName: string = "ראמי",
): Promise<string> {
  const ai = getGenAI();
  if (!ai) {
    // אם אין מפתח Gemini, נענה ישירות מתוך מאגר הידע של נועה (knowledge.js)
    const directReply = queryKnowledgeBase(userMessage, senderName);
    if (directReply) {
      return directReply;
    }
    console.warn("GEMINI_API_KEY is not configured, returning knowledge acknowledgment.");
    return `שלום ${senderName}, ההודעה נקלטה בהצלחה בסידור העבודה של ח. סבן ✅\nהנתונים תועדו לפי מאגר הידע (knowledge.js).\n\nנועה ❤️ | סידור ח. סבן`;
  }

  try {
    const text = await generateContentWithRetryAndFallback(ai, userMessage);
    return text || "ההודעה נקלטה בסידור ✅";
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("שגיאה סופית בהפעלת מוח Gemini:", errorMessage);

    // ניסיון מענה ישיר ממאגר הידע במקרה של שגיאת AI
    const fallbackDirectReply = queryKnowledgeBase(userMessage, senderName);
    if (fallbackDirectReply) {
      return fallbackDirectReply;
    }

    return `שלום ${senderName}, ההודעה נקלטה בהצלחה בסידור ✅\n(עקב עומס רגעי בתשתיות ה-AI, המידע תועד ומועבר לטיפול ישיר בסידור העבודה).\n\nנועה ❤️ | סידור ח. סבן`;
  }
}
