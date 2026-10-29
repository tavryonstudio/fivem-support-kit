'use strict';

// Pure checker is shared by the FiveM adapter and the offline tests.
function check(requirements, api) {
  if (!requirements || typeof requirements.product !== 'string' ||
      typeof requirements.resource !== 'string' || !Array.isArray(requirements.dependencies)) {
    throw new Error('Invalid requirements: product, resource and dependencies are required.');
  }
  const rows = [];
  for (const dep of requirements.dependencies) {
    if (!dep || typeof dep.name !== 'string' || !/^[A-Za-z0-9_.-]+$/.test(dep.name) ||
        (dep.supportedVersions !== undefined && (!Array.isArray(dep.supportedVersions) ||
          !dep.supportedVersions.length || !dep.supportedVersions.every(v => typeof v === 'string')))) {
      throw new Error('Invalid dependency rule.');
    }
    const state = api.state(dep.name);
    const version = state === 'missing' ? null : api.version(dep.name);
    let code = 'OK';
    let advice = 'Declared checks passed; gameplay compatibility has not been tested.';
    if (state === 'missing') {
      code = 'MISSING'; advice = 'Resource is not registered. Check installation, folder name and refresh; then rerun.';
    } else if (state !== 'started') {
      code = 'NOT_STARTED'; advice = 'Resource is not running. Inspect its first startup error before retrying.';
    } else if (dep.supportedVersions && !version) {
      code = 'UNKNOWN_VERSION'; advice = 'No version metadata. Ask the seller how to verify this dependency version.';
    } else if (dep.supportedVersions && !dep.supportedVersions.includes(version)) {
      code = 'UNSUPPORTED_VERSION'; advice = 'Reported version is outside the seller-declared list: ' + dep.supportedVersions.join(', ') + '. Confirm the supported package before changing versions.';
    }
    rows.push({name: dep.name, state, version: version || null, code, advice});
  }
  return {product: requirements.product, resource: requirements.resource,
    targetState: api.state(requirements.resource), targetVersion: api.version(requirements.resource) || null, rows};
}

function format(report) {
  // Keep terminal output single-line per field; no raw logs/config/secrets collected.
  const clean = value => String(value == null ? 'unknown' : value).replace(/[\x00-\x1f\x7f]/g, ' ').replace(/\^[0-9]/g, '');
  const lines = ['SUPPORT KIT 0.1.0 — diagnostic snapshot',
    'Product: ' + clean(report.product),
    'Target: ' + clean(report.resource) + ' | state=' + clean(report.targetState) + ' | version=' + clean(report.targetVersion),
    'Scope: resource state and seller-declared version rules only.'];
  for (const row of report.rows) {
    lines.push('[' + row.code + '] ' + clean(row.name) + ' | state=' + clean(row.state) + ' | version=' + clean(row.version));
    lines.push('  Next: ' + clean(row.advice));
  }
  lines.push('Manual review: SQL, framework configuration, exports, escrow entitlement and gameplay are not checked.',
    'Before sharing: review resource names and version metadata. No credentials, player data or raw logs are collected.',
    'Ticket details to add: expected result / actual result / reproduction steps / first relevant error (redacted).');
  return lines.join('\n');
}

if (typeof RegisterCommand === 'function') {
  RegisterCommand('supportcheck', source => {
    // Console-only prototype. No client event, web request or file modification.
    if (Number(source) !== 0) return;
    try {
      const raw = LoadResourceFile(GetCurrentResourceName(), 'requirements.json');
      if (!raw) throw new Error('requirements.json could not be read.');
      const report = check(JSON.parse(raw), {
        state: name => GetResourceState(name),
        version: name => GetResourceMetadata(name, 'version', 0)
      });
      console.log(format(report));
    } catch (err) {
      console.error('[Support Kit] Check failed: ' + err.message);
    }
  }, true);
}

if (typeof module !== 'undefined') module.exports = {check, format};
