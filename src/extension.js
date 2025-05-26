"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = __importStar(require("vscode"));
const saltContext_1 = require("./services/saltContext");
function getLastNMessages(history, count) {
    return [...history].slice(-count);
}
function summarizeOlderMessages(history, fromIndex) {
    if (fromIndex <= 0) {
        return '';
    }
    const olderMessages = history.slice(0, fromIndex);
    const topics = new Set();
    const components = new Set();
    const themes = new Set();
    olderMessages.forEach(turn => {
        if (turn instanceof vscode.ChatRequestTurn) {
            const text = turn.prompt.toLowerCase();
            // Look for component names
            saltContext_1.componentPrefixes.forEach(prefix => {
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
            if (text.includes('icon')) {
                topics.add('icons');
            }
            if (text.includes('accessibility') || text.includes('a11y')) {
                topics.add('accessibility');
            }
            if (text.includes('layout')) {
                topics.add('layout');
            }
            if (text.includes('form')) {
                topics.add('forms');
            }
        }
    });
    const summaryParts = [];
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
function truncateText(text, maxLength = 500) {
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
function processMarkdownString(text) {
    // Remove markdown code blocks to save tokens while preserving key information
    return truncateText(text.value.replace(/```[\s\S]*?```/g, '[code block]'));
}
function processMessage(input) {
    if (typeof input === 'string') {
        return truncateText(input.replace(/```[\s\S]*?```/g, '[code block]'));
    }
    return processMarkdownString(input);
}
function activate(context) {
    console.log('🧂 Salt extension is now active!');
    vscode.window.showInformationMessage('Salt Design System Assistant is ready!');
    const saltParticipant = vscode.chat.createChatParticipant('salt', async (request, context, stream) => {
        try {
            console.log('Received query:', request.prompt);
            await stream.progress('Analyzing your Salt Design System question...');
            const messages = [];
            // Only add SALT_CONTEXT if this is the first message
            if (context.history.length === 0) {
                console.log('First message in conversation, adding Salt context');
                messages.push(vscode.LanguageModelChatMessage.User(saltContext_1.SALT_CONTEXT.contextPrompt));
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
                }
                else if (turn instanceof vscode.ChatResponseTurn) {
                    // Add AI's previous responses with truncation
                    const responseText = turn.response
                        .filter(part => part instanceof vscode.ChatResponseMarkdownPart)
                        .map(part => processMessage(part.value))
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
        }
        catch (error) {
            console.error('Error handling query:', error);
            await stream.markdown('Sorry, I encountered an error. Please try again.');
        }
    });
    context.subscriptions.push(saltParticipant);
}
function deactivate() { }
//# sourceMappingURL=extension.js.map