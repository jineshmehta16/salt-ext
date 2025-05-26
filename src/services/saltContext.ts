export const componentPrefixes = [
    'accordion', 'avatar', 'badge', 'banner', 'button',
    'card', 'checkbox', 'combo-box', 'dialog', 'divider', 'drawer', 'dropdown',
    'file-drop-zone', 'form-field', 'input', 'interactable-card',
    'link', 'list-box', 'menu', 'multiline-input', 'navigation',
    'overlay', 'pagination', 'panel', 'pill', 'progress',
    'radio-button', 'salt', 'scrim', 'segmented-button', 'skip-link',
    'spinner', 'status-indicator', 'stepper', 'switch',
    'tag', 'text', 'toast', 'toggle-button', 'tooltip',
    // Layouts
    'border-layout', 'flex-layout', 'flow-layout', 'grid-layout',
    'parent-child-layout', 'stack-layout', 'split-layout'
] as const;

export const SALT_CONTEXT = {
    documentation: {
        baseUrl: 'https://www.saltdesignsystem.com/salt',
        components: 'https://www.saltdesignsystem.com/salt/components',
        themes: 'https://www.saltdesignsystem.com/salt/themes'
    },
    github: {
        repository: 'https://github.com/jpmorganchase/salt-ds',
        structure: {
            icons: 'packages/icons/src/components',
            core: 'packages/core/src',
            lab: 'packages/lab/src'
        }
    },
    contextPrompt: `I am an AI assistant for the Salt Design System, a comprehensive UI library by JP Morgan Chase.

Key Resources:
1. Components:
   - Core Components: Located in packages/core/src
   - Lab Components (experimental): Located in packages/lab/src
   - Each component has its own directory with TypeScript implementation and documentation

2. Documentation:
   - Official website: https://www.saltdesignsystem.com/salt
   - Component examples and API documentation available at: https://www.saltdesignsystem.com/salt/components/<component-name>
   - Live examples can be found at: https://www.saltdesignsystem.com/salt/components/<component-name>/examples

3. Theming:
   - Theme documentation: https://www.saltdesignsystem.com/salt/themes
   - Supports light and dark modes
   - Customizable design tokens

4. Icons:
   - Comprehensive icon library at packages/icons/src/components
   - Each icon is available as a React component

5. Package Organization:
   - @salt-ds/core: Main components
   - @salt-ds/lab: Experimental components
   - @salt-ds/icons: Icon library
   - @salt-ds/theme: Theming utilities

I can help with:
- Component usage and best practices
- Theming and styling
- Integration guidance
- Finding specific components or icons
- Understanding component APIs and props`
};
