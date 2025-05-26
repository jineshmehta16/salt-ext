# Salt Design System Assistant

A Visual Studio Code extension that provides an AI-powered assistant for working with the Salt Design System. This extension helps developers understand and implement Salt Design System components, themes, and best practices through an interactive chat interface.

## Features

- 🤖 AI-powered chat interface for Salt Design System assistance
- 💡 Get help with component usage and best practices
- 🎨 Theme and styling guidance
- 🔧 Integration support
- 📦 Component and icon discovery
- 📚 Quick access to documentation and examples

## Installation

1. Download the extension package (`.vsix` file)
2. Install it in VS Code using one of these methods:
   - Through VS Code UI: 
     - Press `Cmd+Shift+P` (Mac) or `Ctrl+Shift+P` (Windows/Linux)
     - Type "Install from VSIX" and select the command
     - Choose the downloaded `.vsix` file
   - Through terminal:
     ```bash
     code --install-extension path/to/salt-extension.vsix
     ```

## Usage

1. Open the Command Palette (`Cmd+Shift+P` on Mac, `Ctrl+Shift+P` on Windows/Linux)
2. Type "Chat: Focus on Chat View" and select it
3. Choose "Salt Design System" from the chat options
4. Start asking questions about:
   - Component usage and APIs
   - Theming and styling
   - Best practices
   - Integration guidance
   - Finding specific components or icons

## Examples

Here are some examples of questions you can ask the Salt Design System Assistant:

- "How do I use the Button component?"
- "What are the available theme tokens?"
- "Show me examples of the Card component"
- "How do I implement a responsive layout?"
- "What icons are available in Salt?"
- "How do I customize component styles?"

## Development

To run this extension in development mode:

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Compile the extension:
   ```bash
   npm run compile
   ```
4. Press F5 to start debugging, or run the "Run Extension" configuration from the Run and Debug view

The extension will open in a new VS Code window where you can test it.

## Building and Packaging

To build and package the extension for distribution:

1. Create a production build:
   ```bash
   npm run package
   ```
   This command:
   - Runs the production build using esbuild
   - Optimizes and minifies the code
   - Generates the distribution files in the `dist` folder

2. Create the VSIX package:
   ```bash
   npx vsce package
   ```
   This command:
   - Creates a `.vsix` package file
   - Includes all necessary files for distribution
   - Validates the extension manifest
   - Generates a package ready for installation or publishing

You can combine both steps using:
```bash
npm run package && npx vsce package
```

The resulting `.vsix` file can be:
- Installed locally through VS Code
- Published to the VS Code Marketplace
- Shared with other developers

## Requirements

- Visual Studio Code version 1.100.0 or higher
- A stable internet connection for AI assistance

## Release Notes

### 0.0.1 (Initial Release)

- AI-powered chat interface for Salt Design System assistance
- Component usage guidance
- Theme and styling support
- Integration help
- Documentation access

## Contributing

We welcome contributions to improve this extension! Please feel free to submit issues and pull requests.

## Resources

- [Salt Design System Documentation](https://www.saltdesignsystem.com/salt)
- [VS Code Extension API](https://code.visualstudio.com/api)
- [Extension Guidelines](https://code.visualstudio.com/api/references/extension-guidelines)

---

**Built with ❤️ for the Salt Design System community**
