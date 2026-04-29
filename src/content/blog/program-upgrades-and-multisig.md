---
title: Program upgrades and multisig
description: "A short model for Solana upgrades: the loader owns the deployable bytes, the authority owns the change."
category: security
pubDate: 2026-04-29
tags:
  - solana
  - security
  - upgrades
---

A Solana program is executable data. If it was deployed with the upgradeable
loader, the program points at a program data account that stores the bytes and
the upgrade authority.

An upgrade is just a controlled replacement of those bytes. The upgrade
authority signs an instruction that writes a new verified buffer into the
program data account. If the authority is removed, the program becomes
effectively immutable.

Using one wallet as the authority is simple and fragile. A multisig makes the
authority a program-controlled account instead. Proposals describe the upgrade,
members vote, and only after the threshold is met does the multisig execute the
loader instruction.

The useful security boundary is not "multisig exists". It is who can propose,
who can vote, what threshold is required, whether the buffer was verified, and
whether signers can understand the upgrade they are approving.
