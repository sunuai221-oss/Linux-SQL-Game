import { registry } from './registry.js';
import { CommandParser } from './CommandParser.js';

export function registerFileCommands(fs) {
    const requireSudo = (cmd, context) => {
        if (context && context.sudo) return null;
        return { output: `${cmd}: permission denied (try: sudo ${cmd} ...)`, isError: true };
    };

    const parseGroupList = (raw) => {
        if (!raw) return [];
        return String(raw)
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean);
    };

    // cat
    registry.register('cat', (args, flags) => {
        if (args.length === 0) return { output: 'cat: missing operand', isError: true };

        const outputs = [];
        for (const path of args) {
            const result = fs.readFile(path);
            if (result.error) return { output: result.error, isError: true };
            outputs.push(result.content);
        }
        return { output: outputs.join('\n') };
    }, 'Concatenate and display files');

    // touch
    registry.register('touch', (args, flags) => {
        if (args.length === 0) return { output: 'touch: missing file operand', isError: true };

        for (const path of args) {
            const result = fs.createFile(path);
            if (result.error) return { output: result.error, isError: true };
        }
        return { output: '' };
    }, 'Create empty files');

    // mkdir
    registry.register('mkdir', (args, flags) => {
        if (args.length === 0) return { output: 'mkdir: missing operand', isError: true };

        const recursive = flags.p || false;
        for (const path of args) {
            const result = fs.createDir(path, recursive);
            if (result.error) return { output: result.error, isError: true };
        }
        return { output: '' };
    }, 'Create directories');

    // rm
    registry.register('rm', (args, flags) => {
        if (args.length === 0) return { output: 'rm: missing operand', isError: true };

        const recursive = flags.r || flags.R || false;
        for (const path of args) {
            const result = fs.delete(path, recursive);
            if (result.error) return { output: result.error, isError: true };
        }
        return { output: '' };
    }, 'Remove files or directories');

    // cp
    registry.register('cp', (args, flags) => {
        if (args.length < 2) return { output: 'cp: missing operand', isError: true };

        const recursive = flags.r || flags.R || false;
        const src = args[0];
        const dest = args[1];
        const result = fs.copy(src, dest, recursive);
        if (result.error) return { output: result.error, isError: true };
        return { output: '' };
    }, 'Copy files and directories');

    // mv
    registry.register('mv', (args, flags) => {
        if (args.length < 2) return { output: 'mv: missing operand', isError: true };

        const src = args[0];
        const dest = args[1];
        const result = fs.move(src, dest);
        if (result.error) return { output: result.error, isError: true };
        return { output: '' };
    }, 'Move or rename files');

    // chmod
    registry.register('chmod', (args, flags) => {
        if (args.length < 2) return { output: 'chmod: missing operand', isError: true };

        const mode = args[0];
        const path = args[1];
        const result = fs.chmod(path, mode);
        if (result.error) return { output: result.error, isError: true };
        return { output: '' };
    }, 'Change file permissions');

    // useradd
    registry.register('useradd', (args, flags, stdin, context) => {
        const deny = requireSudo('useradd', context);
        if (deny) return deny;
        if (args.length === 0) return { output: 'useradd: missing login name', isError: true };

        let cursor = 0;
        let primaryGroup = null;
        let supplementalGroups = [];

        if (flags.g) {
            primaryGroup = args[cursor++];
            if (!primaryGroup) return { output: 'useradd: option requires an argument -- g', isError: true };
        }
        if (flags.G) {
            const rawGroups = args[cursor++];
            if (!rawGroups) return { output: 'useradd: option requires an argument -- G', isError: true };
            supplementalGroups = parseGroupList(rawGroups);
        }

        const username = args[cursor];
        if (!username) return { output: 'useradd: missing login name', isError: true };
        if (args.length > cursor + 1) return { output: 'useradd: too many arguments', isError: true };

        const result = fs.useradd(username, { primaryGroup, supplementalGroups });
        if (result.error) return { output: result.error, isError: true };
        return { output: '' };
    }, 'Create a new user (sudo required)');

    // usermod
    registry.register('usermod', (args, flags, stdin, context) => {
        const deny = requireSudo('usermod', context);
        if (deny) return deny;
        if (args.length === 0) return { output: 'usermod: missing login name', isError: true };
        if (flags.a && !flags.G) {
            return { output: 'usermod: option -a requires -G', isError: true };
        }

        let cursor = 0;
        let primaryGroup = null;
        let supplementalGroups = null;
        let home = null;
        let newLogin = null;

        if (flags.g) {
            primaryGroup = args[cursor++];
            if (!primaryGroup) return { output: 'usermod: option requires an argument -- g', isError: true };
        }
        if (flags.G) {
            const rawGroups = args[cursor++];
            if (!rawGroups) return { output: 'usermod: option requires an argument -- G', isError: true };
            supplementalGroups = parseGroupList(rawGroups);
        }
        if (flags.d) {
            home = args[cursor++];
            if (!home) return { output: 'usermod: option requires an argument -- d', isError: true };
        }
        if (flags.l) {
            newLogin = args[cursor++];
            if (!newLogin) return { output: 'usermod: option requires an argument -- l', isError: true };
        }

        const username = args[cursor];
        if (!username) return { output: 'usermod: missing login name', isError: true };
        if (args.length > cursor + 1) return { output: 'usermod: too many arguments', isError: true };

        const result = fs.usermod(username, {
            primaryGroup,
            supplementalGroups,
            appendSupplemental: !!flags.a,
            home,
            newLogin,
            lock: !!flags.L,
        });
        if (result.error) return { output: result.error, isError: true };
        return { output: '' };
    }, 'Modify an existing user (sudo required)');

    // userdel
    registry.register('userdel', (args, flags, stdin, context) => {
        const deny = requireSudo('userdel', context);
        if (deny) return deny;
        if (args.length === 0) return { output: 'userdel: missing login name', isError: true };
        if (args.length > 1) return { output: 'userdel: too many arguments', isError: true };

        const username = args[0];
        const result = fs.userdel(username, { removeHome: !!flags.r });
        if (result.error) return { output: result.error, isError: true };
        return { output: '' };
    }, 'Delete a user account (sudo required)');

    // chown
    registry.register('chown', (args, flags, stdin, context) => {
        const deny = requireSudo('chown', context);
        if (deny) return deny;
        if (args.length < 2) return { output: 'chown: missing operand', isError: true };
        if (args.length > 2) return { output: 'chown: too many arguments', isError: true };

        const ownerSpec = args[0];
        const target = args[1];
        const result = fs.chown(target, ownerSpec, !!flags.R);
        if (result.error) return { output: result.error, isError: true };
        return { output: '' };
    }, 'Change file owner/group (sudo required)');

    // sudo (simulated)
    registry.register('sudo', (args, flags, stdin, context) => {
        if (args.length === 0) {
            return { output: 'sudo: usage: sudo <command> [args...]', isError: true };
        }

        const parsed = CommandParser.parseSingle(args.join(' '));
        if (!parsed || parsed.type !== 'command' || !parsed.command) {
            return { output: 'sudo: invalid command', isError: true };
        }

        const allowed = new Set(['useradd', 'usermod', 'userdel', 'chown']);
        if (!allowed.has(parsed.command)) {
            return {
                output: `sudo: command '${parsed.command}' is blocked in Linux Game (responsible use: only account/ownership admin commands are allowed)`,
                isError: true,
            };
        }

        const entry = registry.get(parsed.command);
        if (!entry) {
            return { output: `${parsed.command}: command not found. Type 'help' for available commands.`, isError: true };
        }

        const elevatedContext = { ...(context || {}), sudo: true };
        return entry.handler(parsed.args, parsed.flags, null, elevatedContext);
    }, 'Execute limited admin commands with elevated privileges (simulated)');
}
