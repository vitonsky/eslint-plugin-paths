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
			code: `
			import globalFoo from '@foo';
			import globalBar from '@bar';
			import bar1 from '@bar/1';
			import bar2 from '@bar/1/2';
			import bar3 from '@bar/1/2/3';

			import globalBaz from './baz';
			import baz1 from './baz/main';
			import baz2 from '../baz/main';
			import baz3 from '../../baz/main';
			`.replace(/\t/g, ''),
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
		{
			options: [{}],
			filename: path.resolve('./src/foo/index.ts'),
			code: `
			// import globalFoo from '../foo/index';
			import globalBar from '../bar/index';
			import bar1 from '../bar/1';
			// import bar2 from 'bar/1/2';
			// import bar3 from 'bar/1/2/3';

			// import globalBaz from './baz';
			// import baz1 from './baz/main';
			// import baz2 from '../baz/main';
			// import baz3 from '../../baz/main';
			`.replace(/\t/g, ''),
			errors: ['Update import to @bar/index', 'Update import to @bar/1'],
			output: `
			// import globalFoo from '../foo/index';
			import globalBar from '@bar/index';
			import bar1 from '@bar/1';
			// import bar2 from 'bar/1/2';
			// import bar3 from 'bar/1/2/3';

			// import globalBaz from './baz';
			// import baz1 from './baz/main';
			// import baz2 from '../baz/main';
			// import baz3 from '../../baz/main';
			`.replace(/\t/g, ''),
		},
	],
});
