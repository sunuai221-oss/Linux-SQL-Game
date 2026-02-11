const NOW = Date.now();
const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

export const defaultStructure = {
    type: 'dir',
    children: {
        home: {
            type: 'dir',
            children: {
                user: {
                    type: 'dir',
                    children: {
                        documents: {
                            type: 'dir',
                            children: {
                                'notes.txt': {
                                    type: 'file',
                                    content: 'Bienvenue dans Linux Game !\nCe fichier contient tes premières notes.\n\nAstuce : utilise "cat" pour lire un fichier.\nUtilise "ls" pour voir le contenu d\'un dossier.\nUtilise "cd" pour te déplacer.',
                                },
                                'todo.txt': {
                                    type: 'file',
                                    content: '1. Apprendre la commande ls\n2. Apprendre la commande cd\n3. Lire des fichiers avec cat\n4. Créer des fichiers et dossiers\n5. Maîtriser grep et find\n6. Devenir un expert Linux !',
                                },
                                projets: {
                                    type: 'dir',
                                    children: {
                                        web: {
                                            type: 'dir',
                                            children: {
                                                'index.html': {
                                                    type: 'file',
                                                    content: '<!DOCTYPE html>\n<html>\n<head>\n    <title>Mon Site</title>\n    <link rel="stylesheet" href="style.css">\n</head>\n<body>\n    <h1>Hello World</h1>\n    <p>Mon premier site web.</p>\n</body>\n</html>',
                                                },
                                                'style.css': {
                                                    type: 'file',
                                                    content: 'body {\n    font-family: Arial, sans-serif;\n    background: #f0f0f0;\n    color: #333;\n}\n\nh1 {\n    color: #0066cc;\n}',
                                                },
                                            },
                                        },
                                        python: {
                                            type: 'dir',
                                            children: {
                                                'hello.py': {
                                                    type: 'file',
                                                    content: '#!/usr/bin/env python3\n# Mon premier script Python\n\ndef greet(name):\n    return f"Bonjour {name} !"\n\nif __name__ == "__main__":\n    print(greet("Linux"))\n    print("Python est super !")',
                                                    permissions: 'rwxr-xr-x',
                                                },
                                                'calcul.py': {
                                                    type: 'file',
                                                    content: '# Calculatrice simple\n\ndef addition(a, b):\n    return a + b\n\ndef soustraction(a, b):\n    return a - b\n\nresultat = addition(42, 58)\nprint(f"42 + 58 = {resultat}")',
                                                    permissions: 'rwxr-xr-x',
                                                },
                                            },
                                        },
                                    },
                                },
                                'rapport.txt': {
                                    type: 'file',
                                    content: 'Rapport de mission\n==================\nDate: 2024-01-15\nStatut: En cours\n\nObjectif: Maîtriser les commandes Linux.\n\nProgression:\n- Navigation : en cours\n- Fichiers : à faire\n- Recherche : à faire\n- Permissions : à faire',
                                },
                                'bonuses.txt': {
                                    type: 'file',
                                    content: 'Bonus RH - Confidentiel\nAlice: 1200\nBob: 900\nCharlie: 600',
                                    permissions: 'rw-rw----',
                                    owner: 'user',
                                    group: 'hr',
                                },
                            },
                        },
                        images: {
                            type: 'dir',
                            children: {
                                'photo1.jpg': {
                                    type: 'file',
                                    content: '[Image binaire: photo de vacances - 2.4 MB]',
                                },
                                'photo2.png': {
                                    type: 'file',
                                    content: '[Image binaire: capture d\'écran - 856 KB]',
                                },
                                'logo.svg': {
                                    type: 'file',
                                    content: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">\n  <circle cx="50" cy="50" r="40" fill="#333"/>\n</svg>',
                                },
                            },
                        },
                        musique: {
                            type: 'dir',
                            children: {},
                        },
                        telechargements: {
                            type: 'dir',
                            children: {
                                'archive.zip': {
                                    type: 'file',
                                    content: '[Archive ZIP - 15.3 MB]',
                                    mtime: NOW - (10 * DAY),
                                },
                                'readme.md': {
                                    type: 'file',
                                    content: '# Fichier Readme\n\nCeci est un fichier de documentation.\n\n## Installation\n\n1. Telecharger le fichier\n2. Extraire l\'archive\n3. Lancer le programme\n\n## Auteur\n\nCree par l\'utilisateur Linux Game.',
                                    mtime: NOW - (2 * DAY),
                                },
                                'config.json': {
                                    type: 'file',
                                    content: '{\n    "name": "linux-game",\n    "version": "1.0.0",\n    "debug": false,\n    "language": "fr"\n}',
                                    mtime: NOW - (3 * HOUR),
                                },
                            },
                        },
                        '.bashrc': {
                            type: 'file',
                            content: '# ~/.bashrc\n# Configuration du shell Bash\n\n# Alias utiles\nalias ll="ls -la"\nalias la="ls -a"\nalias ..="cd .."\n\n# Variable PATH\nexport PATH=$HOME/bin:$PATH\n\n# Message de bienvenue\necho "Bienvenue sur Linux Game !"',
                        },
                        '.profile': {
                            type: 'file',
                            content: '# ~/.profile\n# Exécuté à la connexion\n\nif [ -f "$HOME/.bashrc" ]; then\n    . "$HOME/.bashrc"\nfi',
                        },
                        '.secret_note': {
                            type: 'file',
                            content: 'Bravo ! Tu as trouvé un fichier caché !\nLes fichiers qui commencent par un point (.) sont cachés sous Linux.\nUtilise "ls -a" pour les voir.',
                        },
                    },
                },
            },
        },
        etc: {
            type: 'dir',
            permissions: 'rwxr-xr-x',
            owner: 'root',
            children: {
                hostname: {
                    type: 'file',
                    content: 'linux-game',
                    owner: 'root',
                },
                passwd: {
                    type: 'file',
                    content: 'root:x:0:0:root:/root:/bin/bash\nuser:x:1000:1000:User:/home/user:/bin/bash\nnobody:x:65534:65534:Nobody:/nonexistent:/usr/sbin/nologin',
                    owner: 'root',
                    permissions: 'rw-r--r--',
                },
                'os-release': {
                    type: 'file',
                    content: 'NAME="Linux Game OS"\nVERSION="1.0"\nID=linuxgame\nPRETTY_NAME="Linux Game OS 1.0"',
                    owner: 'root',
                },
                hosts: {
                    type: 'file',
                    content: '127.0.0.1\tlocalhost\n127.0.1.1\tlinux-game\n::1\t\tlocalhost',
                    owner: 'root',
                },
            },
        },
        var: {
            type: 'dir',
            owner: 'root',
            children: {
                log: {
                    type: 'dir',
                    owner: 'root',
                    children: {
                        'system.log': {
                            type: 'file',
                            content: '[2024-01-15 08:00:01] System started\n[2024-01-15 08:00:02] Network interface up\n[2024-01-15 08:00:03] SSH service started\n[2024-01-15 08:15:00] User login: user\n[2024-01-15 09:30:45] Warning: disk usage at 75%\n[2024-01-15 10:00:00] Cron job executed\n[2024-01-15 11:22:33] Error: connection timeout to remote server\n[2024-01-15 12:00:00] Backup completed successfully\n[2024-01-15 14:05:12] Warning: high memory usage detected\n[2024-01-15 15:30:00] Package update available',
                            owner: 'root',
                            mtime: NOW - (90 * MINUTE),
                        },
                        'auth.log': {
                            type: 'file',
                            content: '[2024-01-15 08:15:00] Accepted password for user\n[2024-01-15 08:15:01] Session opened for user\n[2024-01-15 09:00:00] Failed password for admin\n[2024-01-15 09:00:05] Failed password for admin\n[2024-01-15 09:00:10] Failed password for admin',
                            owner: 'root',
                            mtime: NOW - (2 * DAY),
                        },
                    },
                },
            },
        },
        tmp: {
            type: 'dir',
            permissions: 'rwxrwxrwx',
            children: {
                'temp_data.txt': {
                    type: 'file',
                    content: 'Donnees temporaires...\nCe fichier peut etre supprime.',
                    mtime: NOW - (30 * MINUTE),
                },
                'cache_old.tmp': {
                    type: 'file',
                    content: 'Vieux cache a nettoyer.',
                    mtime: NOW - (15 * DAY),
                },
                'session_123.tmp': {
                    type: 'file',
                    content: 'Session active: user\nExpire: 2024-02-15',
                    mtime: NOW - (5 * MINUTE),
                },
            },
        },
        usr: {
            type: 'dir',
            owner: 'root',
            children: {
                bin: {
                    type: 'dir',
                    owner: 'root',
                    children: {},
                },
                share: {
                    type: 'dir',
                    owner: 'root',
                    children: {
                        doc: {
                            type: 'dir',
                            owner: 'root',
                            children: {},
                        },
                    },
                },
            },
        },
    },
};
