import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const htmlFiles = fs.readdirSync(root).filter((file) => file.endsWith('.html'));
const missing = [];
const attributePattern = /(?:href|src)=["']([^"'#?]+)(?:#[^"']*)?["']/g;

for (const file of htmlFiles) {
  const content = fs.readFileSync(path.join(root, file), 'utf8');

  for (const match of content.matchAll(attributePattern)) {
    const target = match[1];
    if (/^(?:https?:|mailto:|tel:|javascript:|data:|\/)/i.test(target)) continue;

    const targetPath = path.resolve(root, path.dirname(file), target);
    if (!fs.existsSync(targetPath)) missing.push(`${file} -> ${target}`);
  }
}

if (missing.length) {
  console.error('Missing local targets:');
  console.error(missing.join('\n'));
  process.exitCode = 1;
} else {
  console.log(`Checked ${htmlFiles.length} HTML files: no missing local targets.`);
}
