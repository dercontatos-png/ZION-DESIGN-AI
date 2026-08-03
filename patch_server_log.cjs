const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const oldCode = `  // 1. Custom Developer or JSON Key provided in UI
  if (customApiKey?.trim()) {
    let rawKey = customApiKey.trim();
    if ((rawKey.startsWith('"') && rawKey.endsWith('"')) || (rawKey.startsWith("'") && rawKey.endsWith("'"))) {
      rawKey = rawKey.slice(1, -1).trim();
    }
    if (rawKey.startsWith("{") && rawKey.includes("private_key")) {
      try {
        const parsed = JSON.parse(rawKey);`;

const newCode = `  // 1. Custom Developer or JSON Key provided in UI
  if (customApiKey?.trim()) {
    let rawKey = customApiKey.trim();
    if ((rawKey.startsWith('"') && rawKey.endsWith('"')) || (rawKey.startsWith("'") && rawKey.endsWith("'"))) {
      rawKey = rawKey.slice(1, -1).trim();
    }
    console.log("[getCandidateClients] rawKey received:", rawKey.substring(0, 50) + "...");
    if (rawKey.startsWith("{") && rawKey.includes("private_key")) {
      try {
        const parsed = JSON.parse(rawKey);
        console.log("[getCandidateClients] Successfully parsed custom JSON key for project:", parsed.project_id);`;

code = code.replace(oldCode, newCode);
fs.writeFileSync('server.ts', code);
