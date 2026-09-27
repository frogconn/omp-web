import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

const require = createRequire(import.meta.url);
const {
  isBunVersionSupported,
  isNodeVersionSupported,
  resolveBunPath,
} = require("../bin/runtime.js");

test("accepts the minimum supported Node.js version and newer versions", () => {
  for (const version of ["22.19.0", "v22.19.0", "22.19.1", "23.0.0"]) {
    assert.equal(isNodeVersionSupported(version), true, version);
  }
});

test("rejects older and invalid Node.js versions", () => {
  for (const version of ["20.19.5", "22.18.99", "invalid"]) {
    assert.equal(isNodeVersionSupported(version), false, version);
  }
});

test("accepts the minimum supported Bun version and newer versions", () => {
  for (const version of ["1.4.2", "v1.4.2", "1.4.3", "2.0.0"]) {
    assert.equal(isBunVersionSupported(version), true, version);
  }
});

test("rejects older and invalid Bun versions", () => {
  for (const version of ["1.4.1", "1.3.14", "1.2.99", "nope"]) {
    assert.equal(isBunVersionSupported(version), false, version);
  }
});

test("prefers OMP_WEB_BUN over PATH lookups", () => {
  const dir = mkdtempSync(join(tmpdir(), "omp-web-runtime-"));
  try {
    const override = join(dir, "custom-bun");
    writeFileSync(override, "");
    assert.equal(resolveBunPath({ OMP_WEB_BUN: override, PATH: "" }), override);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
