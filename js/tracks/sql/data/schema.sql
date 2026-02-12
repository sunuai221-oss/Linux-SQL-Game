DROP TABLE IF EXISTS machines;
DROP TABLE IF EXISTS employees;

CREATE TABLE employees (
    employee_id INTEGER PRIMARY KEY,
    firstname TEXT NOT NULL,
    lastname TEXT NOT NULL,
    department TEXT NOT NULL,
    country TEXT NOT NULL,
    region INTEGER NOT NULL,
    hiredate TEXT NOT NULL,
    birthdate TEXT NOT NULL,
    title TEXT NOT NULL,
    state TEXT NOT NULL,
    device_id INTEGER,
    height REAL NOT NULL,
    salary REAL NOT NULL
);

CREATE TABLE machines (
    device_id INTEGER PRIMARY KEY,
    hostname TEXT NOT NULL,
    os TEXT NOT NULL,
    purchase_cost REAL NOT NULL,
    purchase_date TEXT NOT NULL
);
