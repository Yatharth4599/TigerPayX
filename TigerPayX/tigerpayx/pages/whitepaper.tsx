import Head from "next/head";
import { Navbar } from "@/components/Navbar";

const WHITEPAPER_TEXT = `TigerPayX

Global Payments, Spend & Credit Coordination Infrastructure

Version: 1.1

Document Type: Technical & Informational Whitepaper

Status: Live Protocol Infrastructure

Last Updated: 2025

1. Abstract

TigerPayX is a blockchain-native financial infrastructure protocol designed to enable global payments, programmable value transfer, spend abstraction, and reputation-driven coordination for access to capital.

The protocol introduces standardized primitives for QR-based merchant payments, peer-to-peer transfers, programmable payment links, card-based spending abstraction, and on-chain behavioral risk signaling. TigerPayX is not a bank, exchange, lender, or custodial institution. It operates as a coordination layer, enabling compliant third-party providers, merchants, developers, and users to interact with digital value in a modular and interoperable manner.

The TigerPayX token functions as a protocol utility and coordination mechanism, facilitating network access, fee routing, and infrastructure alignment. It does not represent equity, ownership, or claims on any entity.

2. Background & Motivation

Digital assets have achieved global distribution, yet their practical financial usage remains constrained by:

Fragmented payment acceptance

Disconnected card and crypto rails

Inefficient cross-border settlement

Limited access to credit for underbanked users

Binary collateral requirements

Absence of portable, on-chain reputation signals

Traditional financial systems rely on centralized trust, jurisdiction-specific underwriting, and opaque risk assessment. Many crypto payment solutions address only transfers, failing to integrate spending, merchant tooling, and credit coordination.

TigerPayX addresses this gap by introducing a unified infrastructure layer that abstracts payments, spend, and behavioral reputation into composable protocol primitives.

3. Design Philosophy

TigerPayX is built on the following core principles:

3.1 Infrastructure Over Speculation

The protocol prioritizes real-world utility and usage. Economic mechanisms exist to support infrastructure access, not speculative activity.

3.2 Jurisdiction-Neutral Architecture

The protocol does not target or privilege any specific geography. Regulatory compliance is implemented at the application and partner layer.

3.3 Non-Custodial by Default

TigerPayX does not custody user funds or issue financial instruments directly. Asset control remains with users or licensed third parties.

3.4 Modular & Composable

Payments, spend abstraction, and credit signaling operate as independent modules that evolve without systemic dependency.

3.5 Transparency & Verifiability

Protocol logic, token mechanics, and fee flows are observable and verifiable on-chain.

4. Protocol Architecture Overview

TigerPayX is composed of multiple layered infrastructure components.

4.1 Core Protocol Foundation

The base layer includes:

Token deployment and lifecycle management

Network-level fee routing

Protocol access controls

On-chain transparency for allocations and usage

This foundation establishes the coordination framework upon which higher-level payment and credit functionality is built.

4.2 Payments Layer

The payments layer enables real-world and digital value exchange through:

QR-based merchant payments

Peer-to-peer transfers

Programmable payment links

Multi-asset routing and settlement abstraction

Payment execution is standardized through smart contracts without embedding jurisdiction-specific logic at the protocol level.

4.3 Merchant & User Tooling

To support operational adoption, TigerPayX enables:

Merchant dashboards

Payment analytics and reporting

Transaction lifecycle visibility

Non-custodial reconciliation primitives

This layer focuses on usability, observability, and operational clarity.

4.4 Spend Abstraction Layer

TigerPayX supports card-based spending through licensed third-party partners:

Debit card integrations

Off-chain spend with on-chain reconciliation

Token-agnostic settlement

Unified spend abstraction across rails

Cards function strictly as an interface layer. The protocol does not issue cards, custody fiat, or manage user balances.

4.5 Reputation & Credit Coordination

TigerPayX introduces protocol-native reputation signaling through the ROAR Score.

ROAR Score is derived from:

Transaction consistency

Network participation

Payment reliability

Activity longevity

Behavioral entropy

ROAR is not a credit score, rating, or promise of creditworthiness. It is a coordination signal designed to enable composable financial access.

4.6 Credit & Capital Coordination Layer

The protocol enables frameworks for:

Collateralized and non-collateralized signal modeling

Risk-weighted access indicators

Usage-based access tiers

Integrations with external capital providers

TigerPayX:

Does not issue loans

Does not underwrite borrowers

Does not guarantee capital access

It supplies verifiable signals that third-party providers may choose to consume.

5. Token Utility & Economic Role

5.1 Purpose of the Token

The TigerPayX token functions as a protocol utility and coordination mechanism within the ecosystem.

The token enables:

Access to protocol services

Payment of network-level fees

Coordination of infrastructure usage

Alignment of long-term ecosystem participants

The token does not represent equity, ownership, revenue share, or claims on assets of any entity.

5.2 Fundraising Context (SAFT / SAFE)

Prior to and during early network development, capital was raised through standardized investment instruments (e.g., SAFT/SAFE arrangements) facilitated via third-party infrastructure providers, including Cyrene AI.

These instruments represented contractual rights to future token allocation, distinct from the token itself.

Upon network activation, the token operates solely according to its defined protocol utility and does not confer investor rights, profit participation, or governance over any legal entity.

5.3 Usage-Driven Demand

Token demand arises from:

Payment routing fees

Protocol access thresholds

Service prioritization

Infrastructure participation

There are no guarantees of liquidity, appreciation, or market performance.

6. Roadmap

Phase I — Protocol Foundation

Token deployment

Core smart contracts

Network fee routing

Access controls and transparency

Phase II — Payments Infrastructure

QR-based merchant payments

Peer-to-peer transfers

Programmable payment links

Multi-asset routing

Phase III — Merchant & User Tooling

Merchant dashboards

Payment analytics

Transaction observability

Reconciliation primitives

Phase IV — Spend Abstraction

Debit card integrations via licensed partners

Off-chain spend abstraction

On-chain settlement coordination

Phase V — Reputation Signals

ROAR Score rollout

Behavioral modeling

Usage-based access tiers

Phase VI — Credit Coordination

Collateralized and non-collateral frameworks

Capital partner integrations

Risk-weighted access indicators

Phase VII — Developer & Ecosystem Expansion

APIs and SDKs

Third-party integrations

Modular protocol upgrades

Phase VIII — Global Expansion

Region-specific partner integrations

Local compliance via third parties

Scalable infrastructure rollout

All timelines are indicative and subject to change.

7. Jurisdictional Availability & Compliance Posture

TigerPayX is designed as a globally accessible protocol infrastructure and does not target, solicit, or prioritize users in any specific jurisdiction.

Availability of services — including payment instruments, cards, or credit products — is subject to applicable local laws and the compliance requirements of independent third-party providers.

The protocol does not actively market or promote its token as a financial investment product in jurisdictions where such activities require regulatory authorization.

All regulated activities are performed exclusively by licensed partners.

8. Risk Disclosures

Participation in the TigerPayX ecosystem involves technical, regulatory, and market risks, including:

Token volatility

Limited liquidity

Jurisdictional restrictions

Protocol evolution risks

Users are responsible for understanding local regulations prior to interacting with third-party services.

9. Security & Governance

TigerPayX prioritizes:

Auditable smart contracts

Transparent upgrade mechanisms

Progressive decentralization

Governance structures may evolve as the protocol matures.

10. Conclusion

TigerPayX is building financial infrastructure, not a speculative asset.

By abstracting payments, spend, reputation, and credit coordination into modular protocol layers, TigerPayX enables global financial interoperability without embedding jurisdiction-specific assumptions at the base layer.

The protocol is designed for builders, merchants, and long-term ecosystem participants.

11. Legal Disclaimer

This document is provided for informational purposes only and does not constitute financial advice, investment solicitation, or an offer of securities. Nothing herein should be interpreted as a promise of returns, appreciation, or profit.`;

export default function WhitepaperPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 via-amber-50/30 to-orange-50/50">
      <Head>
        <title>TigerPayX Whitepaper</title>
        <meta name="description" content="TigerPayX technical & informational whitepaper" />
      </Head>

      <Navbar />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white/80 backdrop-blur-sm border border-orange-200 rounded-2xl p-6 sm:p-10 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">TigerPayX Whitepaper</h1>
              <p className="text-gray-600 mt-2">Version 1.1 • Last Updated 2025</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <a
                href="https://jup.ag/tokens/tMQ2SvQ9EW2X9zQ9vTZQxsrLmSumZy24vqQ17Pacyai"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-full bg-[#ff6b00] px-4 py-2 text-sm font-semibold text-white hover:bg-[#e55a00] transition-colors"
              >
                TPAYX Token
              </a>
              <a
                href="https://x.com/tigerpayx"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-900 hover:bg-gray-50 transition-colors"
              >
                X @tigerpayx
              </a>
            </div>
          </div>

          <div className="whitespace-pre-wrap text-sm sm:text-base leading-relaxed text-gray-900">
            {WHITEPAPER_TEXT}
          </div>
        </div>
      </main>
    </div>
  );
}
