const PASSTHROUGH_SHORT_OPTIONS = new Set(['-name', '-iname', '-type', '-mtime', '-mmin']);

export class CommandParser {

    // Parse a raw command line into structured parts
    static parse(input) {
        const trimmed = input.trim();
        if (!trimmed) return null;

        // Check for pipes
        const pipeSegments = CommandParser.splitPipes(trimmed);
        if (pipeSegments.length > 1) {
            return {
                type: 'pipe',
                commands: pipeSegments.map(seg => CommandParser.parseSingle(seg.trim())),
            };
        }

        // Check for redirections
        const { command: cmdPart, redirect } = CommandParser.extractRedirect(trimmed);
        const parsed = CommandParser.parseSingle(cmdPart);
        if (redirect) parsed.redirect = redirect;

        return parsed;
    }

    // Parse a single command (no pipes)
    static parseSingle(input) {
        const tokens = CommandParser.tokenize(input);
        if (tokens.length === 0) return { type: 'empty' };

        const command = tokens[0];
        const rest = tokens.slice(1);

        const args = [];
        const flags = {};

        for (const token of rest) {
            if (token.startsWith('--')) {
                const flag = token.slice(2);
                const eqIndex = flag.indexOf('=');
                if (eqIndex !== -1) {
                    flags[flag.substring(0, eqIndex)] = flag.substring(eqIndex + 1);
                } else {
                    flags[flag] = true;
                }
            } else if (PASSTHROUGH_SHORT_OPTIONS.has(token)) {
                // Keep options like "-name" as positional arguments for commands such as find.
                args.push(token);
            } else if (/^-\d+$/.test(token)) {
                // Keep negative numbers as values (used by find -mtime/-mmin).
                args.push(token);
            } else if (token.startsWith('-') && token.length > 1 && !token.startsWith('-/')) {
                // Short flags: -la becomes { l: true, a: true }
                for (const char of token.slice(1)) {
                    flags[char] = true;
                }
            } else {
                args.push(token);
            }
        }

        return { type: 'command', command, args, flags, raw: input };
    }

    // Tokenize with quote handling
    static tokenize(input) {
        const tokens = [];
        let current = '';
        let inSingleQuote = false;
        let inDoubleQuote = false;
        let escaped = false;

        for (let i = 0; i < input.length; i++) {
            const char = input[i];

            if (escaped) {
                current += char;
                escaped = false;
                continue;
            }

            if (char === '\\' && !inSingleQuote) {
                escaped = true;
                continue;
            }

            if (char === "'" && !inDoubleQuote) {
                inSingleQuote = !inSingleQuote;
                continue;
            }

            if (char === '"' && !inSingleQuote) {
                inDoubleQuote = !inDoubleQuote;
                continue;
            }

            if (char === ' ' && !inSingleQuote && !inDoubleQuote) {
                if (current) {
                    tokens.push(current);
                    current = '';
                }
                continue;
            }

            current += char;
        }

        if (current) tokens.push(current);
        return tokens;
    }

    // Split by pipe operator (not inside quotes)
    static splitPipes(input) {
        const segments = [];
        let current = '';
        let inSingleQuote = false;
        let inDoubleQuote = false;

        for (let i = 0; i < input.length; i++) {
            const char = input[i];

            if (char === "'" && !inDoubleQuote) inSingleQuote = !inSingleQuote;
            if (char === '"' && !inSingleQuote) inDoubleQuote = !inDoubleQuote;

            if (char === '|' && !inSingleQuote && !inDoubleQuote) {
                segments.push(current);
                current = '';
                continue;
            }

            current += char;
        }

        segments.push(current);
        return segments;
    }

    // Extract redirect operators > and >>
    static extractRedirect(input) {
        let inSingleQuote = false;
        let inDoubleQuote = false;

        for (let i = input.length - 1; i >= 0; i--) {
            const char = input[i];
            // Simplified: scan from the end for unquoted > or >>
            if (char === "'" && !inDoubleQuote) inSingleQuote = !inSingleQuote;
            if (char === '"' && !inSingleQuote) inDoubleQuote = !inDoubleQuote;
        }

        // Reset and scan forward
        inSingleQuote = false;
        inDoubleQuote = false;

        for (let i = 0; i < input.length; i++) {
            const char = input[i];

            if (char === "'" && !inDoubleQuote) { inSingleQuote = !inSingleQuote; continue; }
            if (char === '"' && !inSingleQuote) { inDoubleQuote = !inDoubleQuote; continue; }

            if (char === '>' && !inSingleQuote && !inDoubleQuote) {
                const append = input[i + 1] === '>';
                const fileStart = append ? i + 2 : i + 1;
                const file = input.slice(fileStart).trim();
                const command = input.slice(0, i).trim();

                return {
                    command,
                    redirect: { type: append ? 'append' : 'overwrite', file },
                };
            }
        }

        return { command: input, redirect: null };
    }
}
