"use strict";

async function updateStatus() {
  const panel = document.getElementById("status");
  const title = document.getElementById("status-title");
  const detail = document.getElementById("status-detail");
  const site = document.getElementById("site");
  site.hidden = true;
  site.textContent = "";
  try {
    if (typeof chrome === "undefined" || !chrome.tabs?.query || !chrome.runtime?.getManifest) {
      throw new Error("Extension context unavailable");
    }
    const manifest = chrome.runtime.getManifest();
    document.getElementById("version").textContent = "v" + manifest.version;
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.url) throw new Error("Tab URL unavailable");
    const url = new URL(tab.url);
    const matches = manifest.content_scripts.flatMap(script => script.matches);
    const supported = matches.some(pattern => {
      // The manifest currently uses exact HTTP(S) hosts with a /* path.
      const expected = new URL(pattern);
      return expected.protocol === url.protocol && expected.hostname === url.hostname;
    });
    panel.dataset.state = supported ? "supported" : "unsupported";
    title.textContent = supported ? "این سایت در فهرست پشتیبانی است" : "این صفحه پشتیبانی نمی‌شود";
    detail.textContent = supported
      ? "اگر متن هنوز نامرتب است، صفحه را دوباره بارگذاری کن. این بررسی فقط دامنه را تأیید می‌کند."
      : "افزونه فقط در سایت‌های فهرست‌شده و صفحات HTTP localhost اجرا می‌شود.";
    if (url.hostname) {
      site.textContent = url.host;
      site.hidden = false;
    }
  } catch {
    panel.dataset.state = "unavailable";
    title.textContent = "وضعیت صفحه در دسترس نیست";
    detail.textContent = "این پنجره را از آیکون افزونه در تب موردنظر باز کن؛ در صفحات محدود ممکن است نشانی تب در دسترس نباشد.";
  }
}
updateStatus();
