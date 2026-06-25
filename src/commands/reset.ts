import type { Command } from "commander";
import { ConfigManager } from "../lib/config.js";
import { error, info, success, warning } from "../lib/logger.js";
import { confirm } from "../lib/ui.js";

export default function register(program: Command): void {
	program
		.command("reset")
		.description("Reset all configuration")
		.action(async () => {
			try {
				warning("This will delete all Forge configuration.");
				const proceed = await confirm(
					"Are you sure? This will delete all configuration",
				);
				if (!proceed) {
					info("Reset cancelled.");
					return;
				}

				const config = new ConfigManager();
				config.clear();
				success("Configuration reset successfully.");
			} catch (err) {
				error(
					`Reset failed: ${err instanceof Error ? err.message : String(err)}`,
				);
			}
		});
}
