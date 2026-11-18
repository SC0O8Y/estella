// SPDX-License-Identifier: Apache-2.0
// Native Estella Proteomics Journey: structural checks and exported browser smoke test.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '../..');
const PROJECT = path.join(ROOT, 'examples/proteomics-journey');
const args = process.argv.slice(2);
const checkSource = args.includes('--check-source');
const exportAt = args.indexOf('--check-export');
if (!checkSource && exportAt < 0) {
  console.error('usage: node tools/tests/proteomics-journey-export.mjs --check-source | --check-export <export-directory>');
  process.exit(2);
}
const read = (name) => fs.readFileSync(path.join(PROJECT, name), 'utf8');

if (checkSource) {
  const project = JSON.parse(read('project.esproject'));
  const scene = JSON.parse(read('assets/scenes/main.esscene'));
  const source = read('src/stages.ts');
  const director = read('src/main.ts');
  assert.equal(project.defaultScene, 'assets/scenes/main.esscene');
  assert.equal(project.scripts.main, 'src/main.ts');
  assert.equal(scene.version, 4);
  assert(scene.entities.length >= 130, 'scene must include animation entity pool');
  const ids = new Set(scene.entities.map(e => e.id));
  const names = new Set(scene.entities.map(e => e.name));
  assert.equal(ids.size, scene.entities.length, 'duplicate scene entity id');
  for (const entity of scene.entities) {
    if (entity.parent !== null) assert(ids.has(entity.parent), 'orphan: ' + entity.name);
    for (const child of entity.children ?? []) assert(ids.has(child), 'missing child: ' + child);
  }
  for (const key of ['Camera', 'Canvas', 'Stage Title', 'Prev', 'Next', 'Mode',
      'Action', 'Auto', 'Progress Fill', 'Chapter 0', 'Chapter 3', 'Part 000', 'Part 091']) {
    assert(names.has(key), 'scene missing: ' + key);
  }
  const stages = source.match(/chapter: [0-3], title:/g) ?? [];
  const visuals = source.match(/visual: '/g) ?? [];
  assert.equal(stages.length, 21, '21 stage descriptions required');
  assert.equal(visuals.length, 21, 'each stage needs a native visual');
  assert.match(director, /addPlugin\(/, 'requires Estella ECS plugin');
  assert.match(director, /defineSystem\(/, 'requires Estella ECS driver');
  assert.match(director, /Res\(UIEvents\)/, 'interactive UI events required');
  console.log(JSON.stringify({ pass: true, stageCount: stages.length,
    sceneEntities: scene.entities.length, project: project.name }));
  process.exit(0);
}

const exportDir = path.resolve(args[exportAt + 1] ?? '');
assert(fs.existsSync(path.join(exportDir, 'index.html')), 'no exported web index.html');
const output = path.join(ROOT, 'output');
fs.mkdirSync(output, { recursive: true });

function launch(testName, spec, expectedTitle) {
  const image = path.join(output, 'proteomics-' + testName + '.png');
  const log = path.join(output, 'proteomics-' + testName + '.log');
  const call = [
    'tools/run-electron.mjs', 'tools/launchers/launch-export.mjs',
    '--dir', exportDir, '--w', '1280', '--h', '720', '--settle', '35',
    '--timeout', '150000', '--out', image,
    '--probe', 'Stage Title,Mode,Progress Fill',
    '--facts', '--render-facts',
  ];
  if (spec) call.push('--input', JSON.stringify(spec));
  const result = spawnSync(process.execPath, call, {
    cwd: ROOT, encoding: 'utf8', timeout: 200000,
    env: { ...process.env, ELECTRON_DISABLE_SANDBOX: '1' },
    maxBuffer: 8 * 1024 * 1024,
  });
  const logText = (result.stdout ?? '') + '\n' + (result.stderr ?? '');
  fs.writeFileSync(log, logText);
  if (result.error) throw result.error;
  assert.equal(result.status, 0, testName + ' launched unsuccessfully; see ' + log + '\n' + logText.slice(-2300));
  assert.match(logText, /painted=true live=true/, 'output did not render a nonflat frame');
  const probeLine = /^\s*probe: (\{[^\n]*\})/m.exec(logText);
  assert(probeLine, 'Estella scene probe missing; see ' + log);
  const probe = JSON.parse(probeLine[1]);
  const title = probe.at?.['Stage Title']?.text;
  assert.equal(title, expectedTitle, testName + ' incorrect stage label: ' + JSON.stringify(probe));
  assert(fs.statSync(image).size > 5_000, 'PNG frame unexpectedly small');
  return { testName, title, image: path.basename(image), screenshotBytes: fs.statSync(image).size };
}

const cases = [];
try {
  cases.push(launch('initial', null, 'Protein extraction'));
  cases.push(launch('next', { taps: [{ key: 'ArrowRight', at: 8 }], frames: 40 },
    'DNA shearing and clarification'));
  cases.push(launch('chapter-4', { taps: [{ key: 'Digit4', at: 8 }], frames: 40 },
    'DDA label-free quantitation'));
  cases.push(launch('animate', { taps: [{ key: 'Space', at: 8 }], frames: 42 },
    'Protein extraction'));
  const report = { pass: true, subject: 'Proteomics Journey exported Web application', cases };
  fs.writeFileSync(path.join(output, 'proteomics-validation.json'), JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
} catch (e) {
  const report = { pass: false, error: String(e), cases };
  fs.writeFileSync(path.join(output, 'proteomics-validation.json'), JSON.stringify(report, null, 2));
  console.error(e);
  process.exitCode = 1;
}
