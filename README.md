<div align="center">

# 🩹 AI Chat Persian RTL Fix

**اصلاح خودکار جهت متن فارسی/عربی مخلوط با انگلیسی در Claude، ChatGPT، Gemini، NotebookLM و Qwen Chat**

*Automatically fixes broken Persian/Arabic text direction on Claude, ChatGPT, Gemini, NotebookLM, and Qwen Chat*

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Chrome Extension](https://img.shields.io/badge/Chrome-Extension-4285F4?logo=googlechrome&logoColor=white)](#-نصب--installation)
[![Manifest V3](https://img.shields.io/badge/Manifest-V3-brightgreen)](manifest.json)

</div>

---

## 😩 مشکل چیه؟

وقتی توی چت‌بات‌های هوش مصنوعی متن فارسی با کلمات انگلیسی مثل `API`، `n8n`، `Cron` قاطی میشه، مرورگر جهت متن رو اشتباه تشخیص می‌ده و کلمات/ترتیب بهم می‌ریزه. این افزونه این مشکل رو **به‌صورت کاملاً خودکار** روی پنج پلتفرم پرکاربرد حل می‌کنه — نصب کن، فراموشش کن.

<div align="center">

| قبل ❌ | بعد ✅ |
|:---:|:---:|
| متن به‌هم‌ریخته و جهت اشتباه | متن مرتب، خوانا، و راست‌به‌چپ |

</div>

## 🇬🇧 The Problem

When Persian/Arabic text mixes with English words (like `API`, `n8n`, `Cron`) in AI chat interfaces, the browser misjudges text direction, scrambling word order and layout. This extension fixes it automatically across five popular platforms — install once, forget about it.

## 🌐 پلتفرم‌های پشتیبانی‌شده | Supported Platforms

| پلتفرم | آدرس |
|---|---|
| 🟠 Claude | claude.ai |
| 🟢 ChatGPT | chatgpt.com |
| 🔵 Gemini | gemini.google.com |
| 📘 NotebookLM | notebooklm.google.com |
| 🟣 Qwen Chat | chat.qwen.ai |

---

## ✨ ویژگی‌ها | Features

- 🔄 **کاملاً خودکار** — نیازی به کلیک یا تنظیم نداره
- ⚡ **سبک و سریع** — هیچ تاثیری روی سرعت صفحه نداره
- 🧠 **هوشمند** — بلوک‌های کد رو دست‌نخورده نگه می‌داره (LTR می‌مونن)
- 🔴 **زنده (Live)** — با `MutationObserver` محتوای جدید (پاسخ‌های استریم‌شده) رو هم پوشش می‌ده
- 🔒 **حریم خصوصی کامل** — هیچ داده‌ای جمع‌آوری، ارسال، یا ذخیره نمی‌شه؛ فقط CSS محلی روی صفحه اعمال می‌شه
- 🎯 **فقط روی چهار سایت هدف** — Claude، ChatGPT، Gemini و NotebookLM؛ دست به هیچ سایت دیگه‌ای نمی‌زنه
- ⌨️ **باکس تایپ رو هم پوشش می‌ده** — متن در حال نوشتن خودت هم درست نمایش داده می‌شه

---

## 📦 نصب | Installation

> این افزونه فعلاً روی Chrome Web Store منتشر نشده و باید به‌صورت دستی (unpacked) نصب بشه.
> Not yet published on the Chrome Web Store — install manually for now.

1. این ریپازیتوری رو دانلود کن (**Code → Download ZIP**) یا کلون کن:
   ```bash
   git clone https://github.com/<your-username>/ai-chat-persian-rtl-fix.git
   ```
2. کروم رو باز کن و برو به `chrome://extensions`
3. گوشه بالا-راست، **Developer mode** رو روشن کن
4. روی **Load unpacked** کلیک کن و پوشه پروژه رو انتخاب کن
5. یکی از این صفحات رو رفرش کن — تمام! ✅
   [Claude](https://claude.ai) · [ChatGPT](https://chatgpt.com) · [Gemini](https://gemini.google.com) · [NotebookLM](https://notebooklm.google.com) · [Qwen Chat](https://chat.qwen.ai)

---

## 🛠 چطور کار می‌کنه | How It Works

افزونه با یک content script ساده:

1. تمام پاراگراف‌ها، لیست‌ها، و سلول‌های صفحه رو اسکن می‌کنه
2. هر عنصری که مستقیماً حاوی حروف فارسی/عربی باشه رو تشخیص می‌ده (بازه یونیکد `\u0600-\u06FF` و مشابه)
3. کلاس CSS با `direction: rtl` و `unicode-bidi: plain-text` بهش اضافه می‌کنه
4. بلوک‌های `<code>` و `<pre>` رو مستثنی می‌کنه تا کد همیشه چپ‌به‌راست بمونه
5. با `MutationObserver`، محتوای جدیدی که به‌صورت پویا لود میشه (مثل پاسخ‌های در حال استریم) رو هم زیر نظر می‌گیره
6. باکس‌های تایپ `contenteditable` (نوع رایج در ChatGPT/Gemini/NotebookLM/Qwen) رو هم پوشش می‌ده
7. هر عنصر در هر بار اسکن دوباره ارزیابی می‌شه (نه فقط یک‌بار) تا محتوای جایگزین‌شده (نه فقط اضافه‌شده) هم درست دیده بشه؛ یک اسکن دوره‌ای سبک هم به‌عنوان محافظ اضافه شده

```
content.js   → منطق تشخیص و اصلاح جهت متن
style.css    → کلاس‌های RTL/LTR
manifest.json → پیکربندی افزونه (Manifest V3)
popup.html   → نمایش وضعیت افزونه
```

---

## 🤝 مشارکت | Contributing

پول ریکوئست و ایشو خوش‌آمده! اگه جایی هنوز متن به‌هم‌ریخته دیدی، لطفاً یک issue با اسکرین‌شات باز کن.

Pull requests and issues are welcome! If you spot any remaining layout glitches, please open an issue with a screenshot.

---

## 📄 مجوز | License

MIT — رایگان برای استفاده، تغییر، و توزیع.

MIT — free to use, modify, and distribute.

---

<div align="center">

ساخته‌شده با ❤️ برای جامعه فارسی‌زبان کاربران هوش مصنوعی

Made with ❤️ for the Persian-speaking AI chat community

</div>
