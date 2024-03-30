import { RuleTester } from 'eslint';
import path from 'path';

import rule from './import-paths';

const tester = new RuleTester({
	parserOptions: {
		// eslint-disable-next-line spellcheck/spell-checker
		ecmaVersion: 6,
		sourceType: 'module',
	},
});

tester.run('import-paths', rule, {
	valid: [
		{
			options: [{}],
			filename: path.resolve('./src/foo.ts'),
			code: `import bar from 'bar';`,
		},
	],
	invalid: [
		{
			options: [{}],
			filename: path.resolve('./src/foo/index.ts'),
			code: `import bar from '../bar/index';`,
			errors: ['Update import to @bar/index'],
			output: `import bar from '@bar/index';`,
		},
	],
});
