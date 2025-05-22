"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/extension.ts
var extension_exports = {};
__export(extension_exports, {
  activate: () => activate,
  deactivate: () => deactivate
});
module.exports = __toCommonJS(extension_exports);
var vscode = __toESM(require("vscode"));
var SALT_COMPONENTS_INFO = {
  Accordion: {
    description: "A collapsible section component that can show/hide content. Perfect for organizing content in expandable sections.",
    props: ["source", "expandable", "initialExpandedIds"],
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
    description: "A component for displaying user profile images or initials with various sizes and styles.",
    props: ["size", "src", "initials", "presence"],
    example: `import { Avatar } from "@salt-ds/core";
		
<Avatar 
  size="medium"
  src="profile.jpg"
  initials="JD"
/>`
  },
  Button: {
    description: "A versatile button component supporting multiple variants and states. Used for triggering actions.",
    props: ["variant", "disabled", "loading", "size"],
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
    description: "A flexible container component for grouping related content with optional header and actions.",
    props: ["interactive", "selected", "accent"],
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
    description: "A wrapper component that provides consistent layout and styling for form inputs.",
    props: ["label", "labelPlacement", "necessity", "validationStatus"],
    example: `import { FormField, Input } from "@salt-ds/core";
		
<FormField 
  label="Username"
  necessity="required"
>
  <Input value={value} onChange={handleChange} />
</FormField>`
  }
};
var handleSaltExplain = async (component) => {
  const normalizedComponent = component.trim().toLowerCase();
  const componentEntry = Object.entries(SALT_COMPONENTS_INFO).find(
    ([key]) => key.toLowerCase() === normalizedComponent
  );
  if (componentEntry) {
    const [name, info] = componentEntry;
    return `## ${name}

${info.description}

### Key Props
${info.props.map((prop) => `- \`${prop}\``).join("\n")}

### Usage Example:
\`\`\`tsx
${info.example}
\`\`\`

For more details, visit the [Salt Design System documentation](https://saltdesignsystem.com).`;
  }
  return `I couldn't find specific information about "${component}". Available components: ${Object.keys(SALT_COMPONENTS_INFO).join(", ")}.

You can also ask about:
- Theming with SaltProvider
- Icons from @salt-ds/icons
- Layout components like StackLayout
- Form components like Input and Checkbox`;
};
function activate(context) {
  console.log("\u{1F9C2} Salt extension is now active!");
  vscode.window.showInformationMessage("Salt extension is now active!");
  const saltParticipant = vscode.chat.createChatParticipant("salt", async (request, context2, stream, token) => {
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

Available components: ${Object.keys(SALT_COMPONENTS_INFO).join(", ")}`);
  });
  const disposable = vscode.commands.registerCommand("salt.helloWorld", () => {
    vscode.window.showInformationMessage("Hello World from Salt!");
  });
  context.subscriptions.push(disposable, saltParticipant);
}
function deactivate() {
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  activate,
  deactivate
});
//# sourceMappingURL=extension.js.map
