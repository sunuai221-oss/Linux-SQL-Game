import { FileSystem } from './filesystem/FileSystem.js';
import { defaultStructure } from './filesystem/defaultStructure.js';
import { registerNavigationCommands } from './commands/navigation.js';
import { registerFileCommands } from './commands/files.js';
import { registerSearchCommands } from './commands/search.js';
import { registerUtilCommands } from './commands/utils.js';
import { Terminal } from './terminal/Terminal.js';
import { MissionSystem } from './missions/MissionSystem.js';
import { createScopedStorage } from './missions/storageFactory.js';
import { SqlTrack } from './tracks/sql/index.js';
import { i18n } from './i18n/index.js';

class App {
    constructor() {
        this.i18n = i18n;

        this.activeMode = 'linux';
        this.linuxFs = null;
        this.linuxMissionSystem = null;

        this.sqlTrack = null;
        this.sqlMissionSystem = null;
        this.sqlStorage = createScopedStorage('linux-game-save-sql');
        this.sqlAvailable = false;

        this.terminal = null;
    }

    async init() {
        this._createLinuxContext();
        try {
            await this._createSqlContext();
            this.sqlAvailable = true;
        } catch (error) {
            this.sqlAvailable = false;
            console.warn('SQL mode unavailable, continuing in Linux mode only:', error);
        }

        this.terminal = new Terminal(this.linuxFs, (input, parsed, result) => {
            this._getActiveMissionSystem().onCommand(input, parsed, result);
        }, this.i18n);

        this._bindUI();
        this._applyLocalizedUI();

        const savedMode = localStorage.getItem('linux-game-mode') || 'linux';
        this._switchMode(savedMode);

        this.terminal.focus();
    }

    _registerLinuxCommands(fs) {
        registerNavigationCommands(fs);
        registerFileCommands(fs);
        registerSearchCommands(fs);
        registerUtilCommands(fs, this.i18n);
    }

    _createLinuxContext() {
        this.linuxFs = new FileSystem(defaultStructure);
        this._registerLinuxCommands(this.linuxFs);
        this.linuxMissionSystem = new MissionSystem(this.linuxFs, this.i18n);
    }

    async _createSqlContext() {
        this.sqlTrack = await SqlTrack.create();
        this.sqlMissionSystem = this._createSqlMissionSystem();
    }

    _createSqlMissionSystem() {
        return new MissionSystem(this.sqlTrack.runtime, this.i18n, {
            missions: this.sqlTrack.missions,
            levels: this.sqlTrack.levels,
            storage: this.sqlStorage,
            applyLocalization: false,
            enablePermissionLessonFixtures: false,
        });
    }

    _getActiveMissionSystem() {
        if (this.activeMode === 'sql' && this.sqlMissionSystem) return this.sqlMissionSystem;
        return this.linuxMissionSystem;
    }

    _renderActiveMissionSystem() {
        const missionSystem = this._getActiveMissionSystem();
        missionSystem._renderMissions();
        missionSystem._updateHeader();

        const freeModeToggle = document.getElementById('free-mode-toggle');
        if (freeModeToggle) {
            freeModeToggle.checked = !!missionSystem.freeMode;
        }
    }

    _switchMode(mode) {
        const requestedSql = mode === 'sql';
        const nextMode = requestedSql && this.sqlAvailable ? 'sql' : 'linux';
        this.activeMode = nextMode;

        const modeToggle = document.getElementById('mode-toggle');
        if (modeToggle) modeToggle.value = nextMode;

        if (nextMode === 'sql') {
            this.terminal.fs = this.linuxFs;
            this.terminal.autocomplete.fs = this.linuxFs;
            this.terminal.setMode('sql', {
                execute: (input) => this.sqlTrack.execute(input),
                prompt: 'sql@linux-game:lab$ ',
                title: 'sql@linux-game: lab',
                autocomplete: false,
                welcomeLines: this.sqlTrack.getWelcomeLines(),
            });
        } else {
            this.terminal.fs = this.linuxFs;
            this.terminal.nanoSession = null;
            this.terminal.autocomplete.fs = this.linuxFs;
            this.terminal.setMode('linux', {
                autocomplete: true,
            });
        }

        localStorage.setItem('linux-game-mode', nextMode);
        this._renderActiveMissionSystem();
    }

    _bindUI() {
        const themeBtn = document.getElementById('theme-toggle');
        const savedTheme = localStorage.getItem('linux-game-theme') || 'light';
        this._setTheme(savedTheme);

        themeBtn.addEventListener('click', () => {
            const current = document.documentElement.getAttribute('data-theme');
            const next = current === 'dark' ? 'light' : 'dark';
            this._setTheme(next);
            localStorage.setItem('linux-game-theme', next);
        });

        const modeToggle = document.getElementById('mode-toggle');
        if (!this.sqlAvailable) {
            const sqlOption = modeToggle?.querySelector('option[value=\"sql\"]');
            if (sqlOption) {
                sqlOption.disabled = true;
                sqlOption.textContent = 'SQL (Unavailable)';
            }
        }
        modeToggle.addEventListener('change', (e) => {
            this._switchMode(e.target.value);
        });

        const langBtn = document.getElementById('lang-toggle');
        langBtn.addEventListener('click', () => {
            const current = this.i18n.getLanguage();
            const next = current === 'en' ? 'fr' : 'en';
            this.i18n.setLanguage(next);

            this.linuxMissionSystem.setLanguage(next);
            this.sqlMissionSystem.setLanguage(next);
            this._applyLocalizedUI();
            this._renderActiveMissionSystem();
        });

        const freeModeToggle = document.getElementById('free-mode-toggle');
        freeModeToggle.addEventListener('change', (e) => {
            this._getActiveMissionSystem().setFreeMode(e.target.checked);
        });

        const resetBtn = document.getElementById('reset-btn');
        resetBtn.addEventListener('click', () => {
            if (!confirm(this.i18n.t('ui.resetConfirm', 'Restart? Your progress will be lost.'))) {
                return;
            }

            if (this.activeMode === 'sql' && this.sqlAvailable) {
                this.sqlTrack.reset();
                this.sqlMissionSystem.reset();
                this.sqlMissionSystem = this._createSqlMissionSystem();
                this._switchMode('sql');
            } else {
                this.linuxMissionSystem.reset();
                this._createLinuxContext();
                this._switchMode('linux');
            }

            this._applyLocalizedUI();
            this.terminal.focus();
        });
    }

    _applyLocalizedUI() {
        document.title = this.i18n.t('ui.documentTitle', 'Linux SQL Game - Learn the Terminal');

        const title = document.getElementById('app-title');
        if (title) title.textContent = this.i18n.t('ui.appTitle', 'Linux SQL Game');

        const missionsTitle = document.getElementById('missions-title');
        if (missionsTitle) missionsTitle.textContent = this.i18n.t('ui.missionsTitle', 'Missions');

        const freeModeLabel = document.getElementById('free-mode-label');
        if (freeModeLabel) freeModeLabel.textContent = this.i18n.t('ui.freeMode', 'Free mode');

        const resetBtn = document.getElementById('reset-btn');
        if (resetBtn) resetBtn.title = this.i18n.t('ui.resetTitle', 'Restart');

        const langBtn = document.getElementById('lang-toggle');
        if (langBtn) {
            const current = this.i18n.getLanguage();
            const next = current === 'en' ? 'fr' : 'en';
            langBtn.textContent = next.toUpperCase();
            langBtn.title = current === 'en'
                ? this.i18n.t('ui.switchToFrench', 'Switch to French')
                : this.i18n.t('ui.switchToEnglish', 'Switch to English');
        }

        this._setTheme(document.documentElement.getAttribute('data-theme') || 'light');
    }

    _setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        const btn = document.getElementById('theme-toggle');
        btn.textContent = theme === 'dark' ? '\u2600' : '\u263E';
        btn.title = theme === 'dark'
            ? this.i18n.t('ui.themeLightTitle', 'Light mode')
            : this.i18n.t('ui.themeDarkTitle', 'Dark mode');
    }
}

window.addEventListener('DOMContentLoaded', async () => {
    try {
        const app = new App();
        await app.init();
    } catch (error) {
        console.error('App initialization failed:', error);
    }
});
