import { FileSystem } from './filesystem/FileSystem.js';
import { defaultStructure } from './filesystem/defaultStructure.js';
import { registerNavigationCommands } from './commands/navigation.js';
import { registerFileCommands } from './commands/files.js';
import { registerSearchCommands } from './commands/search.js';
import { registerUtilCommands } from './commands/utils.js';
import { Terminal } from './terminal/Terminal.js';
import { MissionSystem } from './missions/MissionSystem.js';

class App {
    constructor() {
        this.fs = new FileSystem(defaultStructure);
        this.missionSystem = null;
        this.terminal = null;

        this._init();
    }

    _init() {
        // Register all commands
        registerNavigationCommands(this.fs);
        registerFileCommands(this.fs);
        registerSearchCommands(this.fs);
        registerUtilCommands(this.fs);

        // Init mission system (loads saved progress and may restore fs)
        this.missionSystem = new MissionSystem(this.fs);

        // Init terminal
        this.terminal = new Terminal(this.fs, (input, parsed, result) => {
            this.missionSystem.onCommand(input, parsed, result);
        });

        // Bind UI events
        this._bindUI();

        // Focus terminal
        this.terminal.focus();
    }

    _bindUI() {
        // Theme toggle
        const themeBtn = document.getElementById('theme-toggle');
        const savedTheme = localStorage.getItem('linux-game-theme') || 'light';
        this._setTheme(savedTheme);

        themeBtn.addEventListener('click', () => {
            const current = document.documentElement.getAttribute('data-theme');
            const next = current === 'dark' ? 'light' : 'dark';
            this._setTheme(next);
            localStorage.setItem('linux-game-theme', next);
        });

        // Free mode toggle
        const freeModeToggle = document.getElementById('free-mode-toggle');
        freeModeToggle.addEventListener('change', (e) => {
            this.missionSystem.setFreeMode(e.target.checked);
        });

        // Reset button
        const resetBtn = document.getElementById('reset-btn');
        resetBtn.addEventListener('click', () => {
            if (confirm('Recommencer ? Ta progression sera perdue.')) {
                this.missionSystem.reset();
                this.fs = new FileSystem(defaultStructure);

                // Re-register commands with new fs
                registerNavigationCommands(this.fs);
                registerFileCommands(this.fs);
                registerSearchCommands(this.fs);
                registerUtilCommands(this.fs);

                this.missionSystem.fs = this.fs;
                this.missionSystem._renderMissions();
                this.missionSystem._updateHeader();

                this.terminal.fs = this.fs;
                this.terminal.nanoSession = null;
                this.terminal.autocomplete.fs = this.fs;
                this.terminal.clear();
                this.terminal._showWelcome();
                this.terminal._updatePrompt();
                this.terminal.focus();
            }
        });
    }

    _setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        const btn = document.getElementById('theme-toggle');
        btn.textContent = theme === 'dark' ? '\u2600' : '\u263E';
        btn.title = theme === 'dark' ? 'Mode clair' : 'Mode sombre';
    }
}

// Launch
window.addEventListener('DOMContentLoaded', () => {
    new App();
});
