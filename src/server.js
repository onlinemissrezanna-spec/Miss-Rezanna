// Proxy entry point for Railway / deployment platforms expecting /app/src/server.js
const path = require('path');
const fs = require('fs');

const backendServer = path.resolve(__dirname, '../backend/src/server.js');
const localServer = path.resolve(__dirname, './backend/src/server.js');

if (fs.existsSync(localServer)) {
    require(localServer);
} else if (fs.existsSync(backendServer)) {
    require(backendServer);
} else {
    require('./backend/src/server.js');
}
