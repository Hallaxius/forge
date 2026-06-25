import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import type { Command } from "commander";
import { info } from "../lib/logger.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const pkg = JSON.parse(
	readFileSync(join(__dirname, "../../package.json"), "utf-8"),
);

export default function register(program: Command): void {
	program
		.command("version")
		.description("Show version")
		.action(async () => {
			info(`Forge v${pkg.version}`);
		});
}
