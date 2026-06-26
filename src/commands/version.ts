import type { Command } from "commander";
import { text } from "../lib/logger.js";
import { VERSION } from "../version.const.js";

export default function register(program: Command): void {
	program
		.command("version")
		.description("Show version")
		.action(async () => {
			text(`Forge v${VERSION}`);
		});
}
