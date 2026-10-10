// DOM interaction tests, not a substitute for browser layout/screenshot review.
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { Window } from "happy-dom";
const window = new Window({
  url: "http://veil.test",
  settings: {
    enableJavaScriptEvaluation: true,
    disableJavaScriptFileLoading: true,
    disableCSSFileLoading: true,
  },
});
const errors = [];
window.addEventListener("error", (e) => errors.push(e.message));
let requests = 0;
window.fetch = () => {
  requests++;
  throw new Error("Unexpected network request");
};
if (process.argv.includes("--standalone")) {
  const html = await readFile("dist/Veil-Preview.html", "utf8");
  const parsed = new window.DOMParser().parseFromString(html, "text/html");
  assert.equal(
    parsed.querySelectorAll(
      "script[src], link[href]:not([href^='data:']), img[src]:not([src^='data:'])",
    ).length,
    0,
    "standalone must not need neighboring files",
  );
  assert.ok(
    parsed
      .querySelector("style")
      .textContent.includes("data:image/png;base64,"),
  );
  assert.ok(
    parsed
      .querySelector("style")
      .textContent.includes("data:font/woff2;base64,"),
  );
  window.document.body.innerHTML = parsed.body.innerHTML;
  for (const script of parsed.querySelectorAll("script"))
    window.eval(script.textContent);
  console.log(
    "PASS: isolated single-file startup with embedded artwork and font",
  );
} else {
  window.document.body.innerHTML = '<div id="root"></div>';
  window.eval(await readFile("dist/app.js", "utf8"));
}
const settle = () => new Promise((resolve) => setTimeout(resolve, 20));
const doc = window.document;
const byText = (selector, text) =>
  [...doc.querySelectorAll(selector)].find(
    (e) => e.textContent.trim() === text,
  );
const click = async (element) => {
  assert.ok(element, "control exists");
  element.click();
  await settle();
};
const screen = async (name) => click(byText(".studio-bar nav button", name));
const labelled = (label) => doc.querySelector(`[aria-label="${label}"]`);
const input = async (element, value) => {
  Object.getOwnPropertyDescriptor(
    window.HTMLInputElement.prototype,
    "value",
  ).set.call(element, value);
  element.dispatchEvent(new window.Event("input", { bubbles: true }));
  await settle();
};
try {
  await settle();
  assert.equal(doc.querySelectorAll(".menu-button").length, 6);
  await click(labelled("New profile"));
  assert.ok(doc.querySelector("dialog[open]"));
  assert.match(
    doc.querySelector('.preset[aria-pressed="true"]').textContent,
    /Fresh/,
  );
  await click(
    [...doc.querySelectorAll(".preset")].find((e) =>
      e.textContent.includes("Quality"),
    ),
  );
  assert.match(
    doc.querySelector(".notice").textContent,
    /nothing will be downloaded/,
  );
  await click(
    [...doc.querySelectorAll(".preset")].find((e) =>
      e.textContent.includes("Fresh"),
    ),
  );
  await input(doc.querySelector("dialog input"), "My fresh profile");
  await click(byText("dialog button", "Create preview profile"));
  assert.equal(doc.querySelectorAll("dialog").length, 0);
  assert.match(labelled("Current profile").textContent, /My fresh profile/);
  console.log(
    "PASS: profile creation defaults Fresh; optional presets explain no installs",
  );

  await screen("Features");
  assert.equal(labelled("Shaders").getAttribute("aria-checked"), "false");
  await click(labelled("Shaders"));
  assert.equal(labelled("Shaders").getAttribute("aria-checked"), "true");
  await input(labelled("Search features"), "zoom");
  assert.equal(doc.querySelectorAll(".module-card").length, 1);
  assert.match(doc.querySelector(".module-card").textContent, /Zoom/);
  await input(labelled("Search features"), "nothing-matches");
  assert.ok(doc.querySelector(".empty-state"));
  await click(labelled("Clear search"));
  await click(labelled("Configure Shaders"));
  assert.ok(doc.querySelector("dialog[open]"));
  await click(labelled("Close dialog"));
  console.log("PASS: feature toggles, search, empty state and settings dialog");

  await screen("Inventory");
  await click(labelled("Slot 1: Diamond Sword"));
  await click(labelled("Slot 10: empty"));
  assert.ok(labelled("Slot 10: Diamond Sword"));
  assert.ok(labelled("Slot 1: empty"));
  await click(labelled("Oak Planks, 4"));
  assert.ok(labelled("Slot 1: Oak Planks, 4"));
  await click(byText(".inventory-panel footer button", "Reset"));
  assert.ok(labelled("Slot 1: Diamond Sword"));
  console.log("PASS: inventory moves, crafting sample and reset");

  await screen("Settings");
  await click(byText(".sidebar nav button", "Accessibility"));
  await click(labelled("Reduced motion"));
  assert.ok(doc.querySelector(".app.reduced-motion"));
  await click(byText(".sidebar nav button", "Graphics"));
  await click(labelled("Reduced blur"));
  assert.ok(doc.querySelector(".app.reduced-blur"));
  await click(byText(".sidebar nav button", "HUD"));
  await click(labelled("Coordinates"));
  await screen("HUD");
  assert.equal(labelled("Move Coordinates widget"), null);
  await click(byText(".hud-toolbar button", "Edit layout"));
  const handle = labelled("Move Keybinds widget");
  // Happy DOM has no layout engine. Supply a canvas box for boundary tests.
  Object.defineProperties(handle.parentElement, {
    offsetLeft: { value: 30 },
    offsetTop: { value: 207 },
    offsetWidth: { value: 202 },
    offsetHeight: { value: 140 },
  });
  Object.defineProperties(handle.parentElement.parentElement, {
    clientWidth: { value: 1000 },
    clientHeight: { value: 700 },
  });
  assert.equal(handle.disabled, false);
  handle.dispatchEvent(
    new window.KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }),
  );
  await settle();
  assert.match(handle.parentElement.style.transform, /translate\(8px,\s*0px\)/);
  for (let i = 0; i < 110; i++)
    handle.dispatchEvent(
      new window.KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }),
    );
  await settle();
  assert.match(
    handle.parentElement.style.transform,
    /translate\(768px,\s*0px\)/,
  );
  await click(byText(".hud-toolbar button", "Reset layout"));
  assert.match(
    labelled("Move Keybinds widget").parentElement.style.transform,
    /translate\(0px,\s*0px\)/,
  );
  console.log(
    "PASS: accessibility appearance toggles, HUD visibility and keyboard layout editing",
  );

  await screen("Settings");
  await click(byText(".sidebar nav button", "Privacy"));
  for (const label of [
    "Telemetry",
    "Analytics",
    "Crash uploads",
    "Activity presence",
  ])
    assert.equal(labelled(label).getAttribute("aria-checked"), "false");
  await screen("Launcher");
  await click(byText(".launcher-sidebar nav button", "Launch"));
  assert.equal(doc.querySelectorAll(".profile-entry").length, 2);
  await click(
    byText(".launcher-section .modal-actions button", "Play preview"),
  );
  assert.match(
    doc.querySelector("dialog").textContent,
    /separate Windows test bundle/,
  );
  await click(byText("dialog button", "Open main menu"));
  assert.equal(doc.querySelectorAll(".menu-button").length, 6);
  assert.equal(requests, 0);
  assert.deepEqual(errors, []);
  console.log(
    "PASS: privacy defaults, shared profiles, preview boundary and zero app fetches",
  );
  if (process.argv.includes("--standalone")) {
    window.dispatchEvent(
      new window.CustomEvent("veil-startup-error", {
        detail: "Startup diagnostic test",
      }),
    );
    assert.match(doc.querySelector("#root").textContent, /Veil couldn't open/);
    assert.match(
      doc.querySelector("#root pre").textContent,
      /Startup diagnostic test/,
    );
    console.log(
      "PASS: startup failures show an actionable message instead of a blank page",
    );
  }
} finally {
  await window.happyDOM.close();
}
