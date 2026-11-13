# Browser regression tests

For popup status and icon validation, run:

```sh
node --test tests/popup.test.cjs
```

These tests use the actual popup script with a simulated Chrome API. They cover
supported/unsupported domains, deceptive hostnames, missing tab access, and PNG
icon dimensions. They do not verify Chrome permission grants or content-script
execution. The popup reports domain support only.

Run with Node.js and an installed Chrome or Chromium:

```sh
node tests/run-browser.cjs
# Linux or a custom installation:
CHROME_BIN=/path/to/chrome node tests/run-browser.cjs
```

No npm packages or network access are required. The runner opens local fixtures
in a temporary headless Chrome profile and fails unless each reports PASS.
You can also open either HTML fixture directly in Chrome and read its output.

- mixed-text.html covers inline code, numeric table cells, column alignment,
  native table layout, syntax tokens, lists, editable text, streaming quantities,
  glyph order, and restoring host direction after replacing Persian text.
- regressions.html covers explicit bdi/bdo boundaries (initial and dynamic),
  scientific quantity isolation including exponent signs, bold formatting,
  punctuation and copyable text, identifiers, code/editor protection, and
  repeated inspection without nested isolates.

On main at 31aff13245b57cb61098680ac6b079225ca46840, the existing fixture passes
but regressions.html fails. Examples:

- A span with contenteditable="false" inside bdi/bdo is independently marked
  RTL despite the author's explicit bidi boundary.
- In a Persian table cell, 1e-3 nm is split into 1e- and an isolated 3 nm.
  API1e-3 nm also gets a spurious isolated suffix.

The fixes preserve explicit bidi subtrees and isolate complete scientific
quantities instead of suffixes. These fixtures exercise browser rendering and
DOM mutation behavior; live host applications and extension injection still
need manual smoke testing.
