const test = require("node:test");
const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const { join } = require("node:path");
const vm = require("node:vm");
const root = join(__dirname, "..");
const script = readFileSync(join(root, "popup.js"), "utf8");
const manifest = JSON.parse(readFileSync(join(root, "manifest.json"), "utf8"));

async function render(url, options = {}) {
  const elements = new Map();
  const document = { getElementById(id) {
    if (!elements.has(id)) elements.set(id, { textContent: "", hidden: false, dataset: {} });
    return elements.get(id);
  } };
  const chrome = options.noContext ? undefined : {
    runtime: { getManifest: () => manifest },
    tabs: { query: async query => {
      assert.deepEqual(JSON.parse(JSON.stringify(query)), { active: true, currentWindow: true });
      if (options.denied) throw Error("Access denied");
      return options.noTab ? [] : [{ url }];
    } }
  };
  await vm.runInNewContext(script, { document, chrome, URL });
  return id => document.getElementById(id);
}

for (const url of [
  "https://claude.ai/new", "https://chatgpt.com/c/123",
  "https://chat.openai.com/", "https://gemini.google.com/app",
  "https://notebooklm.google.com/", "https://chat.qwen.ai/",
  "http://localhost:4312/chat"
]) test("Supported domain: " + url, async () => {
  const get = await render(url);
  assert.equal(get("status").dataset.state, "supported");
  assert.equal(get("site").textContent, new URL(url).host);
  assert.equal(get("site").hidden, false);
  assert.equal(get("version").textContent, "v" + manifest.version);
  assert.match(get("status-detail").textContent, /فقط دامنه/);
});

for (const url of [
  "https://chatgpt.com.example.org/", "https://example.org/?next=https://claude.ai",
  "http://claude.ai/", "https://localhost:4312/", "http://127.0.0.1:4312/",
  "chrome://extensions/", "file:///tmp/chat.html"
]) test("Unsupported domain: " + url, async () => {
  const get = await render(url);
  assert.equal(get("status").dataset.state, "unsupported");
});

for (const options of [{ noContext: true }, { denied: true }, { noTab: true }, {}]) {
  test("Unavailable tab: " + JSON.stringify(options), async () => {
    const get = await render(undefined, options);
    assert.equal(get("status").dataset.state, "unavailable");
    assert.equal(get("site").hidden, true);
    assert.equal(get("site").textContent, "");
  });
}

test("Manifest icon files are PNGs of the declared size", () => {
  for (const [size, file] of Object.entries(manifest.icons)) {
    const bytes = readFileSync(join(root, file));
    assert.equal(bytes.subarray(1, 4).toString(), "PNG");
    assert.equal(bytes.readUInt32BE(16), Number(size));
    assert.equal(bytes.readUInt32BE(20), Number(size));
    assert.equal(manifest.action.default_icon[size], file);
  }
});
