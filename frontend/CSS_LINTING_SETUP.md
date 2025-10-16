# CSS Linting Setup

This project uses Stylelint with Tailwind CSS support to lint CSS files and resolve warnings about unknown at-rules.

## Configuration Files

### `.stylelintrc.json`
- Extends `stylelint-config-tailwindcss` for Tailwind CSS support
- Ignores unknown at-rules: `@tailwind`, `@apply`, `@layer`, etc.
- Configures font-family name quotes rule

### `.vscode/settings.json`
- Disables built-in CSS validation to prevent conflicts
- Enables Stylelint for CSS linting
- Configures Tailwind CSS IntelliSense
- Sets `css.lint.unknownAtRules` to "ignore"

## Usage

### Lint CSS files
```bash
npm run lint:css
```

### Lint specific file
```bash
npx stylelint "src/app/globals.css"
```

### Auto-fix issues
```bash
npx stylelint "src/app/globals.css" --fix
```

## What This Fixes

The setup resolves these common CSS linter warnings:

- ✅ `Unknown at rule @tailwind`
- ✅ `Unknown at rule @apply` 
- ✅ `Unknown at rule @layer`
- ✅ `Unknown at rule @variants`
- ✅ `Unknown at rule @responsive`
- ✅ `Unknown at rule @screen`

## IDE Integration

### VSCode
- Install the "Tailwind CSS IntelliSense" extension
- Install the "Stylelint" extension
- The `.vscode/settings.json` file configures everything automatically

### Other IDEs
- Configure your IDE to use Stylelint for CSS files
- Point to the `.stylelintrc.json` configuration file

## Troubleshooting

### Still seeing warnings?
1. Restart your IDE/editor
2. Make sure the Stylelint extension is installed and enabled
3. Check that `.stylelintrc.json` is in the project root
4. Verify that `stylelint-config-tailwindcss` is installed

### Stylelint not working?
1. Run `npm install` to ensure all dependencies are installed
2. Check that Stylelint is properly configured in your IDE
3. Try running `npx stylelint --version` to verify installation
