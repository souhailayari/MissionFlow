# MissionFlow — interface web

Interface Next.js de gestion des ordres de mission. L’application nécessite l’API MissionFlow démarrée séparément.

## Démarrage

```bash
npm install
npm run dev
```

Ouvrez [http://localhost:3000](http://localhost:3000). Par défaut, le frontend utilise l’API à `http://localhost:3001/api`.

Pour utiliser une autre adresse d’API, définissez `NEXT_PUBLIC_API_URL` dans un fichier `.env.local`. En production, cette URL doit être une adresse HTTPS publique du backend. Exemple local :

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

## Accès depuis le réseau local (Wi-Fi ou Ethernet)

Le serveur Next.js écoute sur toutes les interfaces avec `npm run dev:lan` ou `npm run start:lan`. Depuis un téléphone ou un autre poste connecté au même réseau, ouvrez `http://<IPv4-du-PC>:3000`. Le client utilise automatiquement le même nom/IP sur le port `3001` pour joindre l’API; par exemple, si `ipconfig` indique `192.168.2.29`, l’interface est `http://192.168.2.29:3000` et l’API est `http://192.168.2.29:3001/api`.

Le PC et les appareils doivent pouvoir communiquer sur le même réseau local. Si Windows Firewall bloque l’accès entrant, autorisez les ports TCP `3000` et `3001` uniquement sur le profil réseau de confiance et depuis le sous-réseau local. Les réglages réseau changent selon le Wi-Fi ou le câble connecté; relancez les serveurs après un changement d’interface si nécessaire.

Sur Windows, si ce réseau est bien un réseau d’entreprise de confiance, réglez son profil sur **Privé**, puis ouvrez PowerShell en administrateur et exécutez :

```powershell
New-NetFirewallRule -DisplayName "MissionFlow LAN" -Direction Inbound -Action Allow -Protocol TCP -LocalPort 3000,3001 -Profile Private -RemoteAddress LocalSubnet
```

## Vérification et production

```bash
npm run typecheck
npm run lint
npm run build
```

## Installation sur mobile

MissionFlow peut être installée comme application depuis son site de production HTTPS. Sur Android, ouvrez le site dans Chrome puis choisissez **Installer l'application**. Sur iPhone, ouvrez-le dans Safari, touchez **Partager**, puis **Sur l'écran d'accueil**. L'application utilise la connexion Internet et le même compte que l'interface web.
