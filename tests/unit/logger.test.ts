import { describe, expect, test } from "bun:test";
import {
	error,
	highlight,
	info,
	newline,
	success,
	text,
	warning,
} from "../../src/lib/logger.js";

describe("Logger", () => {
	test("all functions exist", () => {
		expect(typeof success).toBe("function");
		expect(typeof error).toBe("function");
		expect(typeof warning).toBe("function");
		expect(typeof info).toBe("function");
		expect(typeof highlight).toBe("function");
		expect(typeof text).toBe("function");
		expect(typeof newline).toBe("function");
	});
});
