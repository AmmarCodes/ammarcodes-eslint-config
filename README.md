# ammarcodes-eslint-config

Opinionated ESLint configuration with support for TypeScript and React.

## Installation

### For JavaScript/TypeScript Projects (No React)

```bash
npm install -D ammarcodes-eslint-config eslint typescript-eslint @eslint/js globals
```

### For React Projects

```bash
npm install -D ammarcodes-eslint-config eslint typescript-eslint @eslint/js globals
npm install -D eslint-plugin-react eslint-plugin-react-hooks eslint-plugin-react-refresh
```

### Complete Dependencies List

If you want to install all possible dependencies at once:

```bash
npm install -D ammarcodes-eslint-config eslint typescript-eslint @eslint/js globals
npm install -D @typescript-eslint/eslint-plugin @typescript-eslint/parser eslint-config-prettier
npm install -D eslint-plugin-react eslint-plugin-react-hooks eslint-plugin-react-refresh
```

## Usage

Create an `eslint.config.js` file in your project root:

### Basic Usage

#### JavaScript/TypeScript (No React)

```javascript
// eslint.config.js
import ammarConfig from 'ammarcodes-eslint-config';

export default await ammarConfig();
```

#### With React

```javascript
// eslint.config.js
import ammarConfig from 'ammarcodes-eslint-config';

export default await ammarConfig({ react: true });
```

#### Plain JavaScript (No TypeScript)

```javascript
// eslint.config.js
import ammarConfig from 'ammarcodes-eslint-config';

export default await ammarConfig({ typescript: false });
```

#### React + JavaScript (No TypeScript)

```javascript
// eslint.config.js
import ammarConfig from 'ammarcodes-eslint-config';

export default await ammarConfig({ react: true, typescript: false });
```

### Using Within an Existing ESLint Config

The config returns an array of ESLint configuration objects (flat config format). You can combine it with other configs:

```javascript
// eslint.config.js
import ammar from 'ammarcodes-eslint-config';
import someOtherConfig from 'some-other-eslint-config';
import globals from 'globals';

const ammarConfigs = await ammar({ react: true });

export default [
  // Spread the ammar configs first
  ...ammarConfigs,
  
  // Add other configs
  ...someOtherConfig,
  
  // Add your custom configs
  {
    files: ['**/*.test.ts'],
    languageOptions: {
      globals: {
        ...globals.jest,
      },
    },
    rules: {
      'no-console': 'off',
    },
  },
];
```

### Extending with Custom Rules

Add custom rules or overrides by appending config objects:

```javascript
// eslint.config.js
import ammarConfig from 'ammarcodes-eslint-config';

export default [
  ...(await ammarConfig({ react: true })),
  
  // Your custom rules applied to all files
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'warn',
      'no-console': ['warn', { allow: ['error', 'warn'] }],
    },
  },
  
  // File-specific overrides
  {
    files: ['**/*.config.{js,ts}', '**/scripts/**/*.{js,ts}'],
    rules: {
      'no-console': 'off',
    },
  },
];
```

### Conditional Configuration

Dynamically include configs based on environment:

```javascript
// eslint.config.js
import ammarConfig from 'ammarcodes-eslint-config';

const isCI = process.env.CI === 'true';

export default [
  ...(await ammarConfig({ react: true })),
  
  // Stricter rules in CI
  ...(isCI ? [{
    rules: {
      '@typescript-eslint/no-unused-vars': 'error',
    },
  }] : []),
];
```

## Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `react` | boolean | `false` | Enable React/JSX support. Requires `eslint-plugin-react`, `eslint-plugin-react-hooks`, and `eslint-plugin-react-refresh` to be installed. |
| `typescript` | boolean | `true` | Enable TypeScript support. Requires `typescript-eslint` and related packages to be installed. |

## Peer Dependencies

### Required

These dependencies are always required:

- `eslint` >=8.57.0
- `typescript-eslint`
- `@eslint/js`
- `globals`

### Optional

Install these based on your project needs:

**For TypeScript support (default: enabled):**

- `@typescript-eslint/eslint-plugin`
- `@typescript-eslint/parser`

**For React support (default: disabled):**

- `eslint-plugin-react`
- `eslint-plugin-react-hooks`
- `eslint-plugin-react-refresh`

**For Prettier integration:**

- `eslint-config-prettier`

## Troubleshooting

### "React support requested but eslint-plugin-react not installed"

This error means you tried to use `ammar({ react: true })` but haven't installed the React peer dependencies. Run:

```bash
npm install -D eslint-plugin-react eslint-plugin-react-hooks eslint-plugin-react-refresh
```

### "Cannot find module 'ammarcodes-eslint-config'"

Make sure you've installed the package:

```bash
npm install -D ammarcodes-eslint-config
```

### TypeScript Errors When Combining Configs

When combining with other TypeScript configs, ensure they use the flat config format (ESLint v8+). Legacy `.eslintrc` format configs need to be wrapped or converted.
