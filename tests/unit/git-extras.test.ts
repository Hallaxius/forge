import { describe, expect, test } from "bun:test";

describe("Git Extras", () => {
	test("git module exports new functions", async () => {
		const git = await import("../../src/lib/git.js");

		expect(typeof git.clone).toBe("function");
		expect(typeof git.init).toBe("function");
		expect(typeof git.remoteAdd).toBe("function");
		expect(typeof git.remoteRemove).toBe("function");
		expect(typeof git.remoteList).toBe("function");
		expect(typeof git.merge).toBe("function");
	});
});
