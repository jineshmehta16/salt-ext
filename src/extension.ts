import * as vscode from 'vscode';
import { ComponentService, type ComponentInfo } from './services/componentService';

// Initialize ComponentService
const componentService = ComponentService.getInstance();

async function handleSaltExplain(component: string): Promise<string> {
    const normalizedComponent = component.trim();
    const componentName = normalizedComponent.charAt(0).toUpperCase() + normalizedComponent.slice(1);
    
    const info = await componentService.getComponentInfo(componentName);
    
    if (info) {
        let response = `## ${componentName}\n\n${info.description}\n`;
        
        if (info.props.length > 0) {
            response += '\n### Key Props\n';
            response += info.props.map(prop => `- \`${prop}\``).join('\n');
        }
        
        response += '\n\n### Usage Example:\n```tsx\n' + info.example + '\n```\n';
        
        if (info.documentation) {
            response += '\n### Additional Documentation\n' + info.documentation;
        }
        
        response += '\n\nFor more details, visit the [Salt Design System documentation](https://saltdesignsystem.com/components/${componentName.toLowerCase()}).';
        
        return response;
    }

    // Fallback message with available components
    const availableComponents = componentService.getAvailableComponents();
    return `I couldn't find specific information about "${component}".${
        availableComponents.length ? `\n\nAvailable components: ${availableComponents.join(', ')}.` : ''
    }

You can ask about:
- Specific components and their usage
- Theming with SaltProvider
- Icons from @salt-ds/icons
- Layout components and patterns
- Form components and validation`;
}

// This method is called when your extension is activated
export function activate(context: vscode.ExtensionContext) {
    console.log('🧂 Salt extension is now active!');
    vscode.window.showInformationMessage('Salt extension is now active!');

    // Create the chat participant
    const saltParticipant = vscode.chat.createChatParticipant('salt', async (request, context, stream, token) => {
        const prompt = request.prompt.toLowerCase();
        console.log('Processing prompt:', prompt);

        // Enhanced pattern matching
        const patterns = [
            /about\s+(\w+)/i,
            /(\w+)\s+component/i,
            /how\s+(?:to\s+)?use\s+(\w+)/i,
            /what\s+(?:is|are)\s+(?:the\s+)?(\w+)/i,
            /explain\s+(\w+)/i
        ];

        for (const pattern of patterns) {
            const match = prompt.match(pattern);
            if (match) {
                const component = match[1];
                const response = await handleSaltExplain(component);
                await stream.markdown(response);
                return;
            }
        }

        // Handle theme-related queries
        if (prompt.includes('theme') || prompt.includes('styling')) {
            await stream.markdown(`## Salt Design System Theming

The Salt Design System uses a theme provider to manage consistent styling across components.

\`\`\`tsx
import { SaltProvider } from "@salt-ds/core";

function App() {
  return (
    <SaltProvider mode="light"> // or "dark"
      <YourComponents />
    </SaltProvider>
  );
}
\`\`\`

You can:
- Switch between light and dark modes
- Customize theme tokens
- Use CSS custom properties
- Apply component-specific styles

Would you like to know more about a specific theming aspect?`);
            return;
        }

        // Default welcome message
        const availableComponents = componentService.getAvailableComponents();
        await stream.markdown(`Hello! I'm your Salt Design System assistant. I can help you with:

1. Component Information
   - Usage examples
   - Props and API
   - Best practices

2. Theming & Styling
   - Light/Dark modes
   - Custom themes
   - CSS utilities

3. Integration Help
   - Setup guides
   - Common patterns
   - Troubleshooting

Just ask me about a specific component or topic! ${
    availableComponents.length ? `\n\nAvailable components: ${availableComponents.join(', ')}` : ''
}`);
    });

    // Add our disposable to the extension context
    context.subscriptions.push(saltParticipant);
}

// This method is called when your extension is deactivated
export function deactivate() {}
