const fs = require('fs');
const html = fs.readFileSync('public/Home.html', 'utf8');

// search for dialog or account drawer
const dialogs = html.match(/role="dialog"[\s\S]*?<\/div>/gi) || [];
console.log('Dialogs count:', dialogs.length);
dialogs.forEach((d, i) => console.log('DIALOG', i, d.substring(0, 300)));

// search for where the account drawer is
const matches = html.match(/Abrir conta[\s\S]*?<\/nav>/gi) || [];
console.log('Matches:', matches.length);

// search for notification or conta in the html
const idx = html.indexOf('notificações');
console.log('notificações index:', idx);
if (idx !== -1) {
  console.log(html.substring(idx - 100, idx + 500));
}
