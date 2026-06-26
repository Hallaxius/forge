import { describe, expect, test } from "bun:test";
import { createTable } from "../../src/lib/ui.js";

describe("UI", () => {
	test("createTable returns string", () => {
		const result = createTable(
			["Name", "Value"],
			[
				["foo", "bar"],
				["baz", "qux"],
			],
		);
		expect(typeof result).toBe("string");
		expect(result.length).toBeGreaterThan(0);
	});

	test("createTable uses space-delimited format", () => {
		const result = createTable(
			["Name", "Value"],
			[
				["foo", "bar"],
				["baz", "qux"],
			],
		);
		const lines = result.split("\n");
		expect(lines[0]).toBe("Name  Value");
		expect(lines[1]).toContain("foo");
		expect(lines[2]).toContain("baz");
		expect(result).not.toContain("+");
		expect(result).not.toContain("|");
	});
});
