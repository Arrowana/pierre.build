---
title: Multisig transaction flow
description: A compact view of what create, vote, and execute reference in a Squads transaction.
category: security
pubDate: 2026-04-29
tags:
  - solana
  - security
  - multisig
---

Create writes the transaction account. The proposal tracks status and votes.
Vote references the proposal. Execute reads the transaction account and runs the
stored message.

| Step | Accounts to check | Args / data to check |
| --- | --- | --- |
| Create transaction | `multisig`, `creator`, `transaction`, `vault` | `transaction_index`, `vault_index`, `message.account_keys`, `message.instructions[].program_id_index`, `message.instructions[].account_indexes`, `message.instructions[].data`, `message.address_table_lookups` |
| Create proposal | `multisig`, `proposal`, `creator` | `transaction_index`, proposal status seed/index |
| Vote approve | `multisig`, `proposal`, `member` | vote value, proposal status, member identity |
| Execute | `multisig`, `proposal`, `transaction`, `vault`, remaining accounts | `transaction_index`, `message.account_keys`, `message.instructions[].data`, lookup table contents |

Is anything insufficient?
