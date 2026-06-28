import { createInterface, type Interface } from "node:readline";
import ora from "ora";

interface PromptQuestion {
	message: string;
	default?: string | boolean;
	type: "confirm" | "input" | "password" | "select" | "checkbox";
	choices?: Array<{ name: string; value: any; checked?: boolean }>;
}

interface PromptQueueItem {
	resolve: (value: any) => void;
	reject: (err: Error) => void;
	question: PromptQuestion;
}

let rl: Interface | null = null;
let promptQueue: PromptQueueItem[] = [];
let _isProcessing = false;

function getReadline(): Interface {
	if (!rl) {
		rl = createInterface({
			input: process.stdin,
			output: process.stdout,
			terminal: true,
		});

		rl.on("line", (input) => handleInput(input));
		rl.on("close", () => process.exit(0));

		if (typeof globalThis !== "undefined" && globalThis.pauseRepl) {
			globalThis.pauseRepl();
		}
	}
	return rl;
}

function handleInput(input: string): void {
	if (promptQueue.length === 0) {
		if (typeof globalThis !== "undefined" && globalThis.replInput) {
			globalThis.replInput(input);
		}
		return;
	}

	const current = promptQueue[0];
	let value: any = input.trim();

	try {
		switch (current.question.type) {
			case "confirm": {
				if (!value) {
					value = current.question.default === true ? "Y" : "n";
				}
				current.resolve(value.toLowerCase() === "y");
				break;
			}
			case "input": {
				if (!value && current.question.default !== undefined) {
					value = current.question.default as string;
				}
				current.resolve(value);
				break;
			}
			case "password": {
				current.resolve(value);
				break;
			}
			case "select": {
				if (!value && current.question.default !== undefined) {
					current.resolve(current.question.default);
				} else if (current.question.choices) {
					const selected = current.question.choices.find(
						(choice) =>
							choice.name.toLowerCase() === value.toLowerCase() ||
							String(choice.value).toLowerCase() === value.toLowerCase(),
					);
					if (selected) {
						current.resolve(selected.value);
					} else if (current.question.choices.length > 0) {
						current.resolve(current.question.choices[0].value);
					} else {
						current.resolve(undefined);
					}
				} else {
					current.resolve(value);
				}
				break;
			}
			case "checkbox": {
				if (!value && current.question.default !== undefined) {
					current.resolve(current.question.default as string[]);
				} else if (current.question.choices) {
					const selectedValues: string[] = [];
					const inputValues = value.split(/[,\s]+/).filter(Boolean);

					for (const inputValue of inputValues) {
						const choice = current.question.choices.find(
							(c) =>
								c.name.toLowerCase() === inputValue.toLowerCase() ||
								String(c.value).toLowerCase() === inputValue.toLowerCase(),
						);
						if (choice) {
							selectedValues.push(choice.value as string);
						}
					}

					if (selectedValues.length === 0 && current.question.default) {
						current.resolve(current.question.default as string[]);
					} else {
						current.resolve(selectedValues);
					}
				} else {
					current.resolve(value ? [value] : []);
				}
				break;
			}
			default: {
				current.resolve(value);
			}
		}
	} catch (err) {
		current.reject(err instanceof Error ? err : new Error(String(err)));
	}

	promptQueue.shift();
	processNextPrompt();
}

function processNextPrompt(): void {
	if (promptQueue.length === 0) {
		_isProcessing = false;
		if (typeof globalThis !== "undefined" && globalThis.resumeRepl) {
			globalThis.resumeRepl();
		}
		return;
	}

	_isProcessing = true;
	const next = promptQueue[0];

	if (typeof globalThis !== "undefined" && globalThis.pauseRepl) {
		globalThis.pauseRepl();
	}

	process.stdout.write(`${next.question.message} `);
}

export function cleanup(): void {
	if (rl) {
		rl.close();
		rl = null;
	}
	promptQueue = [];
	_isProcessing = false;
}

function stripAnsi(str: string): string {
	return str.replace(/\x1B(?:[@-Z\\-_]|\[[0-?]*[ -/]*[@-~])/g, "");
}

function padEnd(str: string, len: number): string {
	const visibleLen = stripAnsi(str).length;
	const diff = len - visibleLen;
	return diff > 0 ? str + " ".repeat(diff) : str;
}

export function createTable(headers: string[], rows: string[][]): string {
	const colWidths: number[] = headers.map((h, i) => {
		const maxRow = Math.max(...rows.map((r) => stripAnsi(r[i] || "").length));
		return Math.max(stripAnsi(h).length, maxRow);
	});

	const headerRow = headers.map((h, i) => padEnd(h, colWidths[i])).join("  ");
	const dataRows = rows.map((row) =>
		row.map((cell, i) => padEnd(cell, colWidths[i])).join("  "),
	);

	return [headerRow, ...dataRows].join("\n");
}

export async function withSpinner<T>(
	text: string,
	fn: () => Promise<T>,
): Promise<T> {
	const spinner = ora({
		text,
		color: "cyan",
	}).start();

	try {
		const result = await fn();
		spinner.succeed();
		return result;
	} catch (err) {
		spinner.fail();
		throw err;
	}
}

export async function confirm(
	msg: string,
	defaultValue: boolean = true,
): Promise<boolean> {
	return new Promise((resolve, reject) => {
		promptQueue.push({
			resolve,
			reject,
			question: {
				message: `${msg} (Y/n)`,
				type: "confirm",
				default: defaultValue,
			},
		});
		processNextPrompt();
		getReadline();
	});
}

export async function select<T>(
	message: string,
	choices: { name: string; value: T }[],
): Promise<T> {
	return new Promise((resolve, reject) => {
		promptQueue.push({
			resolve,
			reject,
			question: {
				message: `${message} `,
				type: "select",
				default: choices[0]?.value,
				choices: choices.map((c) => ({ ...c, checked: false })),
			},
		});
		processNextPrompt();
		getReadline();
	});
}

export async function input(
	message: string,
	defaultValue?: string,
): Promise<string> {
	return new Promise((resolve, reject) => {
		promptQueue.push({
			resolve,
			reject,
			question: {
				message: `${message}:`,
				type: "input",
				default: defaultValue,
			},
		});
		processNextPrompt();
		getReadline();
	});
}

export async function password(
	message: string,
	_mask: string = "*",
): Promise<string> {
	return new Promise((resolve, reject) => {
		promptQueue.push({
			resolve,
			reject,
			question: {
				message: `${message}:`,
				type: "password",
			},
		});
		processNextPrompt();
		getReadline();
	});
}

export async function checkbox(
	message: string,
	choices: { name: string; value: string; checked?: boolean }[],
): Promise<string[]> {
	return new Promise((resolve, reject) => {
		promptQueue.push({
			resolve,
			reject,
			question: {
				message: `${message} (comma-separated)`,
				type: "checkbox",
				default: choices.filter((c) => c.checked).map((c) => c.value),
				choices: choices.map((c) => ({ ...c, checked: c.checked || false })),
			},
		});
		processNextPrompt();
		getReadline();
	});
}

export function pauseRepl(): void {
	_isProcessing = true;
	if (rl) {
		rl.pause();
	}
}

export function resumeRepl(): void {
	_isProcessing = false;
	if (rl) {
		rl.resume();
	}
}

export function setReplInputHandler(handler: (input: string) => void): void {
	(globalThis as any).replInput = handler;
}
