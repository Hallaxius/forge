export const icons = {
	success: "\u2713",
	error: "\u2717",
	warning: "\u26A0",
	info: "\u25CB",
	highlight: "\u00BB",
};

export const formatting = {
	header: "\u2550".repeat(30),
	separator: "\u2500".repeat(25),
	indent: "  ",
};

export const commitTypes = [
	{ value: "feat", description: "A new feature" },
	{ value: "fix", description: "A bug fix" },
	{ value: "docs", description: "Documentation only changes" },
	{ value: "style", description: "Code style changes (formatting, etc)" },
	{ value: "refactor", description: "Code refactoring" },
	{ value: "test", description: "Adding or fixing tests" },
	{ value: "chore", description: "Build process or tool changes" },
] as const;
