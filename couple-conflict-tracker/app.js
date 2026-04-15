/* ふたりノート - ケンカ & ラブレター
 *
 * すべてのデータは localStorage に保存されます。
 * データ構造:
 *   conflicts: [{ id, title, trigger, discussion, resolution, startDate, endDate, createdAt }]
 *   letters:   [{ id, author, message, createdAt }]
 */

const STORAGE_KEYS = {
  conflicts: "futari.conflicts.v1",
  letters: "futari.letters.v1",
};

// ---------- storage helpers ----------
function load(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error("load failed", e);
    return [];
  }
}

function save(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function formatDate(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()}`;
}

function escapeHtml(str = "") {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// ---------- tabs ----------
function setupTabs() {
  const tabs = document.querySelectorAll(".tab");
  const panels = document.querySelectorAll(".panel");
  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const target = tab.dataset.tab;
      tabs.forEach((t) => t.classList.toggle("active", t === tab));
      panels.forEach((p) => p.classList.toggle("active", p.id === target));
    });
  });
}

// ---------- conflicts ----------
const conflictForm = document.getElementById("conflict-form");
const conflictList = document.getElementById("conflict-list");
const conflictEmpty = document.getElementById("conflict-empty");
const conflictCount = document.getElementById("conflict-count");
const conflictCancel = document.getElementById("conflict-cancel");

function renderConflicts() {
  const items = load(STORAGE_KEYS.conflicts).sort((a, b) =>
    (b.startDate || "").localeCompare(a.startDate || "")
  );
  conflictCount.textContent = items.length;
  conflictEmpty.classList.toggle("show", items.length === 0);
  conflictList.innerHTML = items
    .map((c) => {
      const dates = c.endDate
        ? `${formatDate(c.startDate)} 〜 ${formatDate(c.endDate)}`
        : `${formatDate(c.startDate)} 〜 進行中`;
      return `
      <li class="item" data-id="${c.id}">
        <div class="item-head">
          <span class="item-title">${escapeHtml(c.title)}</span>
          <span class="item-dates">${dates}</span>
        </div>
        ${field("きっかけ", c.trigger)}
        ${field("話し合った内容", c.discussion)}
        ${field("解決方法", c.resolution)}
        <div class="item-actions">
          <button class="link" data-action="edit" data-id="${c.id}">編集</button>
          <button class="link" data-action="delete" data-id="${c.id}">削除</button>
        </div>
      </li>`;
    })
    .join("");
}

function field(label, value) {
  if (!value) return "";
  return `<p class="item-field"><span class="label">${label}</span>${escapeHtml(
    value
  )}</p>`;
}

function resetConflictForm() {
  conflictForm.reset();
  conflictForm.elements.id.value = "";
  conflictCancel.hidden = true;
  conflictForm.querySelector("button[type=submit]").textContent = "保存する";
}

conflictForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const fd = new FormData(conflictForm);
  const entry = {
    id: fd.get("id") || uid(),
    title: (fd.get("title") || "").trim(),
    trigger: (fd.get("trigger") || "").trim(),
    discussion: (fd.get("discussion") || "").trim(),
    resolution: (fd.get("resolution") || "").trim(),
    startDate: fd.get("startDate"),
    endDate: fd.get("endDate") || "",
    createdAt: new Date().toISOString(),
  };
  const list = load(STORAGE_KEYS.conflicts);
  const idx = list.findIndex((c) => c.id === entry.id);
  if (idx >= 0) list[idx] = { ...list[idx], ...entry };
  else list.push(entry);
  save(STORAGE_KEYS.conflicts, list);
  resetConflictForm();
  renderConflicts();
});

conflictCancel.addEventListener("click", resetConflictForm);

conflictList.addEventListener("click", (e) => {
  const btn = e.target.closest("button[data-action]");
  if (!btn) return;
  const id = btn.dataset.id;
  const list = load(STORAGE_KEYS.conflicts);
  if (btn.dataset.action === "delete") {
    if (!confirm("この記録を削除しますか？")) return;
    save(
      STORAGE_KEYS.conflicts,
      list.filter((c) => c.id !== id)
    );
    renderConflicts();
  } else if (btn.dataset.action === "edit") {
    const c = list.find((x) => x.id === id);
    if (!c) return;
    conflictForm.elements.id.value = c.id;
    conflictForm.elements.title.value = c.title || "";
    conflictForm.elements.trigger.value = c.trigger || "";
    conflictForm.elements.discussion.value = c.discussion || "";
    conflictForm.elements.resolution.value = c.resolution || "";
    conflictForm.elements.startDate.value = c.startDate || "";
    conflictForm.elements.endDate.value = c.endDate || "";
    conflictCancel.hidden = false;
    conflictForm.querySelector("button[type=submit]").textContent = "更新する";
    conflictForm.scrollIntoView({ behavior: "smooth", block: "start" });
  }
});

// ---------- letters ----------
const letterForm = document.getElementById("letter-form");
const letterList = document.getElementById("letter-list");
const letterEmpty = document.getElementById("letter-empty");
const letterCount = document.getElementById("letter-count");

function renderLetters() {
  const items = load(STORAGE_KEYS.letters).sort((a, b) =>
    (b.createdAt || "").localeCompare(a.createdAt || "")
  );
  letterCount.textContent = items.length;
  letterEmpty.classList.toggle("show", items.length === 0);
  letterList.innerHTML = items
    .map(
      (l) => `
      <li class="item" data-id="${l.id}">
        <div class="item-head">
          <span class="item-title">${escapeHtml(l.author)}より</span>
          <span class="item-dates">${formatDate(l.createdAt)}</span>
        </div>
        <p class="item-field">${escapeHtml(l.message)}</p>
        <div class="item-actions">
          <button class="link" data-action="delete-letter" data-id="${l.id}">削除</button>
        </div>
      </li>`
    )
    .join("");
}

letterForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const fd = new FormData(letterForm);
  const entry = {
    id: uid(),
    author: (fd.get("author") || "").trim(),
    message: (fd.get("message") || "").trim(),
    createdAt: new Date().toISOString(),
  };
  if (!entry.author || !entry.message) return;
  const list = load(STORAGE_KEYS.letters);
  list.push(entry);
  save(STORAGE_KEYS.letters, list);
  // 差出人だけは次回のために残してもいいが、リセットする
  letterForm.reset();
  renderLetters();
});

letterList.addEventListener("click", (e) => {
  const btn = e.target.closest("button[data-action=delete-letter]");
  if (!btn) return;
  if (!confirm("このラブレターを削除しますか？")) return;
  const id = btn.dataset.id;
  const list = load(STORAGE_KEYS.letters).filter((l) => l.id !== id);
  save(STORAGE_KEYS.letters, list);
  renderLetters();
});

// ---------- reveal ----------
const revealButton = document.getElementById("reveal-button");
const revealCard = document.getElementById("reveal-card");
let lastRevealedId = null;

function pickRandomLetter(letters, excludeId) {
  if (!letters.length) return null;
  if (letters.length === 1) return letters[0];
  const pool = letters.filter((l) => l.id !== excludeId);
  const arr = pool.length ? pool : letters;
  return arr[Math.floor(Math.random() * arr.length)];
}

revealButton.addEventListener("click", () => {
  const letters = load(STORAGE_KEYS.letters);
  if (!letters.length) {
    revealCard.innerHTML = `<p class="reveal-placeholder">まだラブレターがありません。<br/>「ラブレター」タブから一通書いてみよう。</p>`;
    return;
  }
  const letter = pickRandomLetter(letters, lastRevealedId);
  lastRevealedId = letter.id;
  revealCard.innerHTML = `
    <div>
      <p class="reveal-message">${escapeHtml(letter.message)}</p>
      <span class="reveal-author">— ${escapeHtml(letter.author)} より (${formatDate(letter.createdAt)})</span>
    </div>`;
  revealCard.classList.remove("pop");
  // next frame でアニメーションを発火
  requestAnimationFrame(() => revealCard.classList.add("pop"));
});

// ---------- 起動 ----------
setupTabs();
renderConflicts();
renderLetters();

// エクスポート (テスト用)
if (typeof module !== "undefined" && module.exports) {
  module.exports = { pickRandomLetter, formatDate, escapeHtml, uid };
}
