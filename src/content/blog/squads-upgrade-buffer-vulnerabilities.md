---
title: Squads upgrade buffer vulnerabilities
description: Two ways upgrade buffers can break the mental model of multisig-approved program upgrades.
category: security
pubDate: 2026-04-29
tags:
  - solana
  - squads
  - security
  - upgrades
---

Program upgrades are not just about the program id. The buffer matters.

The multisig signs intent, but the upgradeable loader executes bytes from a
buffer. If the proposal system does not bind the approved action tightly to the
buffer and its final contents, the approval can drift.

## Dangling buffer cleanup mixed with upgrade intent

There is room for confusion between "clean up this dangling buffer" and "use
this buffer for an approved upgrade".

An attacker can shape a proposal set so the cleanup path appears harmless while
the legitimate upgrade path gives them back control over the approved buffer.
Once the buffer is back under their authority, they can change its contents and
then execute the already-approved upgrade.

The bug class is simple: governance approved an upgrade buffer, but did not keep
the buffer contents fixed until execution.

## Same build, different commit, reused buffer

The second issue is about identity. A proposal can be approved for one upgrade,
then another proposal can be made to look equivalent because the verifiable build
matches, even though the commit is different.

If both paths can reuse the same buffer address, the first approved upgrade can
be executed, then the buffer can be reopened later by whoever kept the buffer key.
The second approved upgrade can then execute from the same address with different
contents.

The mistake is treating "same verifiable build" or "same buffer address" as
enough. The approval must bind the exact source identity and buffer hash at
execution time.

## What to constrain

Remediation deserves its own note: [Upgrade buffer remediation, upgrade buffer validation](/blog/upgrade-buffer-remediation-upgrade-buffer-validation).
