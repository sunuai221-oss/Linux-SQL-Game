function splitStatements(sqlText) {
    return String(sqlText || '')
        .split(';')
        .map((part) => part.trim())
        .filter(Boolean)
        .map((stmt) => stmt + ';');
}

function parseSchema(sqlText) {
    const schema = {};
    const regex = /create\s+table\s+(?:if\s+not\s+exists\s+)?([a-zA-Z_][\w]*)\s*\(([^;]+?)\);/gim;

    let match;
    while ((match = regex.exec(String(sqlText || ''))) !== null) {
        const table = match[1];
        const body = match[2];
        const columns = body
            .split(',')
            .map((line) => line.trim())
            .filter(Boolean)
            .map((line) => line.split(/\s+/)[0])
            .filter((name) => name && !['primary', 'foreign', 'constraint'].includes(name.toLowerCase()));
        schema[table] = columns;
    }

    return schema;
}

function formatRows(rows, columns) {
    if (!Array.isArray(rows) || rows.length === 0) {
        return '(0 rows)';
    }

    const headers = Array.isArray(columns) && columns.length > 0
        ? columns
        : Object.keys(rows[0] || {});

    const lines = [];
    lines.push(headers.join(' | '));
    lines.push(headers.map(() => '---').join('|'));

    for (const row of rows) {
        const line = headers.map((header) => {
            const value = row?.[header];
            if (value === null || value === undefined) return 'NULL';
            return String(value);
        }).join(' | ');
        lines.push(line);
    }

    lines.push(`(${rows.length} row${rows.length > 1 ? 's' : ''})`);
    return lines.join('\n');
}

export class SqlEngine {
    constructor(schemaSql, seedSql) {
        this.schemaSql = String(schemaSql || '');
        this.seedSql = String(seedSql || '');
        this.schemaMap = parseSchema(this.schemaSql);
        this.tableNames = Object.keys(this.schemaMap);
        this.queryHistory = [];
        this.reset();
    }

    _ensureDependency() {
        if (typeof window === 'undefined' || !window.alasql || !window.alasql.Database) {
            throw new Error('SQL dependency missing: alasql is not loaded');
        }
    }

    reset() {
        this._ensureDependency();
        this.db = new window.alasql.Database();

        for (const statement of splitStatements(this.schemaSql)) {
            this.db.exec(statement);
        }
        for (const statement of splitStatements(this.seedSql)) {
            this.db.exec(statement);
        }

        return { success: true };
    }

    _tableSchemaText(tableName) {
        const columns = this.schemaMap[tableName];
        if (!columns) return null;
        return `${tableName} (${columns.join(', ')})`;
    }

    execute(input) {
        const raw = String(input || '').trim();
        if (!raw) {
            return { output: '', rows: [], columns: [], isError: false };
        }

        if (raw === '.help') {
            return {
                output: '.tables\n.schema <table>\n.reset\n.help\n\nRun SQL SELECT queries directly.',
                rows: [],
                columns: [],
                isError: false,
            };
        }

        if (raw === '.tables') {
            return {
                output: this.tableNames.length > 0 ? this.tableNames.join('\n') : '(no tables)',
                rows: this.tableNames.map((name) => ({ table: name })),
                columns: ['table'],
                isError: false,
            };
        }

        if (raw.startsWith('.schema')) {
            const parts = raw.split(/\s+/).filter(Boolean);
            if (parts.length < 2) {
                return { output: 'sql: usage: .schema <table>', rows: [], columns: [], isError: true };
            }
            const tableName = parts[1];
            const schemaText = this._tableSchemaText(tableName);
            if (!schemaText) {
                return { output: `sql: unknown table '${tableName}'`, rows: [], columns: [], isError: true };
            }
            return {
                output: schemaText,
                rows: [{ table: tableName, columns: this.schemaMap[tableName].join(', ') }],
                columns: ['table', 'columns'],
                isError: false,
            };
        }

        if (raw === '.reset') {
            this.reset();
            return {
                output: 'SQL sandbox reset.',
                rows: [],
                columns: [],
                isError: false,
            };
        }

        if (raw.startsWith('.')) {
            return {
                output: `sql: unknown meta-command '${raw}'. Type .help for options.`,
                rows: [],
                columns: [],
                isError: true,
            };
        }

        if (!/^select\b/i.test(raw)) {
            return {
                output: 'sql: only SELECT queries are allowed in this learning mode',
                rows: [],
                columns: [],
                isError: true,
            };
        }

        try {
            const rows = this.db.exec(raw);
            const normalizedRows = Array.isArray(rows) ? rows : [];
            const columns = normalizedRows.length > 0 ? Object.keys(normalizedRows[0]) : [];
            this.queryHistory.push(raw);

            return {
                output: formatRows(normalizedRows, columns),
                rows: normalizedRows,
                columns,
                isError: false,
            };
        } catch (error) {
            return {
                output: `sql: ${error.message}`,
                rows: [],
                columns: [],
                isError: true,
            };
        }
    }

    serialize() {
        return {
            queryHistory: [...this.queryHistory],
        };
    }

    restore(data) {
        this.reset();
        if (!data || typeof data !== 'object') return { success: true };

        const history = Array.isArray(data.queryHistory) ? data.queryHistory : [];
        this.queryHistory = history
            .map((entry) => String(entry || '').trim())
            .filter(Boolean);

        return { success: true };
    }
}
