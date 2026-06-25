import chalk from "chalk";
import { colors } from "../constants/colors.js";
import { icons } from "../constants/messages.js";

export function success(msg: string): void {
	console.log(chalk.hex(colors.success)(`${icons.success} ${msg}`));
}

export function error(msg: string): void {
	console.error(chalk.hex(colors.error)(`${icons.error} ${msg}`));
}

export function warning(msg: string): void {
	console.warn(chalk.hex(colors.warning)(`${icons.warning} ${msg}`));
}

export function info(msg: string): void {
	console.log(chalk.hex(colors.info)(`${icons.info} ${msg}`));
}

export function highlight(msg: string): void {
	console.log(chalk.hex(colors.highlight)(`${icons.highlight} ${msg}`));
}

export function text(msg: string): void {
	console.log(msg);
}

export function newline(): void {
	console.log();
}
