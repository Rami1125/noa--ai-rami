# Chat Companion AI

פעל כארכיטקט תוכנה ומתכנת Fullstack בכיר המתמחה ב-Next.js 14/15 (App Router), TypeScript, Tailwind CSS, PWA ופריסה ב-Vercel.

עליך לבנות אפליקציית Web PWA שהיא העתק מושלם (Pixel-Perfect WhatsApp Web Clone) של ממשק "נועה AI — ח. סבן חומרי בניין בע"מ".

### 1. דרישות תשתית ו-PWA עבור Vercel:

- שימוש ב-Next.js App Router (נתיב src/app).
- התאמה מלאה להתקנה כ-PWA במסך הבית (Mobile & Desktop) באמצעות @ducanh2912/next-pwa ו-manifest.ts.
- תמיכה במצב כהה (Dark Mode: רקע #0B141A, פאנלים #111B21, בר עליון #202C33) ומצב בהיר (Light Mode).
- תמונת פרופיל של נועה: https://i.ibb.co/whtMgBNC/Gemini-Generated-Image-2.png

### 2. ממשק משתמש מדמה WhatsApp (100% עיצוב):

1. מבנה הדף (Layout):
   - סיידבר רשימת שיחות מימין (תמיכה מלאה ב-RTL): כולל שורת חיפוש, טאבים ("הכל", "לא נקראו", "קבוצות"), ורשימת צ'אטים פעילים (קבוצת "עדכונים מהסידור", "קבלן שארק (מחסן 30)", "ורד אידלסון", "לינה").
   - חלון שיחה מרכזי: כותרת עליונה עם תמונת נועה, סטטוס "מחובר/ת כעת", כפתורי שיחה וחיפוש.
   - רקע שיחה: WhatsApp Doodle Wallpaper עדין.

2. בועות שיחה (Chat Bubbles):
   - בועה יוצאת (משתמש/ראמי): רקע #005C4B (בכהה), מיושרת לשמאל, עם שעת שליחה ווי כפול כחול (#53BDEB).
   - בועה נכנסת (נועה AI): רקע #202C33 (בכהה), מיושרת לימין.
   - תמיכה בכרטיסי משימה מעוצבים: כרטיס הזמנת מכולה עם כפתור Waze ואימוג'י פעולה תקניים (📥 הצבה, 🔄 החלפה, 📤 הוצאה).

3. סרגל קלט תחתון עם כל כלי WhatsApp:
   - כפתור אימוג'י ומדבקות.
   - כפתור מהדק קבצים (📎) שפותח תפריט פעולות: מסמך (צירוף PDF), מצלמה, גלריה, ומיקום Waze.
   - שדה קלט טקסט מעוגל עם placeholder "הקלד/י הודעה".
   - כפתור מיקרופון (🎙️) שמתחלף לחץ שליחה ירוק ברגע שיש טקסט.
   - סימולציית הקלטת קול חיה (Push-to-Talk) עם טיימר וגלי קול.

### 3. אינטגרציה דו-כיוונית מול Make.com:

- כל הודעה שנשלחת מהצ'אט משודרת ב-POST אל:
  https://hook.eu1.make.com/j1kfxfn5y4goe1lud3dk1phkw4bkjvyr
- ה-Payload כולל: source, senderName, messageBody, timestamp.
- בעת השליחה: הצג אנימציית "נועה מקלידה..." (Typing indicator).
- עם קבלת התגובה מ-Make בפורמט { "reply": "..." }, הזרק אותה ישירות לצ'אט וכבה את ה-Typing.

כתוב את כל הקבצים הנדרשים בצורה מלאה, מודולרית ונקייה ללא קיצורים או placeholders.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/d340ca07-2fd8-4dfe-ab20-6b46b56a1bee).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
