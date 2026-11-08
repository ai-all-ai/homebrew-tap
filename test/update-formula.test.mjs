import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {decideVersion} from '../scripts/update-formula.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const workflowPath=path.join(root,'.github','workflows','update-formula.yml');

test('unchanged published npm 0.2.0 cannot request a PR',()=>{
  const workflow=fs.readFileSync(workflowPath,'utf8');
  const decision=decideVersion('0.2.0','0.2.0');
  assert.deepEqual(decision,{status:'unchanged'});
  assert.notEqual(decision.status,'update');
  assert.match(workflow,/if: steps\.update\.outputs\.changed == 'true'/);
});

test('older registry versions never cause a formula downgrade',()=>{
  assert.deepEqual(decideVersion('0.2.0','0.1.0'),{status:'older'});
});

test('prerelease versions are ignored',()=>{
  assert.deepEqual(decideVersion('0.2.0','0.3.0-beta.1'),{status:'prerelease'});
});

test('a newer stable npm version is eligible for a formula update',()=>{
  assert.deepEqual(decideVersion('0.2.9','0.3.0'),{status:'update'});
});

test('malformed package versions are rejected',()=>{
  assert.throws(()=>decideVersion('0.2.0','not-a-version'),/Invalid stable npm version/);
});
