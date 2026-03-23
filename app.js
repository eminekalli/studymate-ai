// ===========================
//   STUDYMATE AI v3 — APP.JS
//   Study + AI Buddy (Pomodoro, Plan, Chat, Reminder)
// ===========================

// ── STATE ──────────────────
let currentMode = 'all';
let flashcards  = [];
let currentCard = 0;
let quizData    = [];
let currentLang = localStorage.getItem('sm_lang') || 'tr';
let isSpeaking  = false;
let chatHistory = [];
let pomInterval = null;
let pomSeconds  = 25 * 60;
let pomWork     = 25;
let pomBreak    = 5;
let pomRunning  = false;
let pomPhase    = 'work'; // 'work' | 'break'

pdfjsLib.GlobalWorkerOptions.workerSrc =
  'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

// ── TRANSLATIONS ───────────
const i18n = {
  tr: {
    badge:'Yapay Zeka Destekli', heroTitle:'Notlarını<br /><em>Zekaya</em> Çevir',
    heroSub:'PDF yükle, notunu çalış, AI arkadaşınla motive kal.', heroBtn:'Hemen Başla ↓',
    tabStudy:'📚 Çalış', tabBuddy:'🤖 AI Arkadaş',
    history:'Geçmiş', clearHistory:'Geçmişi Temizle', save:'Kaydet',
    apiNote:'Buradan ücretsiz alabilirsin →',
    inputTitle:'📄 Notunu Ekle', pdfUpload:'PDF yükle', pdfOr:'ya da sürükle bırak',
    pdfSub:'Dosya içindeki metin otomatik çıkarılır', remove:'✕ Kaldır',
    orText:'ya da metin yapıştır', placeholder:'Ders notunu buraya yapıştır...',
    modeAll:'✨ Hepsini Üret', modeSummary:'📝 Özet', modeFlash:'🃏 Flashcard', modeQuiz:'❓ Quiz',
    generate:'⚡ Üret', summaryTitle:'📝 Özet', copy:'Kopyala',
    flashTitle:'🃏 Flashcard\'lar', flipHint:'Kartı çevirmek için tıkla',
    prev:'← Önceki', next:'Sonraki →', quizTitle:'❓ Quiz',
    checkAnswers:'Cevapları Kontrol Et ✓', retry:'Tekrar Dene 🔄',
    historyEmpty:'Henüz geçmiş yok.', aiLang:'Türkçe',
    pomWork:'Çalış 25', pomLong:'Uzun 50', pomReady:'Hazır',
    pomStart:'▶ Başlat', pomPause:'⏸ Duraklat', pomReset:'↺ Sıfırla',
    pomWorking:'Odaklan 🔥', pomBreak:'Mola ☕', pomDone:'Harika iş! 🎉',
    planTitle:'Ders Planı Oluştur', makePlan:'📅 Plan Hazırla',
    reminderTitle:'Bugünkü Görev', makeReminder:'✨ Motivasyon + Plan Al',
    chatTitle:'AI Arkadaşınla Konuş',
  },
  en: {
    badge:'AI Powered', heroTitle:'Turn Your Notes<br />Into <em>Knowledge</em>',
    heroSub:'Upload PDFs, study your notes, stay motivated with your AI buddy.',
    heroBtn:'Get Started ↓',
    tabStudy:'📚 Study', tabBuddy:'🤖 AI Buddy',
    history:'History', clearHistory:'Clear History', save:'Save',
    apiNote:'Get your free key here →',
    inputTitle:'📄 Add Your Notes', pdfUpload:'Upload PDF', pdfOr:'or drag & drop',
    pdfSub:'Text is extracted automatically', remove:'✕ Remove',
    orText:'or paste text', placeholder:'Paste your lecture notes here...',
    modeAll:'✨ Generate All', modeSummary:'📝 Summary', modeFlash:'🃏 Flashcards',
    modeQuiz:'❓ Quiz', generate:'⚡ Generate', summaryTitle:'📝 Summary', copy:'Copy',
    flashTitle:'🃏 Flashcards', flipHint:'Click to flip card',
    prev:'← Prev', next:'Next →', quizTitle:'❓ Quiz',
    checkAnswers:'Check Answers ✓', retry:'Try Again 🔄',
    historyEmpty:'No history yet.', aiLang:'English',
    pomWork:'Work 25', pomLong:'Long 50', pomReady:'Ready',
    pomStart:'▶ Start', pomPause:'⏸ Pause', pomReset:'↺ Reset',
    pomWorking:'Stay focused 🔥', pomBreak:'Take a break ☕', pomDone:'Great job! 🎉',
    planTitle:'Create Study Plan', makePlan:'📅 Create Plan',
    reminderTitle:"Today's Task", makeReminder:'✨ Get Motivation + Plan',
    chatTitle:'Chat with Your AI Buddy',
  }
};

function t(key) { return i18n[currentLang][key] || key; }

function applyTranslations() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (i18n[currentLang][key] !== undefined) el.innerHTML = i18n[currentLang][key];
  });
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder');
    if (i18n[currentLang][key]) el.placeholder = i18n[currentLang][key];
  });
}

function setLang(lang) {
  currentLang = lang;
  localStorage.setItem('sm_lang', lang);
  document.getElementById('langTR').classList.toggle('active', lang === 'tr');
  document.getElementById('langEN').classList.toggle('active', lang === 'en');
  applyTranslations();
}

// ── THEME ──────────────────
function toggleTheme() {
  const html = document.documentElement;
  const isDark = html.getAttribute('data-theme') === 'dark';
  html.setAttribute('data-theme', isDark ? 'light' : 'dark');
  document.getElementById('themeBtn').textContent = isDark ? '🌙' : '☀️';
  localStorage.setItem('sm_theme', isDark ? 'light' : 'dark');
}

// ── TABS ───────────────────
function switchTab(tab, btn) {
  document.querySelectorAll('.tab').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  document.getElementById('tabStudy').style.display = tab === 'study' ? 'flex' : 'none';
  document.getElementById('tabBuddy').style.display = tab === 'buddy' ? 'flex' : 'none';
}

// ── HISTORY ────────────────
function getHistory() { return JSON.parse(localStorage.getItem('sm_history') || '[]'); }
function saveToHistory(item) {
  const h = getHistory();
  h.unshift({ ...item, id: Date.now(), date: new Date().toLocaleDateString() });
  if (h.length > 20) h.pop();
  localStorage.setItem('sm_history', JSON.stringify(h));
}
function renderHistory() {
  const list = document.getElementById('historyList');
  const h = getHistory();
  if (!h.length) { list.innerHTML = `<p class="history-empty">${t('historyEmpty')}</p>`; return; }
  list.innerHTML = h.map(item => `
    <div class="history-item" onclick="loadHistoryItem(${item.id})">
      <div class="history-item-title">${item.title}</div>
      <div class="history-item-meta">${item.date} · ${item.mode}</div>
    </div>`).join('');
}
function toggleHistory() {
  const panel = document.getElementById('historyPanel');
  const overlay = document.getElementById('historyOverlay');
  const open = panel.style.display !== 'none';
  panel.style.display = open ? 'none' : 'flex';
  overlay.style.display = open ? 'none' : 'block';
  if (!open) renderHistory();
}
function clearHistory() { localStorage.removeItem('sm_history'); renderHistory(); }
function loadHistoryItem(id) {
  const item = getHistory().find(h => h.id === id);
  if (!item) return;
  toggleHistory();
  document.getElementById('noteInput').value = item.note || '';
  updateCount();
  if (item.summary || item.flashcards?.length || item.quiz?.length) {
    document.getElementById('output').style.display = 'flex';
    if (item.summary) renderSummary(item.summary);
    if (item.flashcards?.length) renderFlashcards(item.flashcards);
    if (item.quiz?.length) renderQuiz(item.quiz);
  }
  switchTab('study', document.querySelector('.tab'));
}

// ── API KEY ────────────────
function saveKey() {
  const key = document.getElementById('apiKey').value.trim();
  if (!key.startsWith('sk-ant-')) { alert('Geçersiz anahtar.'); return; }
  localStorage.setItem('sm_key', key);
  const box = document.getElementById('apiBox');
  box.style.borderColor = '#2db67d';
  box.style.background = 'rgba(45,182,125,.08)';
  alert('✅ Kaydedildi!');
}
function getKey() { return localStorage.getItem('sm_key') || document.getElementById('apiKey').value.trim(); }

// ── PDF ────────────────────
async function handlePDF(file) {
  if (!file || file.type !== 'application/pdf') { alert('Geçerli bir PDF seç.'); return; }
  const inner = document.getElementById('pdfDropInner');
  inner.innerHTML = '<span class="pdf-icon">⏳</span><p>Okunuyor...</p>';
  try {
    const buf = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: buf }).promise;
    let text = '';
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const c = await page.getTextContent();
      text += c.items.map(s => s.str).join(' ') + '\n';
    }
    if (!text.trim()) { alert('PDF\'den metin çıkarılamadı.'); clearPDF(); return; }
    document.getElementById('noteInput').value = text.trim();
    updateCount();
    inner.style.display = 'none';
    document.getElementById('pdfFileName').textContent = `${file.name} (${pdf.numPages} sayfa)`;
    document.getElementById('pdfStatus').style.display = 'flex';
  } catch (e) { alert('PDF hatası: ' + e.message); clearPDF(); }
}
function handleDrop(e) {
  e.preventDefault();
  document.getElementById('pdfDrop').classList.remove('drag-over');
  const file = e.dataTransfer.files[0];
  if (file) handlePDF(file);
}
function clearPDF() {
  document.getElementById('noteInput').value = '';
  document.getElementById('pdfInput').value = '';
  document.getElementById('pdfStatus').style.display = 'none';
  const inner = document.getElementById('pdfDropInner');
  inner.style.display = 'block';
  inner.innerHTML = `<span class="pdf-icon">📎</span><p><strong>${t('pdfUpload')}</strong> ${t('pdfOr')}</p><p class="pdf-sub">${t('pdfSub')}</p>`;
  updateCount();
}

// ── HELPERS ────────────────
function updateCount() {
  const len = document.getElementById('noteInput').value.length;
  document.getElementById('charCount').textContent = len.toLocaleString() + ' karakter';
}
function setMode(btn, mode) {
  document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active'); currentMode = mode;
}
function setLoading(val) {
  document.getElementById('generateBtn').disabled = val;
  document.getElementById('btnText').style.display = val ? 'none' : 'inline';
  document.getElementById('spinner').style.display = val ? 'block' : 'none';
}
function showOutput() {
  const out = document.getElementById('output');
  out.style.display = 'flex'; out.style.flexDirection = 'column'; out.style.gap = '1.5rem';
  setTimeout(() => out.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
}
function copyText(id) { navigator.clipboard.writeText(document.getElementById(id).innerText).then(() => alert('Kopyalandı!')); }
function speakText(id) {
  if (!window.speechSynthesis) { alert('Tarayıcın sesli okumayı desteklemiyor.'); return; }
  if (isSpeaking) { speechSynthesis.cancel(); isSpeaking = false; return; }
  const utt = new SpeechSynthesisUtterance(document.getElementById(id).innerText);
  utt.lang = currentLang === 'tr' ? 'tr-TR' : 'en-US'; utt.rate = 0.9;
  utt.onend = () => { isSpeaking = false; };
  speechSynthesis.speak(utt); isSpeaking = true;
}
function exportSummaryPDF() {
  const text = document.getElementById('summaryContent').innerText;
  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>body{font-family:sans-serif;padding:40px;max-width:700px;margin:auto;line-height:1.7}h1{color:#e85c2e}</style></head><body><h1>StudyMate AI — Özet</h1><pre style="white-space:pre-wrap;font-family:sans-serif">${text}</pre><footer style="margin-top:40px;font-size:12px;color:#aaa">StudyMate AI · ${new Date().toLocaleDateString()}</footer></body></html>`;
  const win = window.open('', '_blank'); win.document.write(html); win.document.close(); win.print();
}
function exportAnki() {
  if (!flashcards.length) return;
  const tsv = flashcards.map(c => `${c.q}\t${c.a}`).join('\n');
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([tsv], { type: 'text/plain' }));
  a.download = 'studymate-anki.txt'; a.click();
}

// ── CLAUDE API ─────────────
async function callClaude(prompt, system = '') {
  const key = getKey();
  if (!key) throw new Error('API anahtarı bulunamadı.');
  const body = {
    model: 'claude-sonnet-4-20250514',
    max_tokens: 2000,
    messages: [{ role: 'user', content: prompt }]
  };
  if (system) body.system = system;
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': key,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true'
    },
    body: JSON.stringify(body)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || `API Hatası: ${res.status}`);
  }
  return (await res.json()).content[0].text;
}

async function callClaudeChat(messages) {
  const key = getKey();
  if (!key) throw new Error('API anahtarı bulunamadı.');
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': key,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true'
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      system: currentLang === 'tr'
        ? 'Sen StudyMate AI\'sın — samimi, enerjik ve motive edici bir AI çalışma arkadaşısın. Öğrencilere ders çalışmalarında yardım ediyorsun. Kısa, net ve motive edici cevaplar veriyorsun. Emoji kullanabilirsin. Türkçe konuş.'
        : 'You are StudyMate AI — a friendly, energetic, and motivating AI study buddy. You help students with their studies. Give short, clear, and motivating responses. You can use emojis. Speak in English.',
      messages
    })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || `API Hatası: ${res.status}`);
  }
  return (await res.json()).content[0].text;
}

// ── STUDY PROMPTS ──────────
function buildPrompt(note, mode) {
  const lang = t('aiLang');
  const base = `You are a study assistant. Analyze the following note and respond in ${lang}.\n\nNOTE:\n${note}\n\n`;
  if (mode === 'summary') return base + `Create a SUMMARY in bullet points (3-5 points, 1-2 sentences each). Return ONLY the summary.`;
  if (mode === 'flashcards') return base + `Create 5-8 flashcards. Return ONLY valid JSON:\n[{"q":"Question","a":"Answer"}]`;
  if (mode === 'quiz') return base + `Create a 4-question multiple choice quiz. Return ONLY valid JSON:\n[{"question":"Q?","options":["A) ...","B) ...","C) ...","D) ..."],"correct":0}]`;
  return base + `Do all three. Use EXACTLY this format:\n\n===SUMMARY===\n• Point 1\n• Point 2\n\n===FLASHCARDS===\n[{"q":"Q1","a":"A1"}]\n\n===QUIZ===\n[{"question":"Q?","options":["A) ...","B) ...","C) ...","D) ..."],"correct":0}]`;
}

function parseJSON(str) {
  const m = str.match(/\[[\s\S]*\]/);
  if (!m) throw new Error('JSON bulunamadı');
  return JSON.parse(m[0]);
}
function parseAll(text) {
  const sm = text.match(/===SUMMARY===([\s\S]*?)(?====FLASHCARDS===|$)/i);
  const fm = text.match(/===FLASHCARDS===([\s\S]*?)(?====QUIZ===|$)/i);
  const qm = text.match(/===QUIZ===([\s\S]*?)$/i);
  return {
    summary:    sm ? sm[1].trim() : '',
    flashcards: fm ? fm[1].trim() : '[]',
    quiz:       qm ? qm[1].trim() : '[]'
  };
}

// ── RENDER ─────────────────
function renderSummary(text) {
  document.getElementById('summaryContent').textContent = text;
  document.getElementById('summaryCard').style.display = 'block';
}
function renderFlashcards(data) {
  flashcards = data; currentCard = 0;
  document.getElementById('flashcardsCard').style.display = 'block';
  showCard();
}
function showCard() {
  if (!flashcards.length) return;
  const fc = flashcards[currentCard];
  document.getElementById('cardFront').textContent = fc.q;
  document.getElementById('cardBack').textContent  = fc.a;
  document.getElementById('flashcardInner').classList.remove('flipped');
  document.getElementById('cardNum').textContent = `${currentCard + 1} / ${flashcards.length}`;
  document.getElementById('cardCounter').textContent = `${flashcards.length} kart`;
}
function flipCard()  { document.getElementById('flashcardInner').classList.toggle('flipped'); }
function nextCard()  { currentCard = (currentCard + 1) % flashcards.length; showCard(); }
function prevCard()  { currentCard = (currentCard - 1 + flashcards.length) % flashcards.length; showCard(); }

function renderQuiz(data) {
  quizData = data;
  document.getElementById('quizCard').style.display = 'block';
  document.getElementById('quizContent').innerHTML = quizData.map((q, qi) => `
    <div class="quiz-question" id="qq${qi}">
      <p>${qi + 1}. ${q.question}</p>
      <div class="quiz-options">
        ${q.options.map((opt, oi) => `<label class="quiz-option" id="opt${qi}_${oi}"><input type="radio" name="q${qi}" value="${oi}"/>${opt}</label>`).join('')}
      </div>
    </div>`).join('');
  document.getElementById('submitQuiz').style.display = 'block';
  document.getElementById('retryQuiz').style.display  = 'none';
  document.getElementById('quizScore').style.display  = 'none';
}
function submitQuiz() {
  let correct = 0;
  quizData.forEach((q, qi) => {
    const sel = document.querySelector(`input[name="q${qi}"]:checked`);
    if (!sel) return;
    const ans = parseInt(sel.value);
    q.options.forEach((_, oi) => {
      const lbl = document.getElementById(`opt${qi}_${oi}`);
      lbl.style.pointerEvents = 'none';
      if (oi === q.correct) lbl.classList.add('correct');
      if (oi === ans && ans !== q.correct) lbl.classList.add('wrong');
    });
    if (ans === q.correct) correct++;
  });
  const score = document.getElementById('quizScore');
  score.textContent = `${correct} / ${quizData.length} doğru 🎯`;
  score.style.display = 'block';
  document.getElementById('submitQuiz').style.display = 'none';
  document.getElementById('retryQuiz').style.display  = 'block';
}
function retryQuiz() { renderQuiz(quizData); }

// ── MAIN GENERATE ──────────
async function generate() {
  const note = document.getElementById('noteInput').value.trim();
  if (!note) { alert('Lütfen bir not gir veya PDF yükle.'); return; }
  if (note.length < 50) { alert('Not çok kısa.'); return; }
  if (!getKey()) { alert('Önce API anahtarını kaydet.'); return; }
  document.getElementById('output').style.display = 'none';
  ['summaryCard','flashcardsCard','quizCard'].forEach(id => { document.getElementById(id).style.display = 'none'; });
  setLoading(true);
  try {
    const result = await callClaude(buildPrompt(note, currentMode));
    showOutput();
    let summaryText = '', fcData = [], qzData = [];
    if (currentMode === 'summary') {
      renderSummary(result); summaryText = result;
    } else if (currentMode === 'flashcards') {
      fcData = parseJSON(result); renderFlashcards(fcData);
    } else if (currentMode === 'quiz') {
      qzData = parseJSON(result); renderQuiz(qzData);
    } else {
      const parsed = parseAll(result);
      if (parsed.summary) { renderSummary(parsed.summary); summaryText = parsed.summary; }
      if (parsed.flashcards) { try { fcData = parseJSON(parsed.flashcards); renderFlashcards(fcData); } catch(e){} }
      if (parsed.quiz)       { try { qzData = parseJSON(parsed.quiz); renderQuiz(qzData); } catch(e){} }
    }
    const title = note.slice(0, 60) + (note.length > 60 ? '...' : '');
    saveToHistory({ title, note: note.slice(0, 500), mode: currentMode, summary: summaryText, flashcards: fcData, quiz: qzData });
  } catch (e) { alert('Hata: ' + e.message); } finally { setLoading(false); }
}

// ── POMODORO ───────────────
function setPomMode(btn, work, brk) {
  document.querySelectorAll('.pom-mode').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  pomWork = work; pomBreak = brk;
  pomReset();
}
function pomReset() {
  if (pomInterval) { clearInterval(pomInterval); pomInterval = null; }
  pomRunning = false; pomPhase = 'work';
  pomSeconds = pomWork * 60;
  updatePomDisplay();
  document.getElementById('pomLabel').textContent = t('pomReady');
  document.getElementById('pomStartBtn').textContent = t('pomStart');
  document.getElementById('pomRing').style.strokeDashoffset = '0';
}
function pomStart() {
  if (pomRunning) {
    clearInterval(pomInterval); pomInterval = null; pomRunning = false;
    document.getElementById('pomStartBtn').textContent = t('pomStart');
    return;
  }
  pomRunning = true;
  document.getElementById('pomStartBtn').textContent = t('pomPause');
  document.getElementById('pomLabel').textContent = pomPhase === 'work' ? t('pomWorking') : t('pomBreak');
  const total = (pomPhase === 'work' ? pomWork : pomBreak) * 60;
  pomInterval = setInterval(() => {
    pomSeconds--;
    updatePomDisplay();
    const circumference = 327;
    const offset = circumference * (1 - pomSeconds / total);
    document.getElementById('pomRing').style.strokeDashoffset = offset;
    if (pomSeconds <= 0) {
      clearInterval(pomInterval); pomInterval = null; pomRunning = false;
      if (pomPhase === 'work') {
        pomPhase = 'break'; pomSeconds = pomBreak * 60;
        document.getElementById('pomLabel').textContent = t('pomBreak');
        document.getElementById('pomStartBtn').textContent = t('pomStart');
        document.getElementById('pomRing').style.stroke = '#2db67d';
        if (Notification.permission === 'granted') new Notification('🍅 Mola zamanı!', { body: `${pomBreak} dakika mola ver.` });
      } else {
        pomPhase = 'work'; pomSeconds = pomWork * 60;
        document.getElementById('pomLabel').textContent = t('pomDone');
        document.getElementById('pomStartBtn').textContent = t('pomStart');
        document.getElementById('pomRing').style.stroke = 'var(--accent)';
        document.getElementById('pomRing').style.strokeDashoffset = '0';
        if (Notification.permission === 'granted') new Notification('⚡ Tekrar başla!', { body: 'Mola bitti, çalışmaya devam!' });
      }
    }
  }, 1000);
  if (Notification.permission === 'default') Notification.requestPermission();
}
function updatePomDisplay() {
  const m = Math.floor(pomSeconds / 60).toString().padStart(2, '0');
  const s = (pomSeconds % 60).toString().padStart(2, '0');
  document.getElementById('pomTime').textContent = `${m}:${s}`;
}

// ── STUDY PLAN ─────────────
async function generatePlan() {
  const topic = document.getElementById('examTopic').value.trim();
  const date  = document.getElementById('examDate').value;
  const hours = document.getElementById('dailyHours').value.trim();
  if (!topic || !date) { alert('Konu ve sınav tarihini gir.'); return; }
  if (!getKey()) { alert('API anahtarını kaydet.'); return; }
  const btn = document.getElementById('planBtn');
  btn.disabled = true;
  document.getElementById('planBtnText').style.display = 'none';
  document.getElementById('planSpinner').style.display = 'block';
  const today = new Date().toLocaleDateString(currentLang === 'tr' ? 'tr-TR' : 'en-US');
  const examDay = new Date(date).toLocaleDateString(currentLang === 'tr' ? 'tr-TR' : 'en-US');
  const prompt = currentLang === 'tr'
    ? `Bugün: ${today}. Sınav tarihi: ${examDay}. Konu: ${topic}. Günlük çalışma süresi: ${hours || '2 saat'}.\n\nBana günlük detaylı bir çalışma planı hazırla. Her gün için ne çalışılacağını yaz. Ayrıca motive edici bir giriş cümlesi ekle. Plan kısa, net ve uygulanabilir olsun.`
    : `Today: ${today}. Exam date: ${examDay}. Topic: ${topic}. Daily study time: ${hours || '2 hours'}.\n\nCreate a detailed daily study plan for me. Write what to study each day. Add a motivating opening sentence. Keep it short, clear and actionable.`;
  try {
    const result = await callClaude(prompt);
    const out = document.getElementById('planOutput');
    out.textContent = result;
    out.style.display = 'block';
  } catch (e) { alert('Hata: ' + e.message); }
  finally {
    btn.disabled = false;
    document.getElementById('planBtnText').style.display = 'inline';
    document.getElementById('planSpinner').style.display = 'none';
  }
}

// ── DAILY REMINDER ─────────
async function generateReminder() {
  const topic = document.getElementById('reminderTopic').value.trim();
  if (!topic) { alert('Bugün ne çalışacağını yaz.'); return; }
  if (!getKey()) { alert('API anahtarını kaydet.'); return; }
  const btn = document.getElementById('remBtn');
  btn.disabled = true;
  document.getElementById('remBtnText').style.display = 'none';
  document.getElementById('remSpinner').style.display = 'block';
  const prompt = currentLang === 'tr'
    ? `Öğrenci bugün şunu çalışacak: "${topic}"\n\n1. Önce kısa ve ateşleyici bir motivasyon mesajı yaz (2-3 cümle).\n2. Sonra bu konu için bugünkü çalışma oturumunu 3-4 adıma böl (sabah/öğle/akşam gibi).\n3. Son olarak tek cümlelik bir hedef yaz.\n\nSamimi, enerjik ve destekleyici bir ton kullan.`
    : `The student will study today: "${topic}"\n\n1. Write a short, energizing motivational message (2-3 sentences).\n2. Then break today's study session into 3-4 steps (morning/afternoon/evening etc.).\n3. Finally write a single-sentence goal.\n\nUse a sincere, energetic, supportive tone.`;
  try {
    const result = await callClaude(prompt);
    const out = document.getElementById('reminderOutput');
    out.textContent = result;
    out.style.display = 'block';
  } catch (e) { alert('Hata: ' + e.message); }
  finally {
    btn.disabled = false;
    document.getElementById('remBtnText').style.display = 'inline';
    document.getElementById('remSpinner').style.display = 'none';
  }
}

// ── CHAT ───────────────────
function addChatMsg(role, text) {
  const msgs = document.getElementById('chatMessages');
  const div = document.createElement('div');
  div.className = `chat-msg ${role}`;
  div.innerHTML = `<div class="chat-bubble">${text.replace(/\n/g,'<br>')}</div>`;
  msgs.appendChild(div);
  msgs.scrollTop = msgs.scrollHeight;
  return div;
}

async function sendChat() {
  const input = document.getElementById('chatInput');
  const text = input.value.trim();
  if (!text) return;
  if (!getKey()) { alert('API anahtarını kaydet.'); return; }
  input.value = '';
  addChatMsg('user', text);
  chatHistory.push({ role: 'user', content: text });
  const typing = addChatMsg('ai', '...');
  typing.classList.add('chat-typing');
  try {
    const reply = await callClaudeChat(chatHistory);
    typing.remove();
    addChatMsg('ai', reply);
    chatHistory.push({ role: 'assistant', content: reply });
    if (chatHistory.length > 20) chatHistory = chatHistory.slice(-20);
  } catch (e) {
    typing.remove();
    addChatMsg('ai', '❌ Hata: ' + e.message);
  }
}

function quickChat(text) {
  document.getElementById('chatInput').value = text;
  sendChat();
}

// ── INIT ───────────────────
window.addEventListener('DOMContentLoaded', () => {
  const savedTheme = localStorage.getItem('sm_theme') || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);
  document.getElementById('themeBtn').textContent = savedTheme === 'dark' ? '☀️' : '🌙';
  const savedKey = localStorage.getItem('sm_key');
  if (savedKey) {
    document.getElementById('apiKey').value = savedKey;
    const box = document.getElementById('apiBox');
    box.style.borderColor = '#2db67d';
    box.style.background = 'rgba(45,182,125,.08)';
  }
  setLang(currentLang);
  document.getElementById('tabStudy').style.display = 'flex';
  document.getElementById('tabBuddy').style.display  = 'none';
  const today = new Date().toISOString().split('T')[0];
  document.getElementById('examDate').setAttribute('min', today);
});
