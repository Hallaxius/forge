import type { Command } from "commander";
import * as git from "../lib/git.js";
import { error, info, success, warning } from "../lib/logger.js";
import { confirm } from "../lib/ui.js";

export default function register(program: Command): void {
	program
		.command("clean")
		.description("Clean untracked files")
		.argument("[paths...]", "Paths to clean")
		.option("--dry-run", "Show what would be removed")
		.option("--force", "Skip confirmation prompt")
		.option("--exclude <pattern>", "Exclude files matching pattern")
		.action(
			async (
				_paths: string[],
				options: { dryRun?: boolean; force?: boolean; exclude?: string },
			) => {
				try {
					const opts: { dryRun?: boolean; force?: boolean; exclude?: string } =
						{};
					if (options.dryRun) opts.dryRun = true;
					if (options.force) opts.force = true;
					if (options.exclude) opts.exclude = options.exclude;

					const wouldRemove = await git.clean(opts);

					if (options.dryRun) {
						if (wouldRemove.length === 0) {
							info("Nothing would be removed.");
							return;
						}
						info("Would remove:");
						for (const line of wouldRemove) {
							warning(line);
						}
						return;
					}

					if (wouldRemove.length === 0) {
						info("Nothing to clean.");
						return;
					}

					if (!options.force) {
						const ok = await confirm(
							`Remove ${wouldRemove.length} untracked file(s)?`,
						);
						if (!ok) {
							info("Clean cancelled.");
							return;
						}
					}

					const result = await git.clean({
						force: true,
						...(options.exclude ? { exclude: options.exclude } : {}),
					});

					if (result.length === 0) {
						info("Nothing cleaned.");
						return;
					}

					for (const line of result) {
						warning(line);
					}
					success(`Cleaned ${result.length} file(s).`);
				} catch (err) {
					error(
						`Clean failed: ${err instanceof Error ? err.message : String(err)}`,
					);
				}
			},
		);
}
