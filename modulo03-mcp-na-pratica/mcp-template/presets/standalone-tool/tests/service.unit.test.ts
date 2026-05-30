import { describe, it } from "node:test";
import assert from "node:assert";
import { slugify, wordCount } from "../src/service.ts";

describe("slugify", () => {
    it("lowercases and dashes", () => {
        assert.strictEqual(slugify("Hello World"), "hello-world");
    });
    it("strips accents and punctuation", () => {
        assert.strictEqual(slugify("Olá, Mundo!"), "ola-mundo");
    });
    it("trims leading/trailing dashes", () => {
        assert.strictEqual(slugify("  --weird-- "), "weird");
    });
});

describe("wordCount", () => {
    it("counts words", () => {
        assert.strictEqual(wordCount("one two three"), 3);
    });
    it("returns 0 for empty", () => {
        assert.strictEqual(wordCount("   "), 0);
    });
});
