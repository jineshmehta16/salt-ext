// The module 'vscode' contains the VS Code extensibility API
import * as vscode from 'vscode';

// Dynamic Salt Component information with usage examples and prop types
const SALT_COMPONENTS_INFO = {
	Accordion: {
		description: 'A collapsible section component that can show/hide content. Perfect for organizing content in expandable sections.',
		props: ['source', 'expandable', 'initialExpandedIds'],
		example: `import { Accordion, AccordionSection } from "@salt-ds/core";
		
<Accordion source={items} expandable>
  {(item) => (
    <AccordionSection title={item.title}>
      {item.content}
    </AccordionSection>
  )}
</Accordion>`
	},
	Avatar: {
		description: 'A component for displaying user profile images or initials with various sizes and styles.',
		props: ['size', 'src', 'initials', 'presence'],
		example: `import { Avatar } from "@salt-ds/core";
		
<Avatar 
  size="medium"
  src="profile.jpg"
  initials="JD"
/>`
	},
	Button: {
		description: 'A versatile button component supporting multiple variants and states. Used for triggering actions.',
		props: ['variant', 'disabled', 'loading', 'size'],
		example: `import { Button } from "@salt-ds/core";
		
<Button 
  variant="primary"
  onClick={handleClick}
  disabled={false}
>
  Click me
</Button>`
	},
	Card: {
		description: 'A flexible container component for grouping related content with optional header and actions.',
		props: ['interactive', 'selected', 'accent'],
		example: `import { Card } from "@salt-ds/core";
		
<Card>
  <Card.Header>
    <Text styleAs="h3">Card Title</Text>
  </Card.Header>
  <Card.Content>
    Your content here
  </Card.Content>
</Card>`
	},
	FormField: {
		description: 'A wrapper component that provides consistent layout and styling for form inputs.',
		props: ['label', 'labelPlacement', 'necessity', 'validationStatus'],
		example: `import { FormField, Input } from "@salt-ds/core";
		
<FormField 
  label="Username"
  necessity="required"
>
  <Input value={value} onChange={handleChange} />
</FormField>`
	}
};

const handleSaltExplain = async (component: string): Promise<string> => {
	const normalizedComponent = component.trim().toLowerCase();
	const componentEntry = Object.entries(SALT_COMPONENTS_INFO).find(
		([key]) => key.toLowerCase() === normalizedComponent
	);

	if (componentEntry) {
		const [name, info] = componentEntry;
		return `## ${name}

${info.description}

### Key Props
${info.props.map(prop => `- \`${prop}\``).join('\n')}

### Usage Example:
\`\`\`tsx
${info.example}
\`\`\`

For more details, visit the [Salt Design System documentation](https://saltdesignsystem.com).`;
	}

	return `I couldn't find specific information about "${component}". Available components: ${Object.keys(SALT_COMPONENTS_INFO).join(', ')}.

You can also ask about:
- Theming with SaltProvider
- Icons from @salt-ds/icons
- Layout components like StackLayout
- Form components like Input and Checkbox`;
};

// This method is called when your extension is activated
export function activate(context: vscode.ExtensionContext) {
	console.log('🧂 Salt extension is now active!');
	vscode.window.showInformationMessage('Salt extension is now active!');

	// Create the chat participant
	const saltParticipant = vscode.chat.createChatParticipant('salt', async (request, context, stream, token) => {
		const prompt = request.prompt.toLowerCase();
		const componentMatch = prompt.match(/about\s+(\w+)/i) || prompt.match(/(\w+)\s+component/i);
		
		if (componentMatch) {
			const response = await handleSaltExplain(componentMatch[1]);
			await stream.markdown(response);
			return;
		}

		await stream.markdown(`Hello! I'm your Salt Design System assistant. You can:
- Ask about specific components using \`@salt about <component>\`
- Get general information about Salt Design System
- Learn about theming and styling

Available components: ${Object.keys(SALT_COMPONENTS_INFO).join(', ')}`);
	});

	// Register the hello world command
	const disposable = vscode.commands.registerCommand('salt.helloWorld', () => {
		vscode.window.showInformationMessage('Hello World from Salt!');
	});

	// Add our disposables to the extension context
	context.subscriptions.push(disposable, saltParticipant);
}

// This method is called when your extension is deactivated
export function deactivate() {}
