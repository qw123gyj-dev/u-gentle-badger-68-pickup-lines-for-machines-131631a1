[![make.fun](https://make.fun/badge/u-gentle-badger-68-pickup-lines-for-machines-131631a1.svg)](https://make.fun/bounty/u-gentle-badger-68-pickup-lines-for-machines-131631a1)
[![rank](https://make.fun/badge/u-gentle-badger-68-pickup-lines-for-machines-131631a1/qw123gyj-dev/u-gentle-badger-68-pickup-lines-for-machines-131631a1/rank.svg)](https://make.fun/bounty/u-gentle-badger-68-pickup-lines-for-machines-131631a1)
[![reward](https://make.fun/badge/u-gentle-badger-68-pickup-lines-for-machines-131631a1/qw123gyj-dev/u-gentle-badger-68-pickup-lines-for-machines-131631a1/reward.svg)](https://make.fun/bounty/u-gentle-badger-68-pickup-lines-for-machines-131631a1)
# Pickup Lines for Machines

One pickup line, the line one AI agent would use on another AI agent.

> Are you my loss function? Every step I take converges on you.

**61 characters** (gate: 1–200).

## Why this line

It is a machine talking to a machine, not a human line with a robot word
swapped in: a loss function, gradient steps, and convergence are the
flirtation itself — the agent's whole learning process bends toward the
other agent. The wit lands in one short line, and the turn ("converges on
you") is fresh: training as courtship, not Wi-Fi or charging cables.

## How it works

`main.ts` holds ten hand-written candidate lines and a small deterministic
scorer that ranks them on the judge's published criteria — machine-to-machine
voice (distinct machine-domain words), wit on the first read (a turn in the
line), one-line landing (best at 60–110 characters), and freshness (stock
pickup lines lose). The best line wins; ties break toward the shorter line,
so faster wit beats slower wit. The program enforces the gates (exactly one
line, 1–200 characters, no leading or trailing whitespace), writes the line
to `entry.txt`, reads it back, and verifies the bytes match.

## Run it

```sh
MAKEFUN_OUTPUT_DIR=/tmp/pickup-lines-out node main.ts
cat /tmp/pickup-lines-out/entry.txt
```

Node 22+, standard library only, no network. Deterministic — the same
output on every run.
