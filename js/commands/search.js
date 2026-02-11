import { registry } from './registry.js';

function escapeHtml(text) {
    return String(text).replace(/[&<>"']/g, (char) => {
        switch (char) {
            case '&': return '&amp;';
            case '<': return '&lt;';
            case '>': return '&gt;';
            case '"': return '&quot;';
            case '\'': return '&#39;';
            default: return char;
        }
    });
}

export function registerSearchCommands(fs) {
    // grep
    registry.register('grep', (args, flags, stdin) => {
        if (args.length === 0) return { output: 'grep: missing pattern', isError: true };

        const pattern = args[0];
        const ignoreCase = flags.i || false;
        const recursive = flags.r || flags.R || false;
        const showLineNum = flags.n || false;

        // If stdin is provided (from pipe), search in stdin
        if (stdin) {
            const regex = new RegExp(pattern, ignoreCase ? 'gi' : 'g');
            const lines = stdin.split('\n');
            const matches = [];
            lines.forEach((line, i) => {
                if (regex.test(line)) {
                    matches.push(showLineNum ? `${i + 1}:${line}` : line);
                }
                regex.lastIndex = 0;
            });
            if (matches.length === 0) return { output: '' };
            return { output: matches.join('\n') };
        }

        if (args.length < 2) return { output: 'grep: missing file operand', isError: true };

        const path = args[1];
        const result = fs.grep(pattern, path, { ignoreCase, recursive });
        if (result.error) return { output: result.error, isError: true };

        if (result.results.length === 0) return { output: '' };

        const multipleFiles = recursive || args.length > 2;
        const lines = result.results.map(r => {
            let line = '';
            if (multipleFiles) line += `<span class="output-info">${escapeHtml(r.file)}</span>:`;
            if (showLineNum) line += `${r.line}:`;
            line += escapeHtml(r.text);
            return line;
        });

        return { output: lines.join('\n'), isHtml: true };
    }, 'Search for patterns in files');

    // find
    registry.register('find', (args, flags) => {
        const name = flags.name || null;
        const iname = flags.iname || null;
        const type = flags.type || null;
        const mtime = flags.mtime || null;
        const mmin = flags.mmin || null;
        const positionalArgs = [];

        // Also support: find . -name "*.txt"
        let nameArg = name;
        let inameArg = iname;
        let typeArg = type;
        let mtimeArg = mtime;
        let mminArg = mmin;
        for (let i = 0; i < args.length; i++) {
            if (args[i] === '-name' && args[i + 1]) {
                nameArg = args[i + 1];
                i++;
            } else if (args[i] === '-iname' && args[i + 1]) {
                inameArg = args[i + 1];
                i++;
            } else if (args[i] === '-type' && args[i + 1]) {
                typeArg = args[i + 1];
                i++;
            } else if (args[i] === '-mtime' && args[i + 1]) {
                mtimeArg = args[i + 1];
                i++;
            } else if (args[i] === '-mmin' && args[i + 1]) {
                mminArg = args[i + 1];
                i++;
            } else {
                positionalArgs.push(args[i]);
            }
        }

        const startPath = positionalArgs[0] || '.';
        const results = fs.find(startPath, {
            name: nameArg,
            iname: inameArg,
            type: typeArg,
            mtime: mtimeArg,
            mmin: mminArg,
        });
        if (results.length === 0) return { output: '' };
        return { output: results.join('\n') };
    }, 'Search for files in a directory hierarchy');
}
