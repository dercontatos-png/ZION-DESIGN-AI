const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(/logFile = fs\.createWriteStream\(path\.join\(process\.cwd\(\), "app\.log"\), \{ flags: "a" \}\);/g, `logFile = fs.createWriteStream(path.join(process.cwd(), "app.log"), { flags: "a" }); logFile.on('error', () => {});`);
code = code.replace(/logFile = fs\.createWriteStream\(path\.join\(require\('os'\)\.tmpdir\(\), "app\.log"\), \{ flags: "a" \}\);/g, `logFile = fs.createWriteStream(path.join(require('os').tmpdir(), "app.log"), { flags: "a" }); logFile.on('error', () => {});`);

fs.writeFileSync('server.ts', code);
