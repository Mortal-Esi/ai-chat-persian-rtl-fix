/**
 * AI Chat Persian RTL Fix
 * تشخیص خودکار پاراگراف‌ها/عناصر حاوی متن فارسی یا عربی و اعمال جهت درست (RTL)
 * حتی وقتی با کلمات لاتین (n8n, API, Cron و ...) مخلوط شده باشند.
 * کار می‌کند روی: Claude.ai, ChatGPT, Gemini, NotebookLM, Qwen Chat
 */

(function () {
  "use strict";

  // بازه یونیکد حروف فارسی/عربی
  const RTL_CHAR_REGEX = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;

  // عناصری که متن مستقیم و معنادار دارند و ارزش بررسی دارند
  // [contenteditable] برای پوشش باکس تایپ در ChatGPT/Gemini/NotebookLM/Qwen اضافه شده
  const TARGET_SELECTOR =
    "p, li, h1, h2, h3, h4, h5, h6, span, div, td, th, blockquote, label, a, [contenteditable]";

  // عناصری که هرگز نباید دستکاری بشن (کد، اسکریپت و ...)
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
  const BLOCK_MARK_CLASS = "prsn-rtl-block";

  // تگ‌هایی که واقعاً "بلوک" هستند؛ وقتی به یکی از این‌ها رسیدیم دیگر بالاتر نمی‌رویم
  const BLOCK_TAGS = new Set([
    "P",
    "LI",
    "H1",
    "H2",
    "H3",
    "H4",
    "H5",
    "H6",
    "TD",
    "TH",
    "BLOCKQUOTE",
    "DIV",
  ]);

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

  // بعضی سایت‌ها (مثل NotebookLM) یک پاراگراف را به چند <span> جدا
  // می‌شکنند (یکی برای بخش فارسی، یکی برای کلمه انگلیسی، و ...).
  // اگر فقط تک‌تک این span ها را RTL کنیم، چون هرکدام inline و مستقل
  // هستند، در کنار هم به‌درستی نمی‌چینند. راه‌حل: نزدیک‌ترین والد
  // بلوکی (پاراگراف/دیو بیرونی) را هم پیدا کرده و RTL را روی آن اعمال کن،
  // تا کل جریان متن (تمام span های داخلش) با هم به‌صورت یک بلوک راست‌چین شوند.
  function findBlockAncestor(el) {
    let node = el;
    let steps = 0;
    while (node && node !== document.body && steps < 6) {
      if (node.tagName && BLOCK_TAGS.has(node.tagName)) {
        return node;
      }
      node = node.parentElement;
      steps++;
    }
    return null;
  }

  // برخلاف نسخه قبلی، این تابع "قفل" نمی‌کند؛ هر بار که صدا زده می‌شود
  // دوباره ارزیابی می‌کند تا محتوای جایگزین‌شده (نه فقط append‌شده) هم پوشش داده شود.
  function processElement(el) {
    if (shouldSkip(el)) return;

    if (hasDirectRTLText(el)) {
      if (!el.classList.contains(MARK_CLASS)) {
        el.classList.add(MARK_CLASS);
      }
      // ست کردن مستقیم attribute dir، چون این معمولاً حتی از سبک‌های
      // scoped فریم‌ورک‌هایی مثل Angular (که در NotebookLM استفاده می‌شود) قوی‌تر است
      if (el.getAttribute("dir") !== "rtl") {
        el.setAttribute("dir", "rtl");
      }

      // والد بلوکی (پاراگراف/دیو بیرونی) را هم پیدا و راست‌چین کن تا
      // اگر متن به چند span تکه شده، همه با هم به‌صورت یک بلوک بچینند
      const blockAncestor = findBlockAncestor(el);
      if (blockAncestor && blockAncestor !== el) {
        if (!blockAncestor.classList.contains(BLOCK_MARK_CLASS)) {
          blockAncestor.classList.add(BLOCK_MARK_CLASS);
        }
        if (blockAncestor.getAttribute("dir") !== "rtl") {
          blockAncestor.setAttribute("dir", "rtl");
        }
      }
    } else if (el.classList.contains(MARK_CLASS)) {
      // دیگر متن فارسی مستقیم ندارد (مثلاً محتوا عوض شده) پس کلاس را بردار
      el.classList.remove(MARK_CLASS);
      el.removeAttribute("dir");
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

  // چون این سایت‌ها SPA هستند و محتوای جدید (پیام‌ها، پاسخ‌های استریم‌شده،
  // باکس تایپ) به‌صورت پویا اضافه/جایگزین می‌شود، با MutationObserver
  // محتوای تازه را رصد می‌کنیم.
  let debounceTimer = null;
  const pendingNodes = new Set();
  let fullRescanNeeded = false;

  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type === "childList") {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            pendingNodes.add(node);
          }
        });
        // اگر فرزندی حذف شد، والد را هم دوباره بررسی کن
        if (mutation.target && mutation.target.nodeType === Node.ELEMENT_NODE) {
          pendingNodes.add(mutation.target);
        }
      } else if (mutation.type === "characterData") {
        const parent = mutation.target.parentElement;
        if (parent) {
          pendingNodes.add(parent);
        }
      } else if (mutation.type === "attributes") {
        // برخی افزونه‌ها/فریم‌ورک‌ها با تغییر attribute محتوا رو جابه‌جا می‌کنن
        if (mutation.target && mutation.target.nodeType === Node.ELEMENT_NODE) {
          pendingNodes.add(mutation.target);
        }
      }
    }

    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      if (fullRescanNeeded || pendingNodes.size > 400) {
        // تعداد تغییرات خیلی زیاده (مثلاً ناوبری بین چت‌ها)؛ برای اطمینان کل صفحه را دوباره اسکن کن
        scan(document.body);
      } else {
        pendingNodes.forEach((node) => scan(node));
      }
      pendingNodes.clear();
      fullRescanNeeded = false;
    }, 80);
  });

  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
    characterData: true,
  });

  // بعضی سایت‌ها (مثل NotebookLM) هنگام تعویض نوت‌بوک/چت، محتوا رو کاملاً
  // جایگزین می‌کنن؛ یک اسکن دوره‌ای سبک هم به‌عنوان محافظ اضافه می‌کنیم.
  setInterval(() => {
    scan(document.body);
  }, 2000);
})();
