import { describe, expect, test } from "bun:test";

describe("Init command", () => {
	test("init module exports register function", async () => {
		const mod = await import("../../src/commands/init.js");
		expect(typeof mod.default).toBe("function");
	});
});
