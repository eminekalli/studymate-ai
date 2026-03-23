# 📚 StudyMate AI

> Upload a PDF or paste your notes — let AI instantly generate summaries, flashcards, and quizzes.

**Future Talent Program — Module 201 Graduation Project**  
*AI-Powered Application Development*

---

## 🌐 Live Demo

👉 **[eminekalli.github.io/studymate-ai](https://eminekalli.github.io/studymate-ai)**

---

## ✨ Features

| Feature | Description |
|---|---|
| 📎 **PDF Upload** | Drag & drop a PDF — text is extracted automatically |
| 📝 **Auto Summary** | Condenses notes into bullet points |
| 🃏 **Flashcard Generator** | Flippable question-answer cards |
| ❓ **Multiple Choice Quiz** | Interactive 4-question quiz with scoring |
| 💾 **History** | All sessions saved to browser storage |
| 🌍 **Multilingual** | Turkish / English UI & AI output |
| 🌙 **Dark Mode** | Full dark theme support |
| 🔊 **Text-to-Speech** | Listen to summaries aloud |
| 📄 **Export Summary** | Print / save as PDF |
| 📦 **Anki Export** | Export flashcards as `.txt` for Anki |
| 🤖 **AI Buddy** | Chat, motivation, study plans, daily reminders |
| 🍅 **Pomodoro Timer** | 25/50 min focus sessions with break alerts |

---

## 🛠️ Tech Stack

- **Frontend:** Vanilla HTML + CSS + JavaScript — zero dependencies, no build step
- **AI:** Anthropic Claude API (`claude-sonnet-4-20250514`)
- **PDF Parsing:** PDF.js (via CDN)
- **Storage:** localStorage (no backend needed)
- **Deploy:** GitHub Pages

---

## 🚀 Getting Started

### 1. Clone the repo
```bash
git clone https://github.com/YOUR_USERNAME/studymate-ai.git
cd studymate-ai
```

### 2. Open in browser
```bash
open index.html
# or
npx serve .
```

### 3. Get a Claude API Key
- Go to [console.anthropic.com](https://console.anthropic.com)
- Sign up (Google login works)
- **API Keys → Create Key**
- Paste it into the app and click **Save**

### 4. Start studying!
- Upload a PDF **or** paste your notes
- Choose: Summary / Flashcards / Quiz / All
- Hit **⚡ Generate**

---

## 📂 Project Structure

```
studymate-ai/
├── index.html   # App structure & UI
├── style.css    # Styles + dark mode + animations
├── app.js       # All logic: Claude API, PDF, i18n, TTS, history, exports
└── README.md    # This file
```

---

## 🔐 Privacy & Security

- Your API key is stored **only in your browser's localStorage**
- No backend, no database, no data ever leaves your device (except the note sent to Claude API)

---

## 🗺️ Roadmap

- [ ] User accounts (Supabase)
- [ ] Spaced repetition algorithm
- [ ] Class sharing
- [ ] Mobile app (PWA)
- [ ] Teacher analytics dashboard

---

## 👤 Developer

**[EMİNE KALLİ]**  
Future Talent Program — Cohort 2025  
(https://www.linkedin.com/in/emine-k-034b6b297/)

---

*Powered by Claude API — Anthropic*
