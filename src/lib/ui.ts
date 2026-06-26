import boxen from "boxen";
import chalk from "chalk";
import inquirer from "inquirer";
import ora from "ora";
import { colors } from "../constants/colors.js";
import { formatting } from "../constants/messages.js";

const { prompt } = inquirer;

function stripAnsi(str: string): string {
	return str.replace(/\x1B(?:[@-Z\\-_]|\[[0-?]*[ -/]*[@-~])/g, "");
}

function padEnd(str: string, len: number): string {
	const visibleLen = stripAnsi(str).length;
	const diff = len - visibleLen;
	return diff > 0 ? str + " ".repeat(diff) : str;
}

export function showBox(
	title: string,
	content: string,
	options?: Record<string, unknown>,
): void {
	const boxContent = `${chalk.bold(title)}\n\n${content}`;
	console.log(
		boxen(boxContent, {
			padding: 1,
			borderColor: "cyan",
			borderStyle: "round",
			...options,
		}),
	);
}

export function createTable(headers: string[], rows: string[][]): string {
	const _colCount = headers.length;
	const colWidths: number[] = headers.map((h, i) => {
		const maxRow = Math.max(...rows.map((r) => stripAnsi(r[i] || "").length));
		return Math.max(stripAnsi(h).length, maxRow);
	});

	const separator = `+${colWidths.map((w) => "-".repeat(w + 2)).join("+")}+`;
	const headerRow = `| ${headers.map((h, i) => padEnd(h, colWidths[i])).join(" | ")} |`;
	const dataRows = rows.map(
		(row) =>
			"| " +
			row.map((cell, i) => padEnd(cell, colWidths[i])).join(" | ") +
			" |",
	);

	return [separator, headerRow, separator, ...dataRows, separator].join("\n");
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

export function showHeader(text: string): void {
	console.log(chalk.hex(colors.highlight)(text));
	console.log(chalk.hex(colors.info)(formatting.header));
}

export function showSeparator(): void {
	console.log(chalk.dim(formatting.separator));
}

export async function confirm(
	msg: string,
	defaultValue: boolean = true,
): Promise<boolean> {
	const { value } = await prompt([
		{
			type: "confirm",
			name: "value",
			message: msg,
			default: defaultValue,
		},
	]);
	return value;
}

export async function select<T>(
	message: string,
	choices: { name: string; value: T }[],
): Promise<T> {
	const { value } = await prompt([
		{
			type: "list",
			name: "value",
			message,
			choices,
		},
	]);
	return value;
}

export async function input(
	message: string,
	defaultValue?: string,
): Promise<string> {
	const { value } = await prompt([
		{
			type: "input",
			name: "value",
			message,
			default: defaultValue,
		},
	]);
	return value;
}

export async function password(
	message: string,
	mask: string = "*",
): Promise<string> {
	const { value } = await prompt([
		{
			type: "password",
			name: "value",
			message,
			mask,
		},
	]);
	return value;
}

export async function checkbox(
	message: string,
	choices: { name: string; value: string; checked?: boolean }[],
): Promise<string[]> {
	const { value } = await prompt([
		{
			type: "checkbox",
			name: "value",
			message,
			choices,
		},
	]);
	return value;
}
