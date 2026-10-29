'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const {check, format} = require('./support_kit/server.js');
const rules = require('./support_kit/requirements.json');
const states = {demo_target: 'started', demo_stopped: 'stopped', demo_old: 'started'};
const api = {state: n => states[n] || 'missing', version: () => '1.0.0'};
const report = check(rules, api);
assert.deepEqual(report.rows.map(r => r.code), ['MISSING', 'NOT_STARTED', 'UNSUPPORTED_VERSION']);
const good = {state: () => 'started', version: () => '2.0.0'};
assert.ok(check(rules, good).rows.every(r => r.code === 'OK'));
assert.equal(check(rules, {...good, version: () => null}).rows[2].code, 'UNKNOWN_VERSION');
for (const state of ['starting', 'stopping', 'uninitialized', 'unknown']) {
  assert.equal(check(rules, {...good, state: () => state}).rows[0].code, 'NOT_STARTED');
}
assert.throws(() => check({}, api), /Invalid requirements/);
assert.throws(() => check({...rules, dependencies: [{name: '../bad'}]}, api), /Invalid dependency/);
assert.throws(() => check({...rules, dependencies: [{name: 'ok', supportedVersions: []}]}, api), /Invalid dependency/);
assert.ok(!format({...report, product: 'bad\nINJECTED'}).includes('bad\nINJECTED'));
let command;
const output = [];
const sandbox = {
  RegisterCommand: (name, handler, restricted) => {command = {name, handler, restricted};},
  LoadResourceFile: () => JSON.stringify(rules), GetCurrentResourceName: () => 'support_kit',
  GetResourceState: api.state, GetResourceMetadata: api.version,
  console: {log: s => output.push(s), error: s => output.push(s)}
};
vm.runInNewContext(fs.readFileSync(__dirname + '/support_kit/server.js', 'utf8'), sandbox);
assert.equal(command.name, 'supportcheck');
assert.equal(command.restricted, true);
command.handler(12);
assert.equal(output.length, 0, 'Player must not receive or trigger diagnostics');
command.handler(0);
assert.equal(output[0], format(report));
sandbox.LoadResourceFile = () => '{broken';
command.handler(0);
assert.match(output[1], /Check failed/);
fs.writeFileSync(__dirname + '/sample-report.txt', format(report) + '\n');
console.log('PASS: three failures, all-pass, unknown version, transitional states, invalid rules, output sanitization, console-only adapter, invalid JSON.');
console.log('\n' + format(report));
