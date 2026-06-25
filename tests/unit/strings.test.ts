import { describe, expect, test } from "bun:test";
import {
	capitalize,
	formatTimestamp,
	truncate,
} from "../../src/utils/strings.js";

describe("Strings", () => {
	describe("capitalize", () => {
		test("capitalizes first letter", () => {
			expect(capitalize("hello")).toBe("Hello");
			expect(capitalize("world")).toBe("World");
		});

		test("handles empty string", () => {
			expect(capitalize("")).toBe("");
		});
	});

	describe("truncate", () => {
		test("shortens long strings", () => {
			expect(truncate("hello world", 5)).toBe("he...");
		});

		test("keeps short strings", () => {
			expect(truncate("hello", 10)).toBe("hello");
		});
	});

	describe("formatTimestamp", () => {
		test("formats date correctly", () => {
			const date = new Date("2024-01-15T10:30:00");
			const result = formatTimestamp(date);
			expect(result).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/);
		});
	});
});
