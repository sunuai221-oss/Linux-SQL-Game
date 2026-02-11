import { registry } from './registry.js';

export function registerFileCommands(fs) {
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
}
