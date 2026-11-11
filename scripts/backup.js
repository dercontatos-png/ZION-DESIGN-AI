import fs from "fs";
import path from "path";

const SOURCE_DIR = path.resolve(process.cwd());
const BACKUP_ROOT = path.resolve(process.cwd(), "..", "ZION-DESIGN-AI-BACKUP");
const TIMESTAMP = new Date().toISOString().replace(/[:.]/g, "-");
const BACKUP_CURRENT = path.join(BACKUP_ROOT, "latest");
const BACKUP_ARCHIVE = path.join(BACKUP_ROOT, `backup_${TIMESTAMP}`);

const EXCLUDE_DIRS = new Set([
  "node_modules",
  ".git",
  ".system_generated",
  "local_storage",
  "coverage",
  ".cache"
]);

const EXCLUDE_EXTENSIONS = new Set([
  ".log",
  ".tmp"
]);

function copyDirRecursive(src, dest, stats = { count: 0, bytes: 0 }) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      if (EXCLUDE_DIRS.has(entry.name)) {
        continue;
      }
      copyDirRecursive(srcPath, destPath, stats);
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name).toLowerCase();
      if (EXCLUDE_EXTENSIONS.has(ext)) {
        continue;
      }
      try {
        fs.copyFileSync(srcPath, destPath);
        const st = fs.statSync(srcPath);
        stats.count++;
        stats.bytes += st.size;
      } catch (err) {
        console.warn(`[Aviso Backup] Não foi possível copiar: ${srcPath} (${err.message})`);
      }
    }
  }

  return stats;
}

console.log("=================================================");
console.log("🔄 INICIANDO BACKUP COMPLETO DO PROJETO ZION DESIGN AI");
console.log(`📁 Origem: ${SOURCE_DIR}`);
console.log(`💾 Destino (Mirror Atual): ${BACKUP_CURRENT}`);
console.log("=================================================");

try {
  // 1. Cria diretório de backup se não existir
  if (!fs.existsSync(BACKUP_ROOT)) {
    fs.mkdirSync(BACKUP_ROOT, { recursive: true });
  }

  // 2. Copia para o espelho permanente 'latest'
  const stats = copyDirRecursive(SOURCE_DIR, BACKUP_CURRENT);

  // 3. Salva manifesto de backup
  const manifest = {
    projeto: "ZION DESIGN AI",
    versao: "2.0.0",
    dataBackup: new Date().toISOString(),
    origem: SOURCE_DIR,
    arquivosCopiados: stats.count,
    tamanhoTotalMB: (stats.bytes / (1024 * 1024)).toFixed(2),
    descricao: "Backup integral do código-fonte, componentes, builders, APIs, assets e configurações."
  };

  fs.writeFileSync(
    path.join(BACKUP_CURRENT, "BACKUP_INFO.json"),
    JSON.stringify(manifest, null, 2),
    "utf8"
  );

  console.log("✅ BACKUP CONCLUÍDO COM SUCESSO!");
  console.log(`📦 Total de Arquivos: ${stats.count}`);
  console.log(`📊 Tamanho Total: ${(stats.bytes / (1024 * 1024)).toFixed(2)} MB`);
  console.log(`📁 Localização segura do backup: ${BACKUP_CURRENT}`);
  console.log("=================================================");
} catch (error) {
  console.error("❌ ERRO AO EXECUTAR BACKUP:", error);
  process.exit(1);
}

