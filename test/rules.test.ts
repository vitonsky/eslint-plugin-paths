import { RuleTester } from 'eslint';
import path from 'path';

import rule from '../src/rules/alias';

const tester = new RuleTester({
	parserOptions: {
		// eslint-disable-next-line spellcheck/spell-checker
		ecmaVersion: 6,
		sourceType: 'module',
	},
});

tester.run('alias #169 Deepink Regression Fix', rule, {
	valid: [
		{
			name: 'relative import from not an alias directory are allowed',
			filename: path.resolve('./src/index.ts'),
			code: `import baz from './baz/index';`,
		},
	],
	invalid: [
		{
			name: 'bare absolute-style import from alias root without leading slash (Issue #169)',
			filename: path.resolve('./src/index.ts'),
			code: `import z from "src/__tests__/utils/file";`,
			errors: ['Update import to @tests/utils/file'],
			output: `import z from '@tests/utils/file';`,
		},
		{
			name: 'deep nested relative traversal should resolve to alias',
			filename: path.resolve('./src/core/handler/index.ts'),
			code: `import { sharedDependency } from "../../../../shared/dependency";`,
			errors: ['Update import to @shared/dependency'],
			output: `import { sharedDependency } from '@shared/dependency';`,
		},
	],
});