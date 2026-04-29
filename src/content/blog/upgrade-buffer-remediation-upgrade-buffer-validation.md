---
title: Upgrade buffer remediation, upgrade buffer validation
description: Notes on self-validating approvals for upgrade buffers and multisig execution.
category: security
pubDate: 2026-04-29
tags:
  - solana
  - squads
  - security
  - upgrades
---

The signer should not only approve what the UI says. The approval transaction
should prove, on-chain, that the account data still matches what the signer
thinks they are approving.

That is the role of
[account-data-verificator](https://github.com/Arrowana/account-data-verificator):
add a verification instruction before the Squads vote instruction. If the
proposal account,
[transaction account](https://github.com/Squads-Protocol/v4/blob/main/programs/squads_multisig_program/src/state/vault_transaction.rs),
or relevant target account bytes do not match the expected hash or slice, the
vote transaction fails.

## Simple example

Take a plain token-transfer proposal:

- send `amount` tokens
- from token account `A`
- to token account `B`
- through vault `V`

The approval transaction should be:

1. verify the Squads proposal is the expected proposal
2. verify the transaction account still contains the expected token transfer
3. verify the source, destination, mint, amount, and vault accounts match
4. only then call `vote approve`

This makes the vote self-validating. A compromised RPC node or misleading UI can
still show the signer the wrong thing, but it cannot make the on-chain approval
succeed unless the live account data matches the signed expectation.

![A self-validating vote approve transaction verifying proposal, transaction, and target account bytes before voting.](/blog/self-validating-approval.svg)

For upgrade proposals, the same pattern applies to the upgrade buffer: verify the
exact buffer hash expected to be executed before approving.

This matters because `solana-verifiable-build get-buffer-hash <buffer>` uses a default
RPC node unless configured otherwise. In practice, multisig members are likely
to fetch the buffer account from the same RPC node by default, then hash those
bytes locally. That preserves the shared trust assumption instead of removing it.

The cost is low: one extra verification instruction and a few explicit hashes or
slices. The industry default is often the opposite: rely on convoluted monitoring
systems that are opaque to the signer and add more assumptions before anything
can be called "safe".

It is also easy to audit: the expected account data is explicit, and the vote
cannot happen unless the chain agrees with it.

## Conclusion

It is almost a bug that upgrade buffers allow this much confusion between "what
was approved" and "what will be executed". Squads v4 could have been designed to
reduce blind trust in RPC node data, or at least shipped with tooling that makes
self-validating approvals the default path.
