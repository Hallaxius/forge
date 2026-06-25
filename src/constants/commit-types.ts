export const CommitType = {
	FEAT: "feat",
	FIX: "fix",
	DOCS: "docs",
	STYLE: "style",
	REFACTOR: "refactor",
	TEST: "test",
	CHORE: "chore",
} as const;

export type CommitType = (typeof CommitType)[keyof typeof CommitType];

export const commitTypes: { value: CommitType; description: string }[] = [
	{ value: CommitType.FEAT, description: "A new feature" },
	{ value: CommitType.FIX, description: "A bug fix" },
	{ value: CommitType.DOCS, description: "Documentation only changes" },
	{
		value: CommitType.STYLE,
		description: "Code style changes (formatting, etc)",
	},
	{ value: CommitType.REFACTOR, description: "Code refactoring" },
	{ value: CommitType.TEST, description: "Adding or fixing tests" },
	{ value: CommitType.CHORE, description: "Build process or tool changes" },
];
