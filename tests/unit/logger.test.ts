import { describe, expect, test } from "bun:test";
import { error, newline, text, warning } from "../../src/lib/logger.js";

describe("Logger", () => {
	test("all functions exist", () => {
		expect(typeof error).toBe("function");
		expect(typeof warning).toBe("function");
		expect(typeof text).toBe("function");
		expect(typeof newline).toBe("function");
	});
});
