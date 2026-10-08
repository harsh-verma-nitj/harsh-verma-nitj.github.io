// Run the actual citation UI code with a small DOM and controlled HTTP responses.
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");

class Element {
  constructor() {
    this.textContent = "";
    this.attributes = {};
    this.children = [];
    this.dataset = {};
    this.style = { setProperty() {} };
  }
  setAttribute(key, value) {
    this.attributes[key] = value;
  }
  getAttribute(key) {
    return this.attributes[key];
  }
  set dateTime(value) {
    this.attributes.datetime = value;
  }
  append(...children) {
    this.children.push(...children);
  }
  replaceChildren(fragment) {
    this.children = fragment.children;
  }
  addEventListener(event, handler) {
    this[event] = handler;
  }
}

(async () => {
  const ids = Object.fromEntries(
    [
      "scholar-metrics",
      "scholar-refresh",
      "scholar-refresh-label",
      "scholar-refresh-status",
      "scholar-recent",
      "scholar-updated",
      "scholar-chart",
    ].map((id) => [id, new Element()]),
  );
  const cells = ["citations", "h_index", "i10_index"].flatMap((metric) =>
    ["all", "recent"].map((period) => {
      const cell = new Element();
      cell.dataset = { metric, period };
      return cell;
    }),
  );
  ids["scholar-metrics"].querySelectorAll = () => cells;
  ids["scholar-updated"].dateTime = "2026-10-01T00:00:00Z";
  const document = {
    getElementById: (id) => ids[id],
    querySelectorAll: () => ids["scholar-chart"].children,
    createElement: () => new Element(),
    createDocumentFragment: () => new Element(),
  };
  const saved = JSON.parse(
    fs.readFileSync("assets/scholar-metrics.json", "utf8"),
  );
  let endpoint = "https://api.example/api/scholar-metrics";
  let apiCalls = 0;
  let total = 2619;
  let fail = false;
  const fetch = async (url, options) => {
    assert.equal(options.cache, "no-store");
    if (String(url).includes("scholar-config.json"))
      return { ok: true, json: async () => ({ live_endpoint: endpoint }) };
    if (String(url).startsWith("https://api.example/")) {
      apiCalls++;
      assert.ok(new URL(url).searchParams.has("t"));
      const data = structuredClone(saved);
      data.metrics.citations.all = total;
      data.updated_at = `2026-10-08T12:00:0${apiCalls}+00:00`;
      return { ok: !fail, json: async () => data };
    }
    assert.equal(apiCalls, 0, "Manual clicks must not request the saved file");
    return { ok: true, json: async () => saved };
  };
  const source = fs.readFileSync("assets/script.js", "utf8");
  const block = source.slice(
    source.indexOf("  const metricsPanel ="),
    source.indexOf("  if (/\\/(?:index\\.html)?$/.test(location.pathname))"),
  );
  assert.ok(block.length > 1000, "Citation UI block must be present");
  vm.runInNewContext(block, {
    document,
    fetch,
    URL,
    AbortController,
    setTimeout,
    clearTimeout,
  });
  const button = ids["scholar-refresh"];
  const status = ids["scholar-refresh-status"];
  await new Promise((resolve) => setImmediate(resolve));
  assert.equal(cells[0].textContent, "2,618");
  await button.click();
  assert.equal(cells[0].textContent, "2,619");
  total = 2620;
  await button.click();
  assert.equal(cells[0].textContent, "2,620");
  assert.equal(apiCalls, 2);
  await button.click();
  assert.match(status.textContent, /Checked Google Scholar just now/);
  fail = true;
  const before = ids["scholar-updated"].getAttribute("datetime");
  await button.click();
  assert.equal(cells[0].textContent, "2,620");
  assert.equal(ids["scholar-updated"].getAttribute("datetime"), before);
  assert.match(status.textContent, /Could not check Google Scholar/);
  endpoint = "";
  await button.click();
  assert.equal(apiCalls, 4);
  assert.match(status.textContent, /not connected/);
  assert.equal(button.disabled, false);
  console.log(
    "Refresh UI checks passed: fresh request per click, unchanged totals, failure and missing endpoint.",
  );
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
