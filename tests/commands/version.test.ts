import { describe, expect, mock, test } from "bun:test";

mock.module("../../src/version.const.js", () => ({
	VERSION: "0.1.0",
}));

import { Command } from "commander";
import register from "../../src/commands/version.js";

describe("version command", () => {
	test("module exports register function", () => {
		expect(typeof register).toBe("function");
	});

	test("register function is callable", () => {
		const program = new Command();
		expect(() => register(program)).not.toThrow();
	});
});
