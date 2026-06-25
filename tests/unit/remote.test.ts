import { describe, expect, test } from "bun:test";

describe("Remote command", () => {
	test("remote module exports register function", async () => {
		const mod = await import("../../src/commands/remote.js");
		expect(typeof mod.default).toBe("function");
	});
});
