import { Rule } from 'eslint';
import fs from 'fs';
import path from 'path';

import { CompilerOptions } from '../types';
import { getCompilerConfigFromFile } from '../utils/getCompilerConfigFromFile';

function findDirWithFile(filename: string) {
	let dir = path.resolve(filename);

	do {
		dir = path.dirname(dir);
	} while (!fs.existsSync(path.join(dir, filename)) && dir !== '/');

	if (!fs.existsSync(path.join(dir, filename))) {
		return null;
	}

	return dir;
}

function findAlias(
	compilerOptions: CompilerOptions,
	baseDir: string,
	importPath: string,
	filePath: string,
	ignoredPaths: string[] = [],
) {
	for (const [alias, aliasPaths] of Object.entries(compilerOptions.paths)) {
		// TODO: support full featured glob patterns instead of trivial cases like `@utils/*` and `src/utils/*`
		const matchedPath = aliasPaths.find((dirPath) => {
			// Remove last asterisk
			const dirPathBase = path
				.join(baseDir, dirPath)
				.split('/')
				.slice(0, -1)
				.join('/');

			if (filePath.startsWith(dirPathBase)) return false;
			if (ignoredPaths.some((ignoredPath) => ignoredPath.startsWith(dirPathBase)))
				return false;

			return importPath.startsWith(dirPathBase);
		});

		if (!matchedPath) continue;

		// Split import path
		// Remove basedir and slash in start
		const slicedImportPath = importPath
			.slice(baseDir.length + 1)
			.slice(path.dirname(path.normalize(matchedPath)).length + 1);
		// Remove asterisk from end of alias
		const replacedPathSegments = path
			.join(path.dirname(alias), slicedImportPath)
			.split('/');

		// Add index in path
		return (
			replacedPathSegments.length === 1
				? [...replacedPathSegments, 'index']
				: replacedPathSegments
		).join('/');
	}

	return null;
}

// TODO: implement option to force relative path instead of alias (for remove alias case)
// TODO: add tests
const rule = {
	meta: {
		fixable: 'code',
		schema: {
			type: 'array',
			minItems: 0,
			maxItems: 1,
			items: [
				{
					type: 'object',
					properties: {
						configFilePath: { type: 'string' },
						ignoredPaths: { type: 'array', items: { type: 'string' } },
					},
					additionalProperties: false,
				},
			],
		},
	},
	create(context) {
		const baseDir = findDirWithFile('package.json');
		if (!baseDir) throw new Error("Can't find base dir");

		const [{ ignoredPaths = [], configFilePath = null } = {}] = context.options as [
			{ ignoredPaths: string[]; configFilePath?: string },
		];

		const compilerOptions = getCompilerConfigFromFile(
			baseDir,
			configFilePath ?? undefined,
		);
		if (!compilerOptions) throw new Error('Compiler options did not found');

		const pathTrailers = ['.', '/', '~'];
		return {
			ImportDeclaration(node) {
				const importPath = node.source.value;
				if (typeof importPath !== 'string') return;

				const isPathInImport = pathTrailers.some((pathTrailer) =>
					importPath.startsWith(pathTrailer),
				);
				if (!isPathInImport) return;

				let filename = context.filename;
				if (typeof filename === 'undefined') {
					const fullFilePath = context.getFilename();
	                const cwd = context.getCwd();
	                filename = path.relative(cwd, fullFilePath);
				}

				const resolvedIgnoredPaths = ignoredPaths.map((ignoredPath) =>
					path.normalize(path.join(path.dirname(filename), ignoredPath)),
				);

				const absolutePath = path.normalize(
					path.resolve(
						importPath.startsWith('.')
							? path.join(path.dirname(filename), importPath)
							: importPath,
					),
				);

				const replacement = findAlias(
					compilerOptions,
					baseDir,
					absolutePath,
					filename,
					resolvedIgnoredPaths,
				);

				if (!replacement) return;

				context.report({
					node,
					message: `Update import to ${replacement}`,
					fix(fixer) {
						const acceptableQuoteSymbols = [`'`, `"`];
						const originalStringQuote = node.source.raw?.slice(0, 1);
						const quote =
							originalStringQuote &&
							acceptableQuoteSymbols.includes(originalStringQuote)
								? originalStringQuote
								: acceptableQuoteSymbols[0];

						return fixer.replaceText(
							node.source,
							quote + replacement + quote,
						);
					},
				});
			},
		};
	},
} satisfies Rule.RuleModule;

export default rule;
