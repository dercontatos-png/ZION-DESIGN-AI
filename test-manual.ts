import fs from "fs";
const logFile = fs.createWriteStream('app.log', { flags: 'a' });
const originalConsoleError = console.error;
console.error = function (...args) {
  logFile.write(new Date().toISOString() + ' ERROR: ' + args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ') + '\n');
  originalConsoleError.apply(console, args);
}
const originalConsoleLog = console.log;
console.log = function (...args) {
  logFile.write(new Date().toISOString() + ' LOG: ' + args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ') + '\n');
  originalConsoleLog.apply(console, args);
}
// wait, I can just inject this into server.ts!
