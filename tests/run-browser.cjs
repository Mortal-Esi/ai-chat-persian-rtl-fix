// No npm dependencies. CHROME_BIN may point to Chrome or Chromium.
const { spawn } = require("node:child_process");
const { mkdtempSync, rmSync } = require("node:fs");
const { tmpdir } = require("node:os");
const { join, resolve } = require("node:path");
const { pathToFileURL } = require("node:url");
const assert = require("node:assert/strict");

const binary = process.env.CHROME_BIN || (process.platform === "darwin"
  ? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" : "google-chrome");
const profile = mkdtempSync(join(tmpdir(), "persian-rtl-test-"));
const chrome = spawn(binary, ["--headless", "--no-sandbox", "--remote-debugging-pipe",
  "--disable-background-networking", "--user-data-dir=" + profile],
  { stdio: ["ignore", "ignore", "ignore", "pipe", "pipe"] });
const pending = new Map();
let sequence = 0;
let buffer = "";
chrome.stdio[4].on("data", data => {
  buffer += data.toString();
  let end;
  while ((end = buffer.indexOf("\0")) !== -1) {
    const message = JSON.parse(buffer.slice(0, end));
    buffer = buffer.slice(end + 1);
    const entry = pending.get(message.id);
    if (entry) {
      pending.delete(message.id);
      clearTimeout(entry.timer);
      message.error ? entry.reject(Error(JSON.stringify(message.error))) : entry.resolve(message.result);
    }
  }
});
function send(method, params = {}, sessionId) {
  return new Promise((resolve, reject) => {
    const id = ++sequence;
    const timer = setTimeout(() => { pending.delete(id); reject(Error(method + " timed out")); }, 10000);
    pending.set(id, { resolve, reject, timer });
    chrome.stdio[3].write(JSON.stringify({ id, method, params, sessionId }) + "\0");
  });
}
chrome.on("error", error => {
  for (const entry of pending.values()) { clearTimeout(entry.timer); entry.reject(error); }
  pending.clear();
});
(async () => {
  try {
    for (const file of ["mixed-text.html", "regressions.html"]) {
      const { targetId } = await send("Target.createTarget",
        { url: pathToFileURL(resolve(__dirname, file)).href });
      const { sessionId } = await send("Target.attachToTarget", { targetId, flatten: true });
      let status;
      const deadline = Date.now() + 10000;
      do {
        const result = await send("Runtime.evaluate",
          { expression: 'document.querySelector("output")?.textContent' }, sessionId);
        status = result.result.value;
        if (status === "PASS" || status?.startsWith("FAIL")) break;
        await new Promise(resolve => setTimeout(resolve, 50));
      } while (Date.now() < deadline);
      console.log(file + ": " + status);
      assert.equal(status, "PASS");
      await send("Target.closeTarget", { targetId });
    }
  } finally {
    const closed = new Promise(resolve => chrome.once("exit", resolve));
    chrome.kill();
    await closed;
    rmSync(profile, { recursive: true, force: true });
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
