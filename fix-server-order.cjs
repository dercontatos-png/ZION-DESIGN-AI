const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const bingCode = `
  // Global Image Search (Proxy via Bing)
  app.get("/api/search/images", async (req, res) => {
    try {
      const query = req.query.q || "";
      if (!query) return res.status(400).json({ error: "No query provided" });
      
      const bingUrl = \`https://www.bing.com/images/search?q=\${encodeURIComponent(query)}\`;
      const response = await fetch(bingUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36'
        }
      });
      
      const html = await response.text();
      const urls = [...html.matchAll(/murl&quot;:&quot;(http[^&]+)&quot;/g)].map(m => m[1]);
      
      res.json({ items: urls.slice(0, 30) });
    } catch (err: any) {
      console.error("Image search error:", err);
      res.status(500).json({ error: err.message });
    }
  });
`;

// Remove it from the bottom
code = code.replace(/const server =\s*\/\/ Global Image Search[^]+?\}\s*\);/g, 'const server = app.listen(PORT');
code = code.replace(/app\.listen\(PORT, "0\.0\.0\.0", \(\) => \{/, 'const server = app.listen(PORT, "0.0.0.0", () => {');

// Put it before Pinterest OAuth
code = code.replace('// Pinterest OAuth Integration', bingCode + '\n  // Pinterest OAuth Integration');

fs.writeFileSync('server.ts', code);
console.log("Fixed!");
