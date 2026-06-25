import type { Command } from "commander";
import * as git from "../lib/git.js";
import { error, info, success, text } from "../lib/logger.js";

export default function register(program: Command): void {
	const cmd = program
		.command("bisect")
		.description("Bisect to find the commit that introduced a bug");

	cmd
		.command("start")
		.description("Start a bisect session")
		.argument("[bad]", "Bad commit (default: HEAD)")
		.argument("[good...]", "Good commits")
		.action(async (bad: string | undefined, good: string[]) => {
			try {
				await git.bisectStart(bad, good);
				success("Bisect started.");
			} catch (err) {
				error(
					`Bisect start failed: ${err instanceof Error ? err.message : String(err)}`,
				);
			}
		});

	cmd
		.command("bad")
		.description("Mark a commit as bad")
		.argument("[commit]", "Commit hash (default: HEAD)")
		.action(async (commit: string | undefined) => {
			try {
				await git.bisectBad(commit);
				success(`Commit ${commit || "HEAD"} marked as bad.`);
			} catch (err) {
				error(
					`Bisect bad failed: ${err instanceof Error ? err.message : String(err)}`,
				);
			}
		});

	cmd
		.command("good")
		.description("Mark commits as good")
		.argument("[commits...]", "Commits to mark as good")
		.action(async (commits: string[]) => {
			try {
				if (commits.length === 0) {
					info("Provide at least one commit to mark as good.");
					return;
				}
				await git.bisectGood(commits);
				success(`Marked ${commits.join(", ")} as good.`);
			} catch (err) {
				error(
					`Bisect good failed: ${err instanceof Error ? err.message : String(err)}`,
				);
			}
		});

	cmd
		.command("reset")
		.description("Reset bisect state")
		.action(async () => {
			try {
				await git.bisectReset();
				success("Bisect reset.");
			} catch (err) {
				error(
					`Bisect reset failed: ${err instanceof Error ? err.message : String(err)}`,
				);
			}
		});

	cmd
		.command("log")
		.description("Show bisect log")
		.action(async () => {
			try {
				const log = await git.bisectLog();
				text(log);
			} catch (err) {
				error(
					`Bisect log failed: ${err instanceof Error ? err.message : String(err)}`,
				);
			}
		});

	cmd
		.command("run")
		.description("Run a script for bisect")
		.argument("<cmd>", "Command to run")
		.action(async (cmd: string) => {
			try {
				await git.bisectRun(cmd);
				success("Bisect run completed.");
			} catch (err) {
				error(
					`Bisect run failed: ${err instanceof Error ? err.message : String(err)}`,
				);
			}
		});
}
