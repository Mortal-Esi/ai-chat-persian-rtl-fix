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

  // تگ‌های ساختاری جدول که هرگز نباید dir="rtl" یا direction:rtl بگیرند،
  // چون این باعث می‌شود مرورگر ترتیب فیزیکی ستون‌ها را برعکس کند و در
  // جدول‌هایی که ردیف‌هایشان تعداد سلول نامساوی دارد، چیدمان را خراب کند.
  // فقط متن داخل سلول‌ها (td/th) باید راست‌چین شود، نه خود جدول/ردیف.
  const TABLE_STRUCTURAL_TAGS = new Set([
    "TABLE",
    "THEAD",
    "TBODY",
    "TFOOT",
    "TR",
  ]);

  function shouldSkip(el) {
    if (!el || !el.tagName) return true;
    if (SKIP_TAGS.has(el.tagName)) return true;
    if (TABLE_STRUCTURAL_TAGS.has(el.tagName)) return true;
    if (el.closest && el.closest("pre, code")) return true;
    return false;
  }

  // --- پردازش مخصوص بلوک‌های کد ---
  // داخل ``` معمولاً شبه‌کد یا کامنت‌های فارسی هم دیده می‌شود
  // (مثلاً «// یک کاری انجام بده»). چون کل بلوک باید ساختار کد را حفظ کند
  // (تورفتگی، ترتیب کاراکترها) نمی‌توان کل <pre><code> را RTL کرد، اما
  // می‌توان هر خط را جدا بررسی کرد: اگر خط عمدتاً فارسی است، آن خط را
  // در یک span با dir="rtl" پیچید بدون آن‌که خطوط کد خالص لمس شوند.
  const CODE_MARK_CLASS = "prsn-rtl-code-line";
  const CODE_PROCESSED_ATTR = "data-prsn-code-checked";

  function isMostlyRTLLine(text) {
    const trimmed = text.trim();
    if (!trimmed) return false;
    const rtlMatches = trimmed.match(
      /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/g
    );
    const rtlCount = rtlMatches ? rtlMatches.length : 0;
    // اگر حداقل چند کاراکتر فارسی/عربی در خط باشد، خط را فارسی‌محور در نظر بگیر
    return rtlCount >= 2;
  }

  function processCodeBlock(codeEl) {
    if (!codeEl || codeEl.getAttribute(CODE_PROCESSED_ATTR) === codeEl.textContent.length + "") {
      // اگر طول متن از آخرین بار تغییر نکرده، دوباره پردازش نکن (بهینه‌سازی سبک)
      return;
    }

    // هر <div> یا خط داخل بلوک کد را پیدا کن. اکثر هایلایترها هر خط را
    // در یک عنصر جدا (span/div) می‌گذارند؛ اگر نه، از خود متن با \n جدا می‌کنیم.
    const lineContainers = codeEl.querySelectorAll(":scope > div, :scope > span");

    if (lineContainers.length > 0) {
      lineContainers.forEach((lineEl) => {
        const text = lineEl.textContent || "";
        if (isMostlyRTLLine(text)) {
          if (lineEl.getAttribute("dir") !== "rtl") {
            lineEl.setAttribute("dir", "rtl");
          }
          lineEl.classList.add(CODE_MARK_CLASS);
        } else if (lineEl.classList.contains(CODE_MARK_CLASS)) {
          lineEl.removeAttribute("dir");
          lineEl.classList.remove(CODE_MARK_CLASS);
        }
      });
    }

    codeEl.setAttribute(CODE_PROCESSED_ATTR, codeEl.textContent.length + "");
  }

  function scanCodeBlocks(root) {
    if (!root || root.nodeType !== Node.ELEMENT_NODE) return;

    if (root.matches && root.matches("pre code, code")) {
      processCodeBlock(root);
    }

    const codeEls = root.querySelectorAll("pre code, pre");
    codeEls.forEach((el) => {
      // اگر خود <pre> بدون <code> داخلش باشد هم پوشش بده
      const target = el.querySelector("code") || el;
      processCodeBlock(target);
    });
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

    // بلوک‌های کد را جدا و خط‌به‌خط بررسی کن
    scanCodeBlocks(root);
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
