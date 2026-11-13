"use strict";
const copyButton = document.getElementById("copy-url");
copyButton.addEventListener("click", async () => {
  const message = document.getElementById("copy-status");
  try {
    await navigator.clipboard.writeText("chrome://extensions");
    copyButton.textContent = "کپی شد";
    message.textContent = "نشانی صفحهٔ افزونه‌ها کپی شد.";
  } catch {
    copyButton.textContent = "انتخاب نشانی";
    const range = document.createRange();
    range.selectNodeContents(document.getElementById("extensions-url"));
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
    message.textContent = "نشانی انتخاب شد؛ آن را با دستور کپی مرورگر کپی کنید.";
  }
});
