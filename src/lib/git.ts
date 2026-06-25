import simpleGit from "simple-git";

const git = simpleGit();

interface StatusResult {
	current: string;
	tracking: string;
	ahead: number;
	behind: number;
	files: { path: string; working_dir: string; index: string }[];
	recentCommits: { hash: string; date: string; message: string }[];
}

interface LogEntry {
	hash: string;
	date: string;
	message: string;
	author: string;
}

interface BranchesResult {
	current: string;
	branches: string[];
	all: string[];
}

interface StashEntry {
	index: number;
	description: string;
}

export async function getStatus(): Promise<StatusResult> {
	const status = await git.status();
	const log = await git.log({ maxCount: 5 });

	return {
		current: status.current || "",
		tracking: status.tracking || "",
		ahead: status.ahead,
		behind: status.behind,
		files: status.files.map((f) => ({
			path: f.path,
			working_dir: f.working_dir,
			index: f.index,
		})),
		recentCommits: log.all.map((c) => ({
			hash: c.hash,
			date: c.date,
			message: c.message,
		})),
	};
}

export async function commit(message: string): Promise<string> {
	const result = await git.commit(message);
	return result.commit || "";
}

export async function push(force: boolean = false): Promise<string> {
	const args = force ? (["-f"] as any) : undefined;
	const result = await git.push("origin", undefined as any, args);
	return result;
}

export async function pullRebase(): Promise<string> {
	const result = await git.pull(["--rebase"]);
	return result;
}

export async function log(maxCount: number = 10): Promise<LogEntry[]> {
	const result = await git.log({ maxCount });
	return result.all.map((c) => ({
		hash: c.hash,
		date: c.date,
		message: c.message,
		author: c.author_name,
	}));
}

export async function diff(): Promise<string> {
	const result = await git.diff();
	return result;
}

export async function diffStaged(): Promise<string> {
	const result = await git.diff(["--cached"]);
	return result;
}

export async function getBranches(): Promise<BranchesResult> {
	const result = await git.branch();
	return {
		current: result.current,
		branches: result.branches
			? Object.keys(result.branches).filter((b) => b !== result.current)
			: [],
		all: result.all || [],
	};
}

export async function createBranch(name: string): Promise<void> {
	await git.branch([name]);
}

export async function deleteBranch(
	name: string,
	force: boolean = false,
): Promise<void> {
	const args = force ? ["-D", name] : ["-d", name];
	await git.branch(args);
}

export async function switchBranch(name: string): Promise<void> {
	await git.checkout(name);
}

export async function stash(): Promise<string> {
	const result = await git.stash();
	return result;
}

export async function stashPop(): Promise<string> {
	const result = await git.stash(["pop"]);
	return result;
}

export async function stashList(): Promise<StashEntry[]> {
	const result = await git.stashList();
	return result.all.map((s, i) => ({
		index: i + 1,
		description: s.message,
	}));
}

export async function tag(name: string, message?: string): Promise<string> {
	if (message) {
		await git.tag(["-a", name, "-m", message]);
	} else {
		await git.tag([name]);
	}
	return name;
}

export async function tagList(): Promise<string[]> {
	const result = await git.tag();
	return result.split("\n").filter(Boolean);
}

export async function fetch(): Promise<string> {
	const result = await git.fetch();
	return result;
}

export async function undo(): Promise<string> {
	const result = await git.reset(["--soft", "HEAD~1"]);
	return result;
}

export async function getCurrentBranch(): Promise<string> {
	const result = await git.branch();
	return result.current;
}

export async function clone(
	url: string,
	dir?: string,
	options?: {
		ssh?: boolean;
		depth?: number;
		branch?: string;
		recurseSubmodules?: boolean;
	},
): Promise<string> {
	const args: string[] = [];
	if (options?.depth) args.push("--depth", String(options.depth));
	if (options?.branch) args.push("--branch", options.branch);
	if (options?.recurseSubmodules) args.push("--recurse-submodules");
	const targetDir = dir || url.split("/").pop()?.replace(".git", "") || "repo";
	await git.clone(url, targetDir, args);
	return targetDir;
}

export async function init(
	dir?: string,
	options?: { initialBranch?: string },
): Promise<void> {
	const opts: string[] = [];
	if (options?.initialBranch)
		opts.push("--initial-branch", options.initialBranch);
	if (dir) opts.push(dir);
	await git.init(opts.length > 0 ? opts : (true as any));
}

interface RemoteEntry {
	name: string;
	url: string;
}

export async function remoteAdd(name: string, url: string): Promise<void> {
	await git.addRemote(name, url);
}

export async function remoteRemove(name: string): Promise<void> {
	await git.removeRemote(name);
}

export async function remoteSetUrl(
	name: string,
	newUrl: string,
): Promise<void> {
	await git.raw(["remote", "set-url", name, newUrl]);
}

export async function remoteRename(
	oldName: string,
	newName: string,
): Promise<void> {
	await git.raw(["remote", "rename", oldName, newName]);
}

export async function remoteGetUrl(name: string): Promise<string> {
	const result = await git.raw(["remote", "get-url", name]);
	return result.trim();
}

export async function remoteList(): Promise<RemoteEntry[]> {
	const result = await git.getRemotes(true);
	return result.map((r) => ({ name: r.name, url: r.refs.fetch }));
}

interface WorktreeEntry {
	path: string;
	branch: string;
	hash: string;
}

export async function worktreeAdd(
	path: string,
	branch?: string,
	options?: { new?: boolean; detach?: boolean },
): Promise<void> {
	const args = ["worktree", "add"];
	if (options?.detach) args.push("--detach");
	args.push(path);
	if (branch) {
		if (options?.new) args.push(branch);
		else args.push(branch);
	}
	await git.raw(args);
}

export async function worktreeList(): Promise<WorktreeEntry[]> {
	const result = await git.raw(["worktree", "list", "--porcelain"]);
	const entries: WorktreeEntry[] = [];
	const lines = result.split("\n");
	let current: Partial<WorktreeEntry> = {};
	for (const line of lines) {
		if (line.startsWith("worktree ")) {
			current.path = line.slice(9).trim();
		} else if (line.startsWith("HEAD ")) {
			current.hash = line.slice(5).trim();
		} else if (line.startsWith("branch ")) {
			current.branch = line.slice(7).trim().replace("refs/heads/", "");
		} else if (line === "") {
			if (current.path) entries.push(current as WorktreeEntry);
			current = {};
		}
	}
	if (current.path) entries.push(current as WorktreeEntry);
	return entries;
}

export async function worktreeRemove(
	path: string,
	force: boolean = false,
): Promise<void> {
	const args = ["worktree", "remove"];
	if (force) args.push("--force");
	args.push(path);
	await git.raw(args);
}

export async function worktreePrune(
	dryRun: boolean = false,
): Promise<string[]> {
	const args = ["worktree", "prune"];
	if (dryRun) args.push("--dry-run");
	const result = await git.raw(args);
	return result.split("\n").filter(Boolean);
}

export async function merge(
	branch: string,
	options?: { noFF?: boolean; squash?: boolean; noCommit?: boolean },
): Promise<string> {
	const args = ["merge"];
	if (options?.noFF) args.push("--no-ff");
	if (options?.squash) args.push("--squash");
	if (options?.noCommit) args.push("--no-commit");
	args.push(branch);
	const result = await git.raw(args);
	return result;
}

export async function cherryPick(
	commits: string[],
	options?: { noCommit?: boolean; mainline?: number },
): Promise<void> {
	const args = ["cherry-pick"];
	if (options?.noCommit) args.push("--no-commit");
	if (options?.mainline) args.push("-m", String(options.mainline));
	args.push(...commits);
	await git.raw(args);
}

export async function cherryPickContinue(): Promise<void> {
	await git.raw(["cherry-pick", "--continue"]);
}

export async function cherryPickAbort(): Promise<void> {
	await git.raw(["cherry-pick", "--abort"]);
}

export async function clean(options?: {
	dryRun?: boolean;
	force?: boolean;
	exclude?: string;
}): Promise<string[]> {
	const args = ["clean", "-d"];
	if (options?.dryRun) args.push("-n");
	if (options?.force) args.push("-f");
	else args.push("-f");
	if (options?.exclude) args.push("-x", options.exclude);
	const result = await git.raw(args);
	return result.split("\n").filter(Boolean);
}

export async function archive(
	format: string,
	options?: { prefix?: string; output?: string; treeIsh?: string },
): Promise<string> {
	const args = ["archive", `--format=${format}`];
	if (options?.prefix) args.push(`--prefix=${options.prefix}`);
	if (options?.output) args.push(`--output=${options.output}`);
	if (options?.treeIsh) args.push(options.treeIsh);
	else args.push("HEAD");
	const result = await git.raw(args);
	return result;
}

export async function bisectStart(
	bad?: string,
	good?: string[],
): Promise<void> {
	await git.raw(["bisect", "start"]);
	if (bad) await git.raw(["bisect", "bad", bad]);
	if (good && good.length > 0) {
		for (const g of good) await git.raw(["bisect", "good", g]);
	}
}

export async function bisectBad(commit?: string): Promise<void> {
	const args = ["bisect", "bad"];
	if (commit) args.push(commit);
	await git.raw(args);
}

export async function bisectGood(commits: string[]): Promise<void> {
	for (const c of commits) await git.raw(["bisect", "good", c]);
}

export async function bisectReset(): Promise<void> {
	await git.raw(["bisect", "reset"]);
}

export async function bisectLog(): Promise<string> {
	return await git.raw(["bisect", "log"]);
}

export async function bisectRun(cmd: string): Promise<void> {
	await git.raw(["bisect", "run", cmd]);
}
