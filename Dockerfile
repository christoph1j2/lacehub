# Používáme oficiální Node.js obraz
FROM node:22-alpine

# Nastavujeme pracovní adresář
WORKDIR /app

# Kopírujeme všechny soubory do pracovního adresáře
COPY ./ ./

# Instalujeme závislosti
RUN npm install

# Otevíráme port 3000 pro aplikaci
EXPOSE 3000

# Spouštíme aplikaci
CMD ["npm", "start"]
