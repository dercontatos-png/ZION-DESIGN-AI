const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(/const logFile = fs\.createWriteStream\(path\.join\(process\.cwd\(\), "app\.log"\), \{ flags: "a" \}\);/, `
let logFile;
try {
  logFile = fs.createWriteStream(path.join(process.cwd(), "app.log"), { flags: "a" });
} catch(e) {
  try {
    logFile = fs.createWriteStream(path.join(require('os').tmpdir(), "app.log"), { flags: "a" });
  } catch(e2) {}
}
`);
code = code.replace(/logFile\.write/g, 'logFile && logFile.write');

fs.writeFileSync('server.ts', code);
