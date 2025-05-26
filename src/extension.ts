import * as vscode from 'vscode';
import { SALT_CONTEXT, componentPrefixes } from './services/saltContext';

function getLastNMessages(history: readonly (vscode.ChatRequestTurn | vscode.ChatResponseTurn)[], count: number) {
    return [...history].slice(-count);
}

function summarizeOlderMessages(history: readonly (vscode.ChatRequestTurn | vscode.ChatResponseTurn)[], fromIndex: number): string {
    if (fromIndex <= 0) {return '';}
    
    const olderMessages = history.slice(0, fromIndex);
    const topics = new Set<string>();
    const components = new Set<string>();
    const themes = new Set<string>();
    
    olderMessages.forEach(turn => {
        if (turn instanceof vscode.ChatRequestTurn) {
            const text = turn.prompt.toLowerCase();
            
            // Look for component names
            componentPrefixes.forEach(prefix => {
                const regex = new RegExp(`\\b${prefix}[a-z]*\\b`, 'gi');
                const matches = text.match(regex);
                if (matches) {
                    matches.forEach(match => components.add(match.toLowerCase()));
                }
            });

            // Look for theme-related concepts
            if (text.includes('theme') || text.includes('style') || text.includes('token') || text.includes('color') || text.includes('spacing')) {
                const themeWords = text.match(/\b(theme|style|token|color|spacing)[a-z]*\b/gi);
                if (themeWords) {
                    themeWords.forEach(word => themes.add(word.toLowerCase()));
                }
            }

            // Extract other key topics
            if (text.includes('icon')) { topics.add('icons'); }
            if (text.includes('accessibility') || text.includes('a11y')) { topics.add('accessibility'); }
            if (text.includes('layout')) { topics.add('layout'); }
            if (text.includes('form')) { topics.add('forms'); }
        }
    });

    const summaryParts: string[] = [];
    
    if (components.size > 0) {
        summaryParts.push(`components (${Array.from(components).join(', ')})`);
    }
    if (themes.size > 0) {
        summaryParts.push(`theming concepts (${Array.from(themes).join(', ')})`);
    }
    if (topics.size > 0) {
        summaryParts.push(`topics (${Array.from(topics).join(', ')})`);
    }

    return summaryParts.length > 0 
        ? `Earlier in the conversation, we discussed: ${summaryParts.join('; ')}.`
        : '';
}

function truncateText(text: string, maxLength: number = 500): string {
    if (text.length <= maxLength) {
        return text;
    }
    
    // Try to break at a sentence
    const breakPoint = text.lastIndexOf('.', maxLength - 20);
    if (breakPoint > maxLength / 2) {
        return text.substring(0, breakPoint + 1);
    }
    
    // If no good sentence break, just truncate at word boundary
    const words = text.substring(0, maxLength - 20).split(' ');
    words.pop(); // Remove potentially partial word
    return `${words.join(' ')}...`;
}

function processMarkdownString(text: vscode.MarkdownString): string {
    // Remove markdown code blocks to save tokens while preserving key information
    return truncateText(text.value.replace(/```[\s\S]*?```/g, '[code block]'));
}

function processMessage(input: string | vscode.MarkdownString): string {
    if (typeof input === 'string') {
        return truncateText(input.replace(/```[\s\S]*?```/g, '[code block]'));
    }
    return processMarkdownString(input);
}

export function activate(context: vscode.ExtensionContext) {
    try {
        console.log('🧂 Salt extension is now active!');
        
        // Check if chat API is available
        if (!vscode.chat) {
            throw new Error('VS Code Chat API is not available. Please update to VS Code version 1.99.0 or higher.');
        }
        
        vscode.window.showInformationMessage('Salt Design System Assistant is ready!');
        
        const saltParticipant = vscode.chat.createChatParticipant('salt', async (request, context, stream) => {
            try {
                console.log('Received query:', request.prompt);
                await stream.progress('Analyzing your Salt Design System question...');

                const messages = [];
                
                // Only add SALT_CONTEXT if this is the first message
                if (context.history.length === 0) {
                    console.log('First message in conversation, adding Salt context');
                    messages.push(vscode.LanguageModelChatMessage.User(SALT_CONTEXT.contextPrompt));
                }

                // Get last 5 messages and summarize older ones if they exist
                const recentHistory = getLastNMessages(context.history, 5);
                const olderMessagesSummary = summarizeOlderMessages(context.history, context.history.length - 5);
                
                // Add summary of older messages if available
                if (olderMessagesSummary) {
                    messages.push(vscode.LanguageModelChatMessage.User(`[Previous context] ${olderMessagesSummary}`));
                }
                
                // Add recent history with token optimization
                for (const turn of recentHistory) {
                    if (turn instanceof vscode.ChatRequestTurn) {
                        // Add user's previous questions with truncation
                        messages.push(vscode.LanguageModelChatMessage.User(processMessage(turn.prompt)));
                    } else if (turn instanceof vscode.ChatResponseTurn) {
                        // Add AI's previous responses with truncation
                        const responseText = turn.response
                            .filter(part => part instanceof vscode.ChatResponseMarkdownPart)
                            .map(part => processMessage((part as vscode.ChatResponseMarkdownPart).value))
                            .join(' '); // Add space between parts
                        if (responseText) {
                            messages.push(vscode.LanguageModelChatMessage.Assistant(responseText));
                        }
                    }
                }

                // Add current question (no truncation for current question)
                messages.push(vscode.LanguageModelChatMessage.User(request.prompt));

                // Get response from the AI model
                const response = await request.model.sendRequest(messages);

                // Stream the response to the user
                for await (const part of response.text) {
                    await stream.markdown(part);
                }
                
            } catch (error) {
                console.error('Error handling query:', error);
                await stream.markdown('Sorry, I encountered an error. Please try again.');
            }
        });

        context.subscriptions.push(saltParticipant);
    } catch (error) {
        console.error('Error activating extension:', error);
        vscode.window.showErrorMessage(`Salt extension activation failed: ${error.message}`);
    }
}

export function deactivate() {}
