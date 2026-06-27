import { describe, expect, test } from "bun:test";
import { Command } from "commander";
import register from "../../src/commands/git/help.js";

describe("help command", () => {
	test("module exports register function", () => {
		expect(typeof register).toBe("function");
	});

	test("register function is callable", () => {
		const program = new Command();
		expect(() => register(program)).not.toThrow();
	});
});
