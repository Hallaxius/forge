import type { Command } from "commander";
import { error, text } from "../../lib/logger.js";
import { ModeManager } from "../../lib/modeManager.js";

export default function register(program: Command): void {
	program
		.command("mode <target>")
		.description("Switch to target mode (npm, git, base)")
		.action((target) => {
			if (ModeManager.isValidMode(target)) {
				ModeManager.setMode(target as Mode);
				text(`Switched to ${target} mode. Type commands without prefix.`);
			} else {
				error(
					`Invalid mode: ${target}. Available modes: ${ModeManager.modes.join(", ")}`,
				);
			}
		});
}
