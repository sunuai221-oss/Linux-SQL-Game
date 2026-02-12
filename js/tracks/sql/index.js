import { SqlEngine } from './engine/SqlEngine.js';
import { sqlLevels } from './missions/levels.sql.js';
import { sqlMissions } from './missions/missions.sql.js';

async function loadText(url) {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Failed to load ${url}`);
    }
    return response.text();
}

export class SqlTrack {
    static async create() {
        const schemaUrl = new URL('./data/schema.sql', import.meta.url);
        const seedUrl = new URL('./data/seed.sql', import.meta.url);

        const [schemaSql, seedSql] = await Promise.all([
            loadText(schemaUrl),
            loadText(seedUrl),
        ]);

        return new SqlTrack(schemaSql, seedSql);
    }

    constructor(schemaSql, seedSql) {
        this.engine = new SqlEngine(schemaSql, seedSql);
        this.runtime = this.engine;
        this.levels = sqlLevels;
        this.missions = sqlMissions;
    }

    execute(input) {
        return this.engine.execute(input);
    }

    reset() {
        return this.engine.reset();
    }

    getWelcomeLines() {
        return [
            'SQL mode enabled. Run SELECT queries directly.',
            'Meta commands: .tables  .schema <table>  .reset  .help',
        ];
    }
}
