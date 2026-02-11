export class CommandHistory {
    constructor(maxSize = 100) {
        this.entries = [];
        this.maxSize = maxSize;
        this.position = -1;
        this.tempInput = '';
    }

    add(command) {
        if (!command.trim()) return;
        // Don't add duplicates of the last entry
        if (this.entries.length > 0 && this.entries[this.entries.length - 1] === command) return;

        this.entries.push(command);
        if (this.entries.length > this.maxSize) {
            this.entries.shift();
        }
        this.position = -1;
        this.tempInput = '';
    }

    navigateUp(currentInput) {
        if (this.entries.length === 0) return null;

        if (this.position === -1) {
            this.tempInput = currentInput;
            this.position = this.entries.length - 1;
        } else if (this.position > 0) {
            this.position--;
        }

        return this.entries[this.position];
    }

    navigateDown(currentInput) {
        if (this.position === -1) return null;

        if (this.position < this.entries.length - 1) {
            this.position++;
            return this.entries[this.position];
        }

        this.position = -1;
        return this.tempInput;
    }

    reset() {
        this.position = -1;
        this.tempInput = '';
    }

    getAll() {
        return [...this.entries];
    }
}
