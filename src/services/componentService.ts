import * as vscode from 'vscode';

export interface ComponentInfo {
    description: string;
    props: string[];
    example: string;
    documentation?: string;
}

export interface ComponentCache {
    [key: string]: ComponentInfo;
}

export class ComponentService {
    private static instance: ComponentService;
    private octokit: any;
    private cache: ComponentCache = {};
    private examplesCache: Map<string, string> = new Map();

    private constructor() {
        // Octokit will be initialized dynamically when needed
    }

    public static getInstance(): ComponentService {
        if (!ComponentService.instance) {
            ComponentService.instance = new ComponentService();
        }
        return ComponentService.instance;
    }

    private async initOctokit(): Promise<void> {
        if (!this.octokit) {
            const { Octokit } = await import('@octokit/rest');
            this.octokit = new Octokit();
        }
    }

    private async getRepoContent(path: string): Promise<string | null> {
        try {
            const response = await this.octokit.rest.repos.getContent({
                owner: 'jpmorganchase',
                repo: 'salt-ds',
                path
            });

            if ('content' in response.data && typeof response.data.content === 'string') {
                return Buffer.from(response.data.content, 'base64').toString();
            }
        } catch (error) {
            console.error(`Error fetching ${path}:`, error);
        }
        return null;
    }

    private async fetchComponentFile(component: string): Promise<string | null> {
        try {
            await this.initOctokit();
            const componentLower = component.toLowerCase();

            // Try core package first
            const coreContent = await this.getRepoContent(
                `packages/core/src/${componentLower}/${component}.tsx`
            );
            if (coreContent) {
                return coreContent;
            }

            // Try lab package if not found in core
            const labContent = await this.getRepoContent(
                `packages/lab/src/${componentLower}/${component}.tsx`
            );
            if (labContent) {
                return labContent;
            }

            console.error(`Component ${component} not found in either core or lab packages`);
            return null;
        } catch (error) {
            console.error(`Error in fetchComponentFile for ${component}:`, error);
            return null;
        }
    }

    private async fetchDocumentation(component: string): Promise<string | null> {
        try {
            await this.initOctokit();
            const componentLower = component.toLowerCase();

            // Try README from core package
            const coreDoc = await this.getRepoContent(
                `packages/core/src/${componentLower}/README.md`
            );
            if (coreDoc) {return coreDoc;}

            // Try README from lab package
            const labDoc = await this.getRepoContent(
                `packages/lab/src/${componentLower}/README.md`
            );
            if (labDoc) {return labDoc;}

            // Try site documentation as fallback
            const siteDoc = await this.getRepoContent(
                `site/docs/components/${componentLower}/index.mdx`
            );
            if (siteDoc) {return siteDoc;}

            return null;
        } catch (error) {
            console.error(`Error in fetchDocumentation for ${component}:`, error);
            return null;
        }
    }

    private parseProps(content: string): string[] {
        const propsMatch = content.match(/interface\s+\w+Props\s*{([^}]+)}/);
        if (!propsMatch) {
            return [];
        }

        return propsMatch[1]
            .split(';')
            .map((prop: string) => prop.trim())
            .filter(Boolean)
            .map((prop: string) => {
                const [name] = prop.split(':');
                return name?.trim() || '';
            })
            .filter(Boolean);
    }

    private parseDescription(content: string): string {
        const descriptionMatch = content.match(/\/\*\*([\s\S]*?)\*\//);
        return descriptionMatch?.[1]?.trim().replace(/\s*\*\s*/g, ' ') || 'No description available';
    }

    private generateExample(component: string, props: string[]): string {
        const importStatement = `import { ${component} } from "@salt-ds/core";`;
        const propsString = props
            .slice(0, 3)
            .map((prop: string) => `${prop}={${typeof prop === 'string' ? `"value"` : 'value'}}`)
            .join('\n  ');

        return `${importStatement}

const Example = () => (
  <${component}
    ${propsString}
  >
    Content
  </${component}>
);`;
    }

    public async getComponentInfo(component: string): Promise<ComponentInfo | null> {
        // Check cache first
        if (this.cache[component]) {
            return this.cache[component];
        }

        const content = await this.fetchComponentFile(component);
        if (!content) {
            return null;
        }

        const documentation = await this.fetchDocumentation(component);
        const props = this.parseProps(content);
        const description = this.parseDescription(content);
        const example = this.generateExample(component, props);

        const info: ComponentInfo = {
            description,
            props,
            example,
            documentation: documentation || undefined
        };

        this.cache[component] = info;
        return info;
    }

    public getAvailableComponents(): string[] {
        return Object.keys(this.cache);
    }
}
