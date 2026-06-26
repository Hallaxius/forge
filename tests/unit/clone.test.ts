import { describe, expect, test } from "bun:test";
import { ConfigManager } from "../../src/lib/config.js";

describe("Clone", () => {
	test("config stores and retrieves clones", () => {
		const config = new ConfigManager({
			configName: "forge-test-clone",
			cwd: "/tmp/forge-test-clone",
		});
		config.clear();

		config.addClone("https://github.com/user/repo.git|/tmp/repo");
		const clones = config.getClones();
		expect(clones.length).toBe(1);
		expect(clones[0]).toContain("https://github.com/user/repo.git");
	});

	test("config limits clones to 10", () => {
		const config = new ConfigManager({
			configName: "forge-test-clone-limit",
			cwd: "/tmp/forge-test-clone-limit",
		});
		config.clear();

		for (let i = 0; i < 15; i++) {
			config.addClone(`repo${i}|/tmp/repo${i}`);
		}

		const clones = config.getClones();
		expect(clones.length).toBeLessThanOrEqual(10);
	});

	test("cli.ts imports exist", async () => {
		const cli = await Bun.file("src/cli.ts").text();
		expect(cli).toContain("registerClone");
		expect(cli).toContain("registerInit");
		expect(cli).toContain("registerRemote");
		expect(cli).toContain("registerMerge");
		expect(cli).toContain("registerPr");
		expect(cli).toContain("registerIssue");
		expect(cli).toContain("registerRelease");
		expect(cli).toContain("registerCi");
	});
});
