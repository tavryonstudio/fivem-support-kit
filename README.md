# FiveM Support Kit — technical demo 0.1.0

A prototype for FiveM script sellers that checks declared requirements and produces an organized report for support tickets. It is not a finished commercial product or an automatic repair tool.

## Quick test without FiveM

With Node.js 18 or later, run from this directory:

```sh
node test.js
```

The tests use simulated FiveM APIs and generate `sample-report.txt`. Results are synthetic, not measurements from a real server.

## Install on a test FiveM server

1. Copy the `support_kit` folder into `resources/[local]/`.
2. Copy the three folders inside `fixtures` into the same `[local]` folder.
3. Do not create a `demo_missing` resource.
4. Run these commands in order in the server console:

```text
refresh
ensure demo_target
ensure demo_old
ensure support_kit
stop demo_stopped
supportcheck
```

`demo_stopped` must be installed but stopped. Do not run `ensure [local]` after stopping it, as that would start it again. The demo does not require QBCore, ESX, or a database.

Expected results: MISSING for demo_missing, NOT_STARTED for demo_stopped, and UNSUPPORTED_VERSION for demo_old (which declares 1.0.0 instead of the required 2.0.0).

The command can only be executed from the server console/RCON or another trusted server resource, not by players. The report appears only in the console; it is not automatically sent to Discord.

## Configure for another product

Edit `support_kit/requirements.json`: product, resource, and dependencies. The optional `supportedVersions` field is a strict list of exact strings, not a semver range. The seller defines it based on their own tests. Missing version metadata yields UNKNOWN_VERSION, not confirmed incompatibility. After configuration, run `supportcheck` again.

## Scope and data

- Reads only the state and version metadata of declared resources, plus its own JSON.
- Does not read server.cfg, credentials, logs, player identifiers, or the database.
- Does not modify files, start or stop resources, or make external requests.
- Review names and metadata before sharing the report. There is no general scrubber for arbitrary data added by a developer to metadata.
- MISSING means a resource is not registered at runtime: a refresh or a corrected name may be needed; it does not necessarily mean a download is required.
- Does not check SQL, exports, escrow, gameplay, performance, hidden dependencies, providers/aliases, or complete framework compatibility.
- OK means only that the specified declared checks passed at the time of execution.
- The target's state appears in the header; this does not determine whether it works correctly in-game.

## Validation and next steps

The checking logic and adapter have been tested locally with mocks. No test has been performed in FXServer or a GTA/FiveM client. Before a real release, the prototype needs server testing, usability evaluation by sellers, and evidence of willingness to pay. No reduction in tickets or selling price has been established.

Suggested experiment: ask three sellers to configure a product themselves, evaluate the report, and say whether they would pay for it. If all require custom integration, the idea may not fit the goal of minimal communication.

## API references

- https://docs.fivem.net/docs/scripting-reference/resource-manifest/
- https://docs.fivem.net/natives/?_0x4039B485
- https://docs.fivem.net/natives/?_0x964BAB1D
- https://docs.fivem.net/docs/scripting-manual/migrating-from-deprecated/creating-commands/
