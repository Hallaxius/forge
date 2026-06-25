import { describe, expect, test } from "bun:test";
import {
	createTable,
	showBox,
	showHeader,
	showSeparator,
} from "../../src/lib/ui.js";

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

	test("showBox exists", () => {
		expect(typeof showBox).toBe("function");
	});

	test("showHeader exists", () => {
		expect(typeof showHeader).toBe("function");
	});

	test("showSeparator exists", () => {
		expect(typeof showSeparator).toBe("function");
	});
});
