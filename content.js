(() => {
  "use strict";

  const block = "p, li, h1, h2, h3, h4, h5, h6, td, th, blockquote, label, div, [contenteditable]";
  const skip = "pre, code, script, style, textarea, input, svg, math, .katex, .MathJax, mjx-container, button, [role=button]";
  const boundary = block + ", table, ul, ol, section, article, nav, form, header, footer, aside, main";
  const rtl = "prsn-rtl-block";
  const arabicLetter = /(?=\p{L})\p{Script=Arabic}/u;
  // A quantity is one LTR run even when the digits precede the Latin unit.
  const quantity = /(?<![\p{L}\p{N}_])[−+-]?\p{Nd}+(?:[.,٫٬]\p{Nd}+)*[ \t\u00a0\u202f]+(?:nm|µm|μm|mm|cm|km|m|mg|kg|g|mL|µL|μL|L|mM|µM|μM|nM|Hz|kHz|MHz|GHz|ms|s|°C)(?![\p{L}\p{N}_])/gu;

  function inspect(el) {
    if (el.closest(skip)) return;
    const cell = el.closest("td, th");
    const textNodes = [];
    let hasArabic = false;
    let hasBlock = false;

    function visit(parent) {
      for (const child of parent.childNodes) {
        if (child.nodeType === Node.TEXT_NODE) {
          hasArabic ||= arabicLetter.test(child.data);
          if (cell) textNodes.push(child);
        } else if (child.nodeType === Node.ELEMENT_NODE) {
          if (child.matches(boundary)) hasBlock = true;
          else if (!child.matches(skip + ", bdi, bdo")) visit(child);
        }
      }
    }
    visit(el);
    // Avoid changing the direction of layout containers and their tables.
    const active = hasArabic && !(el.tagName === "DIV" && hasBlock);
    el.classList.toggle(rtl, active);
    if (cell === el) {
      const numeric = /^[−+-]?\p{Nd}+(?:[.,٫٬]\p{Nd}+)*[ \u00a0]?[٪%]?$/u;
      el.classList.toggle("prsn-number", numeric.test(el.textContent.trim()));
    }
    if (active && cell && !el.isContentEditable) {
      for (const node of textNodes) {
        if (!node.parentElement.isContentEditable) isolateQuantities(node);
      }
    }
  }

  function isolateQuantities(node) {
    const matches = Array.from(node.data.matchAll(quantity));
    // Work backwards so offsets still refer to the original text node.
    for (const match of matches.reverse()) {
      const range = document.createRange();
      range.setStart(node, match.index);
      range.setEnd(node, match.index + match[0].length);
      const run = document.createElement("bdi");
      run.dir = "ltr";
      range.surroundContents(run);
    }
  }

  const dirty = new Set();
  function collect(root) {
    if (root.matches(block)) dirty.add(root);
    for (const el of root.querySelectorAll(block)) dirty.add(el);
  }
  let scheduled = false;
  function flush() {
    scheduled = false;
    for (const el of dirty) {
      if (el.isConnected) inspect(el);
    }
    dirty.clear();
  }
  const observer = new MutationObserver(records => {
    for (const record of records) {
      const target = record.target.nodeType === Node.ELEMENT_NODE
        ? record.target : record.target.parentElement;
      if (!target || target.closest(skip)) continue;
      const owner = target.closest(block);
      if (owner) dirty.add(owner);
      const cell = target.closest("td, th");
      if (cell) dirty.add(cell);
      for (const node of record.addedNodes) {
        if (node.nodeType === Node.ELEMENT_NODE) collect(node);
      }
    }
    if (dirty.size && !scheduled) {
      scheduled = true;
      requestAnimationFrame(flush);
    }
  });

  function start() {
    collect(document.body);
    flush();
    observer.observe(document.documentElement, { childList: true, characterData: true, subtree: true });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start, { once: true });
  else start();
})();
