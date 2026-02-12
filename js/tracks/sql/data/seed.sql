INSERT INTO machines (device_id, hostname, os, purchase_cost, purchase_date) VALUES
(100, 'it-laptop-01', 'Windows 11', 1600.00, '2021-04-12'),
(101, 'it-laptop-02', 'Ubuntu 22.04', 1450.00, '2021-06-20'),
(102, 'hr-notebook-01', 'Windows 10', 1100.00, '2020-11-02'),
(103, 'fin-workstation-01', 'Windows 11', 2200.00, '2022-01-16'),
(104, 'sec-ops-01', 'Kali Linux', 2100.00, '2023-02-11'),
(105, 'mk-ultrabook-01', 'macOS', 2400.00, '2022-08-30'),
(106, 'eng-build-01', 'Ubuntu 22.04', 2600.00, '2023-03-04');

INSERT INTO employees (employee_id, firstname, lastname, department, country, region, hiredate, birthdate, title, state, device_id, height, salary) VALUES
(1, 'Alice', 'Nguyen', 'IT', 'USA', 5, '2002-01-15', '1980-05-15', 'IT Staff', 'NY', 100, 165.1, 82000),
(2, 'Bob', 'Martin', 'IT', 'USA', 5, '2002-09-10', '1978-07-20', 'IT Analyst', 'NJ', 101, 178.4, 90000),
(3, 'Chloe', 'Bernard', 'HR', 'Canada', 3, '2001-07-22', '1985-02-11', 'HR Specialist', 'QC', 102, 170.0, 68000),
(4, 'Daniel', 'Ortiz', 'Finance', 'Mexico', 4, '2003-01-01', '1975-09-09', 'Accountant', 'CM', 103, 175.5, 74000),
(5, 'Emma', 'Rossi', 'Legal', 'USA', 5, '2004-03-18', '1982-12-01', 'Counsel', 'CA', NULL, 168.2, 98000),
(6, 'Farid', 'Khan', 'Security', 'USA', 5, '2002-05-05', '1979-04-03', 'Security Engineer', 'NC', 104, 180.7, 105000),
(7, 'Grace', 'Lee', 'Marketing', 'Canada', 3, '2002-12-12', '1988-08-14', 'Marketing Lead', 'ON', 105, 162.3, 79000),
(8, 'Hugo', 'Silva', 'IT', 'Brazil', 2, '2005-07-30', '1990-03-27', 'IT Support', 'SP', NULL, 172.4, 61000),
(9, 'Ivy', 'Johnson', 'IT', 'USA', 5, '2003-06-20', '1987-01-22', 'Intern', 'NV', 106, 166.8, 45000),
(10, 'Jamal', 'Brown', 'Operations', 'USA', 5, '2002-11-04', '1981-11-11', 'Ops Coordinator', 'NM', NULL, 182.1, 73000),
(11, 'Klara', 'Meyer', 'IT', 'Germany', 1, '2001-01-13', '1976-06-30', 'IT Architect', 'BE', 999, 169.9, 112000),
(12, 'Leo', 'Dupont', 'Finance', 'Canada', 3, '2002-03-08', '1983-10-19', 'Financial Analyst', 'NS', 103, 177.2, 86000);
