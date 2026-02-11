export class Autocomplete {
    constructor(fs, registry) {
        this.fs = fs;
        this.registry = registry;
    }

    complete(input) {
        const parts = input.split(' ');

        // If typing the command name (first word)
        if (parts.length <= 1) {
            return this._completeCommand(parts[0]);
        }

        // Otherwise, complete file/directory paths
        const partial = parts[parts.length - 1];
        return this._completePath(partial);
    }

    _completeCommand(partial) {
        const commands = this.registry.getNames();
        const matches = commands.filter(cmd => cmd.startsWith(partial));

        if (matches.length === 0) return { completed: null, options: [] };
        if (matches.length === 1) return { completed: matches[0] + ' ', options: [] };

        // Find common prefix
        const common = this._commonPrefix(matches);
        return {
            completed: common !== partial ? common : null,
            options: matches,
        };
    }

    _completePath(partial) {
        let dirPath, prefix;

        if (partial.includes('/')) {
            const lastSlash = partial.lastIndexOf('/');
            dirPath = partial.substring(0, lastSlash) || '/';
            prefix = partial.substring(lastSlash + 1);
        } else {
            dirPath = '.';
            prefix = partial;
        }

        // Handle ~ in path
        let resolvedDir = dirPath;
        if (dirPath === '~') resolvedDir = this.fs.home;
        else if (dirPath.startsWith('~/')) resolvedDir = this.fs.home + dirPath.slice(1);

        const node = this.fs.getNode(resolvedDir);
        if (!node || node.type !== 'dir') return { completed: null, options: [] };

        const entries = Object.keys(node.children).filter(name => name.startsWith(prefix));

        if (entries.length === 0) return { completed: null, options: [] };

        // Build the full completed path
        const basePath = partial.includes('/') ? partial.substring(0, partial.lastIndexOf('/') + 1) : '';

        if (entries.length === 1) {
            const name = entries[0];
            const child = node.children[name];
            const suffix = child.type === 'dir' ? '/' : ' ';
            return { completed: basePath + name + suffix, options: [] };
        }

        const common = this._commonPrefix(entries);
        return {
            completed: common !== prefix ? basePath + common : null,
            options: entries.map(name => {
                const child = node.children[name];
                return child.type === 'dir' ? name + '/' : name;
            }),
        };
    }

    _commonPrefix(strings) {
        if (strings.length === 0) return '';
        let prefix = strings[0];
        for (let i = 1; i < strings.length; i++) {
            while (!strings[i].startsWith(prefix)) {
                prefix = prefix.slice(0, -1);
            }
        }
        return prefix;
    }
}
