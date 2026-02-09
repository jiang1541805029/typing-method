const editor = document.getElementById("editor");
const display = document.getElementById("display");
const capture = document.getElementById("capture");
const result = document.getElementById("result");
const rawCountEl = document.getElementById("rawCount");
const outCountEl = document.getElementById("outCount");
const statusEl = document.getElementById("status");
const hintEl = document.getElementById("hint");
const resetBtn = document.getElementById("resetBtn");
const copyBtn = document.getElementById("copyBtn");

const rawStream = [];
let statusTimer = null;

const CJK_RE = /[\u3400-\u4DBF\u4E00-\u9FFF\uF900-\uFAFF]/;
const PUNC_RE = /[\u3000-\u303F\uFF00-\uFFEF]/;
const EXTRA_PUNC_RE = /[，。！？；：、（）《》【】「」『』“”‘’—…·]/;

function isCountable(ch) {
  return CJK_RE.test(ch) || PUNC_RE.test(ch) || EXTRA_PUNC_RE.test(ch);
}

function applyRule(stream) {
  const output = [];
  for (let i = 0; i < stream.length; i++) {
    const ch = stream[i];
    if ((i + 1) % 2 === 0) {
      output.pop();
      output.push(ch);
    } else {
      output.push(ch);
    }
  }
  return output.join("");
}

function setStatus(text, timeout = 1600) {
  statusEl.textContent = text;
  if (statusTimer) clearTimeout(statusTimer);
  if (timeout > 0) {
    statusTimer = setTimeout(() => {
      statusEl.textContent = "准备就绪";
    }, timeout);
  }
}

function updateDisplay() {
  const output = applyRule(rawStream);
  display.textContent = output;
  result.value = output;
  rawCountEl.textContent = rawStream.length;
  outCountEl.textContent = output.length;
}

function handleInsert(text) {
  if (!text) return;
  let ignored = 0;
  for (const ch of text) {
    if (isCountable(ch)) {
      rawStream.push(ch);
    } else {
      ignored++;
    }
  }
  if (ignored > 0) {
    setStatus("已忽略非中文字符", 1800);
    hintEl.textContent = "当前已忽略非中文字符输入。";
  } else {
    hintEl.textContent = "只支持中文和中文标点。粘贴会被忽略。";
  }
  updateDisplay();
}

function handleBackspace() {
  if (rawStream.length === 0) return;
  rawStream.pop();
  updateDisplay();
}

function resetAll() {
  rawStream.length = 0;
  updateDisplay();
  setStatus("已清空", 1200);
}

function copyOutput() {
  if (!result.value) {
    setStatus("没有可复制内容", 1200);
    return;
  }
  navigator.clipboard
    .writeText(result.value)
    .then(() => setStatus("已复制到剪贴板", 1200))
    .catch(() => setStatus("复制失败，请手动复制", 2000));
}

editor.addEventListener("click", () => {
  capture.focus();
});

capture.addEventListener("input", () => {
  if (!capture.value) return;
  handleInsert(capture.value);
  capture.value = "";
});

capture.addEventListener("keydown", (event) => {
  if (event.key === "Backspace" || event.key === "Delete") {
    event.preventDefault();
    handleBackspace();
  }
});

capture.addEventListener("paste", (event) => {
  event.preventDefault();
  setStatus("已拦截粘贴", 1500);
});

resetBtn.addEventListener("click", resetAll);
copyBtn.addEventListener("click", copyOutput);

updateDisplay();
setStatus("准备就绪", 0);
