Eslint plugin to replace a relative imports, according to `paths` options in `tsconfig.json` or `jsconfig.json`.

# Setup

Install package with `npm install -D eslint-plugin-paths`, then update eslint config

```json
{
	"plugins": [
		"eslint-plugin-paths",
	],
	"rules": {
		"paths/alias": "error"
	}
}
```

# Examples

If you have `tsconfig.json` with config below

```json
{
	"compilerOptions": {
		"baseUrl": ".",
		"paths": {
			"@foo/*": ["src/foo/*"],
			"@bar/*": ["src/bar/*"]
		}
	}
}
```

then code below will be valid

```ts
// src/index.ts

import foo from '@foo';
import barZ from '@bar/x/y/z';
import bazZ from './baz/x/y/z';
```

and this code will be invalid

```ts
// src/index.ts

import foo from './foo';
import barZ from './bar/x/y/z';
```