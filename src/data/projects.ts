export type Project = {
  name: string;
  summary: string;
  url: string;
  stack: string;
};

export const projects: Project[] = [
  {
    name: "ledger-solana-app-v2",
    summary: "Ledger Solana app experiments for safer hardware-wallet signing.",
    url: "https://github.com/Arrowana/ledger-solana-app-v2",
    stack: "Rust",
  },
  {
    name: "account-data-verificator",
    summary: "Rust tooling around Solana account-data verification.",
    url: "https://github.com/Arrowana/account-data-verificator",
    stack: "Rust",
  },
  {
    name: "nodnonce",
    summary: "Transaction uniqueness without durable nonce machinery.",
    url: "https://github.com/Arrowana/nodnonce",
    stack: "Rust",
  },
  {
    name: "realloc-bug-exploit-poc",
    summary: "Proof of concept for a Solana account reallocation bug class.",
    url: "https://github.com/Arrowana/realloc-bug-exploit-poc",
    stack: "Rust",
  },
];
