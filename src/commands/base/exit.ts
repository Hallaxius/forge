import type { Command } from "commander";
import { text } from "../../lib/logger.js";
import { ModeManager } from "../../lib/modeManager.js";

export default function register(program: Command): void {
	program
		.command("exit")
		.description("Exit current mode or terminate if in base")
		.action(() => {
			const currentMode = ModeManager.getCurrentMode();
			if (currentMode === "base") {
				text("Exiting Forge CLI.");
				process.exit(0);
			} else {
				ModeManager.setMode("base");
				text(
					`Returned to base mode. Type 'fg ${currentMode}' to re-enter ${currentMode} mode.`,
				);
			}
		});
}
