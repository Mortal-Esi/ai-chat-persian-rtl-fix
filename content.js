/**
 * AI Chat Persian RTL Fix
 * تشخیص خودکار پاراگراف‌ها/عناصر حاوی متن فارسی یا عربی و اعمال جهت درست (RTL)
 * حتی وقتی با کلمات لاتین (n8n, API, Cron و ...) مخلوط شده باشند.
 * کار می‌کند روی: Claude.ai, ChatGPT, Gemini, NotebookLM
 */

(function () {
  "use strict";

  // بازه یونیکد حروف فارسی/عربی
  const RTL_CHAR_REGEX = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;

  // عناصری که متن مستقیم و معنادار دارند و ارزش بررسی دارند
  // [contenteditable] برای پوشش باکس تایپ در ChatGPT/Gemini/NotebookLM اضافه شده
  const TARGET_SELECTOR =
    "p, li, h1, h2, h3, h4, h5, h6, span, div, td, th, blockquote, label, a, [contenteditable]";

  // عناصری که هرگز نباید دستکاری بشن (کد، اسکریپت و ...)
  // توجه: TEXTAREA/INPUT از SKIP حذف نشده چون این‌ها معمولاً متن مستقیم DOM ندارند؛
  // باکس تایپ سایت‌های هدف اغلب contenteditable div است، نه textarea.
  const SKIP_TAGS = new Set([
    "SCRIPT",
    "STYLE",
    "TEXTAREA",
    "INPUT",
    "CODE",
    "PRE",
    "SVG",
  ]);

  const MARK_CLASS = "prsn-rtl-fixed";
  const PROCESSED_ATTR = "data-prsn-checked";

  function hasDirectRTLText(el) {
    // فقط متن مستقیم این عنصر (نه فرزندان بلوکی) رو چک می‌کنیم
    // تا هر والد بی‌جهت به‌خاطر فرزند دور علامت نخوره
    for (const node of el.childNodes) {
      if (node.nodeType === Node.TEXT_NODE) {
        if (RTL_CHAR_REGEX.test(node.textContent)) {
          return true;
        }
      }
    }
    return false;
  }

  function shouldSkip(el) {
    if (!el || !el.tagName) return true;
    if (SKIP_TAGS.has(el.tagName)) return true;
    if (el.closest && el.closest("pre, code")) return true;
    return false;
  }

  function processElement(el) {
    if (shouldSkip(el)) return;
    if (el.hasAttribute(PROCESSED_ATTR)) return;

    el.setAttribute(PROCESSED_ATTR, "1");

    if (hasDirectRTLText(el)) {
      el.classList.add(MARK_CLASS);
    }
  }

  function scan(root) {
    if (!root || root.nodeType !== Node.ELEMENT_NODE) return;

    // خود ریشه رو هم بررسی کن
    processElement(root);

    const elements = root.querySelectorAll(TARGET_SELECTOR);
    elements.forEach(processElement);
  }

  // اسکن اولیه صفحه
  function initialScan() {
    scan(document.body);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initialScan);
  } else {
    initialScan();
  }

  // چون Claude.ai یک SPA است و پیام‌ها/محتوای جدید به‌صورت پویا اضافه می‌شود،
  // با MutationObserver محتوای تازه را هم پوشش می‌دهیم.
  let debounceTimer = null;
  const pendingNodes = new Set();

  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type === "childList") {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            pendingNodes.add(node);
          }
        });
      } else if (mutation.type === "characterData") {
        const parent = mutation.target.parentElement;
        if (parent) {
          // متن تغییر کرده (مثلاً استریم شدن پاسخ) پس باید دوباره چک بشه
          parent.removeAttribute(PROCESSED_ATTR);
          pendingNodes.add(parent);
        }
      }
    }

    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      pendingNodes.forEach((node) => scan(node));
      pendingNodes.clear();
    }, 80);
  });

  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
    characterData: true,
  });
})();
