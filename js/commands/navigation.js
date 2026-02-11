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

export function registerNavigationCommands(fs) {
    // pwd
    registry.register('pwd', (args, flags) => {
        return { output: fs.cwd };
    }, 'Print working directory');

    // cd
    registry.register('cd', (args, flags) => {
        const target = args[0] || '~';
        const result = fs.cd(target);
        if (result.error) return { output: result.error, isError: true };
        return { output: '' };
    }, 'Change directory');

    // ls
    registry.register('ls', (args, flags) => {
        const path = args[0] || '.';
        const showHidden = flags.a || flags.A || false;
        const longFormat = flags.l || false;

        const result = fs.listDir(path, showHidden);
        if (result.error) return { output: result.error, isError: true };

        if (result.entries.length === 0) return { output: '' };

        if (longFormat) {
            const lines = result.entries.map(entry => {
                const typeChar = entry.type === 'dir' ? 'd' : '-';
                const perm = entry.permissions || 'rw-r--r--';
                const size = entry.type === 'dir' ? '4096' : '  512';
                const date = 'Jan 15 10:00';
                const safeName = escapeHtml(entry.name);
                const safeOwner = escapeHtml(entry.owner || 'user');
                const safeGroup = escapeHtml(entry.group || safeOwner);
                const name = entry.type === 'dir'
                    ? `<span class="output-dir">${safeName}/</span>`
                    : (perm.includes('x') ? `<span class="output-exec">${safeName}</span>` : safeName);
                return `${typeChar}${perm}  1 ${safeOwner} ${safeGroup} ${size} ${date} ${name}`;
            });
            return { output: `total ${result.entries.length}\n` + lines.join('\n'), isHtml: true };
        }

        const items = result.entries.map(entry => {
            const safeName = escapeHtml(entry.name);
            if (entry.type === 'dir') return `<span class="output-dir">${safeName}/</span>`;
            if (entry.permissions && entry.permissions.includes('x')) return `<span class="output-exec">${safeName}</span>`;
            return safeName;
        });

        // Display in columns
        return { output: items.join('  '), isHtml: true };
    }, 'List directory contents');
}
