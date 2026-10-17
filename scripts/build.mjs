import { readdir, readFile, stat } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

// dist contains the authored website. Validate it without rewriting the UI files.
const output = new URL('../dist/', import.meta.url);
const entry = new URL('index.html', output);

async function requireFile(url) {
  const info = await stat(url);
  if (!info.isFile() || info.size === 0) {
    throw new Error(`Missing or empty site file: ${fileURLToPath(url)}`);
  }
}

async function listFiles(directory) {
  const files = [];
  for (const item of await readdir(directory, { withFileTypes: true })) {
    const url = new URL(item.name + (item.isDirectory() ? '/' : ''), directory);
    if (item.isDirectory()) files.push(...await listFiles(url));
    else files.push(url);
  }
  return files;
}

await requireFile(entry);
const html = await readFile(entry, 'utf8');
for (const [, reference] of html.matchAll(/(?:src|href)=["'](\.\/[^"']+)["']/g)) {
  await requireFile(new URL(reference, entry));
}

const files = await listFiles(output);
for (const file of files) {
  await requireFile(file);
  if (!file.pathname.endsWith('.js')) continue;
  const result = spawnSync(process.execPath, ['--check', fileURLToPath(file)], { stdio: 'inherit' });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(`JavaScript validation failed: ${fileURLToPath(file)}`);
  const source = await readFile(file, 'utf8');
  for (const [, reference] of source.matchAll(/\bfrom\s*["'](\.\.?\/[^"']+)["']/g)) {
    await requireFile(new URL(reference, file));
  }
}

console.log(`Validated ${files.length} static files. Ready to serve dist/ (no bundling required).`);
