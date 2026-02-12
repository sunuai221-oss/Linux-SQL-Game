function normalizeSql(input) {
    return String(input || '')
        .trim()
        .replace(/;+/g, ';')
        .replace(/;$/g, '')
        .replace(/\s+/g, ' ')
        .toLowerCase();
}

function isSuccess(result) {
    return !!result && !result.isError && Array.isArray(result.rows);
}

function getRowValue(row, key) {
    if (!row || typeof row !== 'object') return undefined;
    if (Object.prototype.hasOwnProperty.call(row, key)) return row[key];

    const target = String(key).toLowerCase();
    for (const [currentKey, currentValue] of Object.entries(row)) {
        if (String(currentKey).toLowerCase() === target) return currentValue;
    }
    return undefined;
}

function hasColumn(result, key) {
    const target = String(key).toLowerCase();
    if (Array.isArray(result?.columns)) {
        if (result.columns.some((column) => String(column).toLowerCase() === target)) return true;
    }
    const first = result?.rows?.[0];
    if (!first || typeof first !== 'object') return false;
    return Object.keys(first).some((k) => String(k).toLowerCase() === target);
}

function parseDate(value) {
    const time = Date.parse(String(value));
    return Number.isNaN(time) ? null : time;
}

function toNumber(value) {
    const number = Number(value);
    return Number.isFinite(number) ? number : null;
}

function numericValuesFromRow(row) {
    return Object.values(row || {})
        .map((value) => toNumber(value))
        .filter((value) => value !== null);
}

function toComparable(value) {
    const number = toNumber(value);
    if (number !== null) return number;
    return String(value ?? '').toLowerCase();
}

function isSortedBy(rows, key, direction = 'asc') {
    for (let i = 1; i < rows.length; i++) {
        const prev = toComparable(getRowValue(rows[i - 1], key));
        const current = toComparable(getRowValue(rows[i], key));
        if (direction === 'asc' && prev > current) return false;
        if (direction === 'desc' && prev < current) return false;
    }
    return true;
}

function isSortedByPair(rows, primary, secondary) {
    for (let i = 1; i < rows.length; i++) {
        const prevPrimary = toComparable(getRowValue(rows[i - 1], primary));
        const currentPrimary = toComparable(getRowValue(rows[i], primary));
        if (prevPrimary > currentPrimary) return false;
        if (prevPrimary === currentPrimary) {
            const prevSecondary = toComparable(getRowValue(rows[i - 1], secondary));
            const currentSecondary = toComparable(getRowValue(rows[i], secondary));
            if (prevSecondary > currentSecondary) return false;
        }
    }
    return true;
}

function likeToRegex(pattern) {
    const escaped = String(pattern).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = '^' + escaped.replace(/%/g, '.*').replace(/_/g, '.') + '$';
    return new RegExp(regex, 'i');
}

function sqlContainsAll(sql, fragments) {
    return fragments.every((fragment) => sql.includes(fragment));
}

function mission(def) {
    return {
        id: def.id,
        level: def.level,
        title: def.title,
        description: def.description,
        hint: def.hint,
        lesson: {
            title: def.lessonTitle || 'Mini SQL tutorial',
            content: def.lessonContent || 'Build confidence by combining SELECT, filters, and sorting.',
        },
        points: def.points,
        canonicalQuery: def.canonicalQuery,
        validate(runtime, history, lastInput, lastResult) {
            const sql = normalizeSql(lastInput);
            if (Array.isArray(def.requiredSql) && !sqlContainsAll(sql, def.requiredSql)) return false;
            if (!isSuccess(lastResult)) return false;
            if ((def.minRows ?? 1) > 0 && lastResult.rows.length < (def.minRows ?? 1)) return false;
            return typeof def.rowCheck === 'function'
                ? !!def.rowCheck({ runtime, sql, result: lastResult, rows: lastResult.rows })
                : true;
        },
    };
}

const likeITPercent = likeToRegex('IT%');
const likePercentSon = likeToRegex('%son');
const likeNUnderscore = likeToRegex('N_');

export const sqlMissions = [
    // Level 1
    mission({ id: 'sql-l1-01-select-all-employees', level: 1, title: 'Select all employees', description: 'Return every column from employees.', hint: 'SELECT * FROM employees;', points: 50, canonicalQuery: 'SELECT * FROM employees;', requiredSql: ['select *', 'from employees'] }),
    mission({ id: 'sql-l1-02-select-all-machines', level: 1, title: 'Select all machines', description: 'Return every column from machines.', hint: 'SELECT * FROM machines;', points: 50, canonicalQuery: 'SELECT * FROM machines;', requiredSql: ['select *', 'from machines'] }),
    mission({ id: 'sql-l1-03-select-columns', level: 1, title: 'Select specific columns', description: 'Return firstname and department.', hint: 'SELECT firstname, department FROM employees;', points: 55, canonicalQuery: 'SELECT firstname, department FROM employees;', requiredSql: ['select', 'firstname', 'department', 'from employees'], rowCheck: ({ result }) => hasColumn(result, 'firstname') && hasColumn(result, 'department') }),
    mission({ id: 'sql-l1-04-orderby-department-asc', level: 1, title: 'Sort by department ASC', description: 'Sort employees by department ascending.', hint: 'SELECT * FROM employees ORDER BY department ASC;', points: 60, canonicalQuery: 'SELECT * FROM employees ORDER BY department ASC;', requiredSql: ['from employees', 'order by department'], rowCheck: ({ rows }) => isSortedBy(rows, 'department', 'asc') }),
    mission({ id: 'sql-l1-05-orderby-salary-desc', level: 1, title: 'Sort by salary DESC', description: 'Sort employees by salary descending.', hint: 'SELECT * FROM employees ORDER BY salary DESC;', points: 60, canonicalQuery: 'SELECT * FROM employees ORDER BY salary DESC;', requiredSql: ['from employees', 'order by salary', 'desc'], rowCheck: ({ rows }) => isSortedBy(rows, 'salary', 'desc') }),
    mission({ id: 'sql-l1-06-where-country-usa', level: 1, title: 'Filter country = USA', description: 'Return only USA employees.', hint: "SELECT * FROM employees WHERE country = 'USA';", points: 65, canonicalQuery: "SELECT * FROM employees WHERE country = 'USA';", requiredSql: ['from employees', 'where', 'country', '='], rowCheck: ({ rows }) => rows.every((row) => String(getRowValue(row, 'country') || '').toUpperCase() === 'USA') }),
    mission({ id: 'sql-l1-07-where-region-5', level: 1, title: 'Filter region = 5', description: 'Return rows where region is 5.', hint: 'SELECT * FROM employees WHERE region = 5;', points: 65, canonicalQuery: 'SELECT * FROM employees WHERE region = 5;', requiredSql: ['from employees', 'where', 'region', '='], rowCheck: ({ rows }) => rows.every((row) => toNumber(getRowValue(row, 'region')) === 5) }),
    mission({ id: 'sql-l1-08-where-salary-gt', level: 1, title: 'Filter salary > 90000', description: 'Return salary strictly greater than 90000.', hint: 'SELECT * FROM employees WHERE salary > 90000;', points: 70, canonicalQuery: 'SELECT * FROM employees WHERE salary > 90000;', requiredSql: ['from employees', 'where', 'salary', '>'], rowCheck: ({ rows }) => rows.every((row) => (toNumber(getRowValue(row, 'salary')) ?? -Infinity) > 90000) }),
    mission({ id: 'sql-l1-09-where-salary-lte', level: 1, title: 'Filter salary <= 70000', description: 'Return salary lower or equal to 70000.', hint: 'SELECT * FROM employees WHERE salary <= 70000;', points: 70, canonicalQuery: 'SELECT * FROM employees WHERE salary <= 70000;', requiredSql: ['from employees', 'where', 'salary', '<='], rowCheck: ({ rows }) => rows.every((row) => (toNumber(getRowValue(row, 'salary')) ?? Infinity) <= 70000) }),
    mission({ id: 'sql-l1-10-where-hiredate-lt', level: 1, title: 'Filter hiredate < 2003-01-01', description: 'Return hires before 2003.', hint: "SELECT * FROM employees WHERE hiredate < '2003-01-01';", points: 75, canonicalQuery: "SELECT * FROM employees WHERE hiredate < '2003-01-01';", requiredSql: ['from employees', 'where', 'hiredate', '<'], rowCheck: ({ rows }) => { const limit = parseDate('2003-01-01'); return rows.every((row) => { const date = parseDate(getRowValue(row, 'hiredate')); return date !== null && limit !== null && date < limit; }); } }),
    // Level 2
    mission({ id: 'sql-l2-11-and-country-dept', level: 2, title: 'Use AND', description: 'Return USA employees in IT.', hint: "SELECT * FROM employees WHERE country = 'USA' AND department = 'IT';", points: 80, canonicalQuery: "SELECT * FROM employees WHERE country = 'USA' AND department = 'IT';", requiredSql: ['from employees', 'where', 'country', 'department', ' and '], rowCheck: ({ rows }) => rows.every((row) => { const c = String(getRowValue(row, 'country') || '').toUpperCase(); const d = String(getRowValue(row, 'department') || '').toUpperCase(); return c === 'USA' && d === 'IT'; }) }),
    mission({ id: 'sql-l2-12-or-country', level: 2, title: 'Use OR', description: 'Return employees in USA or Canada.', hint: "SELECT * FROM employees WHERE country = 'USA' OR country = 'Canada';", points: 80, canonicalQuery: "SELECT * FROM employees WHERE country = 'USA' OR country = 'Canada';", requiredSql: ['from employees', 'where', 'country', ' or '], rowCheck: ({ rows }) => rows.every((row) => { const c = String(getRowValue(row, 'country') || '').toUpperCase(); return c === 'USA' || c === 'CANADA'; }) }),
    mission({ id: 'sql-l2-13-not-country-mexico', level: 2, title: 'Use NOT', description: 'Exclude Mexico rows.', hint: "SELECT * FROM employees WHERE NOT country = 'Mexico';", points: 85, canonicalQuery: "SELECT * FROM employees WHERE NOT country = 'Mexico';", requiredSql: ['from employees', 'where', ' not ', 'country'], rowCheck: ({ rows }) => rows.every((row) => String(getRowValue(row, 'country') || '').toUpperCase() !== 'MEXICO') }),
    mission({ id: 'sql-l2-14-not-equal-bang', level: 2, title: 'Use !=', description: 'Exclude Legal department.', hint: "SELECT * FROM employees WHERE department != 'Legal';", points: 85, canonicalQuery: "SELECT * FROM employees WHERE department != 'Legal';", requiredSql: ['from employees', 'where', 'department', '!='], rowCheck: ({ rows }) => rows.every((row) => String(getRowValue(row, 'department') || '').toUpperCase() !== 'LEGAL') }),
    mission({ id: 'sql-l2-15-not-equal-angle', level: 2, title: 'Use <>', description: 'Exclude Intern title.', hint: "SELECT * FROM employees WHERE title <> 'Intern';", points: 85, canonicalQuery: "SELECT * FROM employees WHERE title <> 'Intern';", requiredSql: ['from employees', 'where', 'title', '<>'], rowCheck: ({ rows }) => rows.every((row) => String(getRowValue(row, 'title') || '').toUpperCase() !== 'INTERN') }),
    mission({ id: 'sql-l2-16-between-hiredate', level: 2, title: 'BETWEEN dates', description: 'Hiredate between 2002-01-01 and 2003-01-01.', hint: "SELECT * FROM employees WHERE hiredate BETWEEN '2002-01-01' AND '2003-01-01';", points: 90, canonicalQuery: "SELECT * FROM employees WHERE hiredate BETWEEN '2002-01-01' AND '2003-01-01';", requiredSql: ['from employees', 'where', 'hiredate', 'between', ' and '], rowCheck: ({ rows }) => { const min = parseDate('2002-01-01'); const max = parseDate('2003-01-01'); return rows.every((row) => { const value = parseDate(getRowValue(row, 'hiredate')); return value !== null && min !== null && max !== null && value >= min && value <= max; }); } }),
    mission({ id: 'sql-l2-17-between-salary', level: 2, title: 'BETWEEN salary', description: 'Salary between 70000 and 95000.', hint: 'SELECT * FROM employees WHERE salary BETWEEN 70000 AND 95000;', points: 90, canonicalQuery: 'SELECT * FROM employees WHERE salary BETWEEN 70000 AND 95000;', requiredSql: ['from employees', 'where', 'salary', 'between', ' and '], rowCheck: ({ rows }) => rows.every((row) => { const salary = toNumber(getRowValue(row, 'salary')); return salary !== null && salary >= 70000 && salary <= 95000; }) }),
    mission({ id: 'sql-l2-18-like-it-prefix', level: 2, title: 'LIKE IT%', description: 'Title starts with IT.', hint: "SELECT * FROM employees WHERE title LIKE 'IT%';", points: 95, canonicalQuery: "SELECT * FROM employees WHERE title LIKE 'IT%';", requiredSql: ['from employees', 'where', 'title', 'like', 'it%'], rowCheck: ({ rows }) => rows.every((row) => likeITPercent.test(String(getRowValue(row, 'title') || ''))) }),
    mission({ id: 'sql-l2-19-like-lastname-son', level: 2, title: 'LIKE %son', description: 'Lastname ends with son.', hint: "SELECT * FROM employees WHERE lastname LIKE '%son';", points: 95, canonicalQuery: "SELECT * FROM employees WHERE lastname LIKE '%son';", requiredSql: ['from employees', 'where', 'lastname', 'like', '%son'], rowCheck: ({ rows }) => rows.every((row) => likePercentSon.test(String(getRowValue(row, 'lastname') || ''))) }),
    mission({ id: 'sql-l2-20-like-state-underscore', level: 2, title: 'LIKE N_', description: 'State matches N plus one character.', hint: "SELECT * FROM employees WHERE state LIKE 'N_';", points: 100, canonicalQuery: "SELECT * FROM employees WHERE state LIKE 'N_';", requiredSql: ['from employees', 'where', 'state', 'like', 'n_'], rowCheck: ({ rows }) => rows.every((row) => likeNUnderscore.test(String(getRowValue(row, 'state') || ''))) }),
    // Level 3
    mission({ id: 'sql-l3-21-orderby-country-state', level: 3, title: 'ORDER BY two columns', description: 'Sort by country then state.', hint: 'SELECT * FROM employees ORDER BY country, state;', points: 100, canonicalQuery: 'SELECT * FROM employees ORDER BY country, state;', requiredSql: ['from employees', 'order by country', 'state'], rowCheck: ({ rows }) => isSortedByPair(rows, 'country', 'state') }),
    mission({ id: 'sql-l3-22-usa-order-firstname', level: 3, title: 'Filter + sort', description: 'USA rows ordered by firstname.', hint: "SELECT firstname, department, country FROM employees WHERE country = 'USA' ORDER BY firstname;", points: 100, canonicalQuery: "SELECT firstname, department, country FROM employees WHERE country = 'USA' ORDER BY firstname;", requiredSql: ['from employees', 'where', "country = 'usa'", 'order by firstname'], rowCheck: ({ rows, result }) => hasColumn(result, 'firstname') && rows.every((row) => String(getRowValue(row, 'country') || '').toUpperCase() === 'USA') && isSortedBy(rows, 'firstname', 'asc') }),
    mission({ id: 'sql-l3-23-parentheses-or-and', level: 3, title: 'OR + AND', description: 'USA/Canada with salary > 75000.', hint: "SELECT * FROM employees WHERE (country = 'USA' OR country = 'Canada') AND salary > 75000;", points: 105, canonicalQuery: "SELECT * FROM employees WHERE (country = 'USA' OR country = 'Canada') AND salary > 75000;", requiredSql: ['from employees', 'where', ' or ', ' and ', 'salary >'], rowCheck: ({ rows }) => rows.every((row) => { const c = String(getRowValue(row, 'country') || '').toUpperCase(); const s = toNumber(getRowValue(row, 'salary')); return (c === 'USA' || c === 'CANADA') && s !== null && s > 75000; }) }),
    mission({ id: 'sql-l3-24-it-hiredate-gte', level: 3, title: 'IT hires >= date', description: 'IT employees hired after/at 2002-01-01.', hint: "SELECT * FROM employees WHERE department = 'IT' AND hiredate >= '2002-01-01';", points: 105, canonicalQuery: "SELECT * FROM employees WHERE department = 'IT' AND hiredate >= '2002-01-01';", requiredSql: ['from employees', 'where', 'department', ' and ', 'hiredate', '>='], rowCheck: ({ rows }) => { const min = parseDate('2002-01-01'); return rows.every((row) => { const d = String(getRowValue(row, 'department') || '').toUpperCase(); const h = parseDate(getRowValue(row, 'hiredate')); return d === 'IT' && h !== null && min !== null && h >= min; }); } }),
    mission({ id: 'sql-l3-25-birthdate-gt', level: 3, title: 'Birthdate > 1980', description: 'Born after 1980-01-01.', hint: "SELECT * FROM employees WHERE birthdate > '1980-01-01';", points: 100, canonicalQuery: "SELECT * FROM employees WHERE birthdate > '1980-01-01';", requiredSql: ['from employees', 'where', 'birthdate', '>'], rowCheck: ({ rows }) => { const min = parseDate('1980-01-01'); return rows.every((row) => { const b = parseDate(getRowValue(row, 'birthdate')); return b !== null && min !== null && b > min; }); } }),
    mission({ id: 'sql-l3-26-birthdate-lte', level: 3, title: 'Birthdate <= 1983-12-31', description: 'Born on/before 1983-12-31.', hint: "SELECT * FROM employees WHERE birthdate <= '1983-12-31';", points: 100, canonicalQuery: "SELECT * FROM employees WHERE birthdate <= '1983-12-31';", requiredSql: ['from employees', 'where', 'birthdate', '<='], rowCheck: ({ rows }) => { const max = parseDate('1983-12-31'); return rows.every((row) => { const b = parseDate(getRowValue(row, 'birthdate')); return b !== null && max !== null && b <= max; }); } }),
    mission({ id: 'sql-l3-27-region-range-manual', level: 3, title: 'Region range manual', description: 'Region between 4 and 5 with >= and <=.', hint: 'SELECT * FROM employees WHERE region >= 4 AND region <= 5;', points: 110, canonicalQuery: 'SELECT * FROM employees WHERE region >= 4 AND region <= 5;', requiredSql: ['from employees', 'where', 'region', '>=', '<=', ' and '], rowCheck: ({ rows }) => rows.every((row) => { const r = toNumber(getRowValue(row, 'region')); return r !== null && r >= 4 && r <= 5; }) }),
    mission({ id: 'sql-l3-28-like-engineer-analyst', level: 3, title: 'Title pattern OR', description: 'Title contains Engineer or Analyst.', hint: "SELECT * FROM employees WHERE title LIKE '%Engineer%' OR title LIKE '%Analyst%';", points: 110, canonicalQuery: "SELECT * FROM employees WHERE title LIKE '%Engineer%' OR title LIKE '%Analyst%';", requiredSql: ['from employees', 'where', 'title like', ' or '], rowCheck: ({ rows }) => rows.every((row) => { const t = String(getRowValue(row, 'title') || '').toLowerCase(); return t.includes('engineer') || t.includes('analyst'); }) }),
    mission({ id: 'sql-l3-29-dept-finance-hr', level: 3, title: 'Finance or HR', description: 'Department in Finance or HR.', hint: "SELECT * FROM employees WHERE department = 'Finance' OR department = 'HR';", points: 105, canonicalQuery: "SELECT * FROM employees WHERE department = 'Finance' OR department = 'HR';", requiredSql: ['from employees', 'where', 'department', ' or '], rowCheck: ({ rows }) => rows.every((row) => { const d = String(getRowValue(row, 'department') || '').toUpperCase(); return d === 'FINANCE' || d === 'HR'; }) }),
    mission({ id: 'sql-l3-30-usa-state-pattern', level: 3, title: 'USA and state LIKE N_', description: 'Country USA and state pattern N_.', hint: "SELECT * FROM employees WHERE country = 'USA' AND state LIKE 'N_';", points: 110, canonicalQuery: "SELECT * FROM employees WHERE country = 'USA' AND state LIKE 'N_';", requiredSql: ['from employees', 'where', 'country', ' and ', 'state like', 'n_'], rowCheck: ({ rows }) => rows.every((row) => { const c = String(getRowValue(row, 'country') || '').toUpperCase(); const s = String(getRowValue(row, 'state') || ''); return c === 'USA' && likeNUnderscore.test(s); }) }),
    // Level 4
    mission({ id: 'sql-l4-31-inner-join-basic', level: 4, title: 'INNER JOIN basics', description: 'Join employees and machines by device_id.', hint: 'SELECT e.firstname, e.device_id, m.hostname FROM employees e INNER JOIN machines m ON e.device_id = m.device_id;', points: 120, canonicalQuery: 'SELECT e.firstname, e.device_id, m.hostname FROM employees e INNER JOIN machines m ON e.device_id = m.device_id;', requiredSql: ['from employees', 'inner join machines', ' on ', 'device_id'], rowCheck: ({ rows, result }) => hasColumn(result, 'hostname') && rows.every((row) => getRowValue(row, 'hostname') != null) }),
    mission({ id: 'sql-l4-32-left-join-basic', level: 4, title: 'LEFT JOIN basics', description: 'Keep all employees and matching machine rows.', hint: 'SELECT e.employee_id, e.firstname, m.hostname FROM employees e LEFT JOIN machines m ON e.device_id = m.device_id;', points: 120, canonicalQuery: 'SELECT e.employee_id, e.firstname, m.hostname FROM employees e LEFT JOIN machines m ON e.device_id = m.device_id;', requiredSql: ['from employees', 'left join machines', ' on ', 'device_id'], rowCheck: ({ rows }) => rows.length >= 12 }),
    mission({ id: 'sql-l4-33-inner-join-ubuntu', level: 4, title: 'JOIN + OS filter', description: 'Return joined rows where OS is Ubuntu 22.04.', hint: "SELECT e.firstname, m.hostname, m.os FROM employees e INNER JOIN machines m ON e.device_id = m.device_id WHERE m.os = 'Ubuntu 22.04';", points: 125, canonicalQuery: "SELECT e.firstname, m.hostname, m.os FROM employees e INNER JOIN machines m ON e.device_id = m.device_id WHERE m.os = 'Ubuntu 22.04';", requiredSql: ['from employees', 'inner join machines', 'where', 'ubuntu 22.04'], rowCheck: ({ rows }) => rows.every((row) => String(getRowValue(row, 'os') || '') === 'Ubuntu 22.04') }),
    mission({ id: 'sql-l4-34-inner-join-order-hostname', level: 4, title: 'Sort joined rows', description: 'Sort INNER JOIN rows by hostname.', hint: 'SELECT e.firstname, m.hostname FROM employees e INNER JOIN machines m ON e.device_id = m.device_id ORDER BY m.hostname ASC;', points: 125, canonicalQuery: 'SELECT e.firstname, m.hostname FROM employees e INNER JOIN machines m ON e.device_id = m.device_id ORDER BY m.hostname ASC;', requiredSql: ['from employees', 'inner join machines', 'order by', 'hostname'], rowCheck: ({ rows }) => isSortedBy(rows, 'hostname', 'asc') }),
    mission({ id: 'sql-l4-35-left-join-unassigned', level: 4, title: 'Unmatched rows with IS NULL', description: 'Find employees without matching hostname.', hint: 'SELECT e.employee_id, e.firstname, m.hostname FROM employees e LEFT JOIN machines m ON e.device_id = m.device_id WHERE m.hostname IS NULL;', points: 130, canonicalQuery: 'SELECT e.employee_id, e.firstname, m.hostname FROM employees e LEFT JOIN machines m ON e.device_id = m.device_id WHERE m.hostname IS NULL;', requiredSql: ['from employees', 'left join machines', 'where', 'hostname is null'], rowCheck: ({ rows }) => rows.length > 0 && rows.every((row) => getRowValue(row, 'hostname') == null) }),
    mission({ id: 'sql-l4-36-inner-join-cost-gt', level: 4, title: 'Filter by machine cost', description: 'Joined rows where purchase_cost > 2000.', hint: 'SELECT e.firstname, m.hostname, m.purchase_cost FROM employees e INNER JOIN machines m ON e.device_id = m.device_id WHERE m.purchase_cost > 2000;', points: 130, canonicalQuery: 'SELECT e.firstname, m.hostname, m.purchase_cost FROM employees e INNER JOIN machines m ON e.device_id = m.device_id WHERE m.purchase_cost > 2000;', requiredSql: ['from employees', 'inner join machines', 'purchase_cost', '>'], rowCheck: ({ rows }) => rows.every((row) => (toNumber(getRowValue(row, 'purchase_cost')) ?? -Infinity) > 2000) }),
    mission({ id: 'sql-l4-37-join-usa-only', level: 4, title: 'JOIN + USA filter', description: 'Joined rows only for USA employees.', hint: "SELECT e.firstname, e.country, m.hostname FROM employees e INNER JOIN machines m ON e.device_id = m.device_id WHERE e.country = 'USA';", points: 130, canonicalQuery: "SELECT e.firstname, e.country, m.hostname FROM employees e INNER JOIN machines m ON e.device_id = m.device_id WHERE e.country = 'USA';", requiredSql: ['from employees', 'inner join machines', 'where', "country = 'usa'"], rowCheck: ({ rows }) => rows.every((row) => String(getRowValue(row, 'country') || '').toUpperCase() === 'USA') }),
    mission({ id: 'sql-l4-38-left-join-it', level: 4, title: 'LEFT JOIN IT rows', description: 'IT employees with hostname if available.', hint: "SELECT e.firstname, e.department, m.hostname FROM employees e LEFT JOIN machines m ON e.device_id = m.device_id WHERE e.department = 'IT';", points: 130, canonicalQuery: "SELECT e.firstname, e.department, m.hostname FROM employees e LEFT JOIN machines m ON e.device_id = m.device_id WHERE e.department = 'IT';", requiredSql: ['from employees', 'left join machines', 'where', "department = 'it'"], rowCheck: ({ rows }) => rows.length > 0 && rows.every((row) => String(getRowValue(row, 'department') || '').toUpperCase() === 'IT') }),
    mission({ id: 'sql-l4-39-join-select-os', level: 4, title: 'Select columns from both tables', description: 'Return firstname, lastname, hostname, and os.', hint: 'SELECT e.firstname, e.lastname, m.hostname, m.os FROM employees e INNER JOIN machines m ON e.device_id = m.device_id;', points: 135, canonicalQuery: 'SELECT e.firstname, e.lastname, m.hostname, m.os FROM employees e INNER JOIN machines m ON e.device_id = m.device_id;', requiredSql: ['from employees', 'inner join machines', 'firstname', 'lastname', 'hostname', 'os'], rowCheck: ({ result }) => hasColumn(result, 'firstname') && hasColumn(result, 'lastname') && hasColumn(result, 'hostname') && hasColumn(result, 'os') }),
    mission({ id: 'sql-l4-40-join-between-purchase-date', level: 4, title: 'JOIN + purchase date range', description: 'Joined rows with purchase_date in range.', hint: "SELECT e.firstname, m.hostname, m.purchase_date FROM employees e INNER JOIN machines m ON e.device_id = m.device_id WHERE m.purchase_date BETWEEN '2021-01-01' AND '2022-12-31';", points: 135, canonicalQuery: "SELECT e.firstname, m.hostname, m.purchase_date FROM employees e INNER JOIN machines m ON e.device_id = m.device_id WHERE m.purchase_date BETWEEN '2021-01-01' AND '2022-12-31';", requiredSql: ['from employees', 'inner join machines', 'purchase_date', 'between', ' and '], rowCheck: ({ rows }) => { const min = parseDate('2021-01-01'); const max = parseDate('2022-12-31'); return rows.every((row) => { const p = parseDate(getRowValue(row, 'purchase_date')); return p !== null && min !== null && max !== null && p >= min && p <= max; }); } }),
    // Level 5
    mission({ id: 'sql-l5-41-count-firstname', level: 5, title: 'COUNT firstnames', description: 'Return COUNT(firstname) from employees.', hint: 'SELECT COUNT(firstname) FROM employees;', points: 140, canonicalQuery: 'SELECT COUNT(firstname) FROM employees;', requiredSql: ['select', 'count(', 'from employees'], rowCheck: ({ rows }) => rows.length === 1 && numericValuesFromRow(rows[0])[0] > 0 }),
    mission({ id: 'sql-l5-42-avg-height', level: 5, title: 'AVG height', description: 'Return AVG(height) from employees.', hint: 'SELECT AVG(height) FROM employees;', points: 140, canonicalQuery: 'SELECT AVG(height) FROM employees;', requiredSql: ['select', 'avg(', 'from employees'], rowCheck: ({ rows }) => { if (rows.length !== 1) return false; const v = numericValuesFromRow(rows[0])[0]; return v > 150 && v < 200; } }),
    mission({ id: 'sql-l5-43-sum-salary', level: 5, title: 'SUM salary', description: 'Return SUM(salary) from employees.', hint: 'SELECT SUM(salary) FROM employees;', points: 140, canonicalQuery: 'SELECT SUM(salary) FROM employees;', requiredSql: ['select', 'sum(', 'from employees'], rowCheck: ({ rows }) => rows.length === 1 && numericValuesFromRow(rows[0])[0] > 0 }),
    mission({ id: 'sql-l5-44-count-usa', level: 5, title: 'COUNT USA employees', description: 'Count rows where country is USA.', hint: "SELECT COUNT(*) FROM employees WHERE country = 'USA';", points: 145, canonicalQuery: "SELECT COUNT(*) FROM employees WHERE country = 'USA';", requiredSql: ['select', 'count(', 'from employees', 'where', "country = 'usa'"], rowCheck: ({ rows }) => rows.length === 1 && numericValuesFromRow(rows[0])[0] > 0 }),
    mission({ id: 'sql-l5-45-avg-salary-it', level: 5, title: 'AVG salary in IT', description: 'Average salary for IT department.', hint: "SELECT AVG(salary) FROM employees WHERE department = 'IT';", points: 145, canonicalQuery: "SELECT AVG(salary) FROM employees WHERE department = 'IT';", requiredSql: ['select', 'avg(', 'from employees', 'where', "department = 'it'"], rowCheck: ({ rows }) => rows.length === 1 && numericValuesFromRow(rows[0])[0] > 0 }),
    mission({ id: 'sql-l5-46-sum-machine-cost', level: 5, title: 'SUM machine cost', description: 'Total purchase_cost from machines.', hint: 'SELECT SUM(purchase_cost) FROM machines;', points: 145, canonicalQuery: 'SELECT SUM(purchase_cost) FROM machines;', requiredSql: ['select', 'sum(', 'from machines'], rowCheck: ({ rows }) => rows.length === 1 && numericValuesFromRow(rows[0])[0] > 0 }),
    mission({ id: 'sql-l5-47-count-join-hostnames', level: 5, title: 'COUNT hostnames in JOIN', description: 'Count hostnames in INNER JOIN results.', hint: 'SELECT COUNT(m.hostname) FROM employees e INNER JOIN machines m ON e.device_id = m.device_id;', points: 150, canonicalQuery: 'SELECT COUNT(m.hostname) FROM employees e INNER JOIN machines m ON e.device_id = m.device_id;', requiredSql: ['select', 'count(', 'from employees', 'inner join machines'], rowCheck: ({ rows }) => rows.length === 1 && numericValuesFromRow(rows[0])[0] > 0 }),
    mission({ id: 'sql-l5-48-count-unassigned-left-join', level: 5, title: 'COUNT unassigned employees', description: 'Count employees without matching hostname.', hint: 'SELECT COUNT(e.employee_id) FROM employees e LEFT JOIN machines m ON e.device_id = m.device_id WHERE m.hostname IS NULL;', points: 150, canonicalQuery: 'SELECT COUNT(e.employee_id) FROM employees e LEFT JOIN machines m ON e.device_id = m.device_id WHERE m.hostname IS NULL;', requiredSql: ['select', 'count(', 'from employees', 'left join machines', 'hostname is null'], rowCheck: ({ rows }) => rows.length === 1 && numericValuesFromRow(rows[0])[0] > 0 }),
    mission({ id: 'sql-l5-49-sum-usa-canada', level: 5, title: 'SUM salaries USA/Canada', description: 'Total salary for USA or Canada.', hint: "SELECT SUM(salary) FROM employees WHERE country = 'USA' OR country = 'Canada';", points: 150, canonicalQuery: "SELECT SUM(salary) FROM employees WHERE country = 'USA' OR country = 'Canada';", requiredSql: ['select', 'sum(', 'from employees', 'where', ' or '], rowCheck: ({ rows }) => rows.length === 1 && numericValuesFromRow(rows[0])[0] > 0 }),
    mission({ id: 'sql-l5-50-final-count-avg-sum', level: 5, title: 'Final aggregate combo', description: 'COUNT, AVG, and SUM for USA employees.', hint: "SELECT COUNT(firstname), AVG(height), SUM(salary) FROM employees WHERE country = 'USA';", points: 170, canonicalQuery: "SELECT COUNT(firstname), AVG(height), SUM(salary) FROM employees WHERE country = 'USA';", requiredSql: ['select', 'count(', 'avg(', 'sum(', 'from employees', 'where', "country = 'usa'"], rowCheck: ({ rows }) => { if (rows.length !== 1) return false; const values = numericValuesFromRow(rows[0]); return values.length >= 3 && values[0] > 0 && values[1] > 0 && values[2] > 0; } }),
];
