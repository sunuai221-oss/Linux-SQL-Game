class CommandRegistry {
    constructor() {
        this.commands = new Map();
    }

    register(name, handler, description = '') {
        this.commands.set(name, { handler, description });
    }

    get(name) {
        return this.commands.get(name);
    }

    has(name) {
        return this.commands.has(name);
    }

    getAll() {
        return this.commands;
    }

    getNames() {
        return [...this.commands.keys()].sort();
    }
}

export const registry = new CommandRegistry();
