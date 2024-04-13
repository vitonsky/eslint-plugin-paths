import { parse as parseJsonWithComments } from 'comment-json';
import fs from 'fs';
import path from 'path';

import { CompilerOptions } from '../types';

export function getCompilerConfigFromFile(
	baseDir: string,
	configFilePath?: string,
): CompilerOptions | null {
	if (!configFilePath) {
		const isTsconfigExists = fs.existsSync(path.join(baseDir, 'tsconfig.json'));
		const isJsconfigExists = fs.existsSync(path.join(baseDir, 'jsconfig.json'));

		const configFileName = isTsconfigExists
			? 'tsconfig.json'
			: isJsconfigExists
				? 'jsconfig.json'
				: null;

		if (!configFileName) return null;

		configFilePath = path.resolve(path.join(baseDir, configFileName));
	} else {
		configFilePath = path.resolve(configFilePath);
	}

	const tsconfig = parseJsonWithComments(
		fs.readFileSync(configFilePath).toString('utf8'),
	);

	// TODO: validate options
	const { baseUrl, paths = {} } = (tsconfig as any)?.compilerOptions ?? {};

	return {
		baseUrl,
		paths,
	};
}
