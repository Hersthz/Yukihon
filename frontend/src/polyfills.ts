// Some browser bundles still expect Node's global object.
if (typeof globalThis !== "undefined" && !("global" in globalThis)) {
  (globalThis as typeof globalThis & { global?: typeof globalThis }).global = globalThis;
}
