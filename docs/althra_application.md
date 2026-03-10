# Setta - Althra Application Draft

## One-liner

Setta is allocation infrastructure for performance creative agencies. We detect algorithmic anomalies before they're visible to the market and encode that into a weekly funding policy for your creative pipeline.

## What is Setta?

Setta is allocation software for performance creative agencies. We detect algorithmic anomalies in social platforms 1 to 2 weeks before they're visible to the market and convert that into a weekly funding policy: a structured gate that tells agencies exactly what to produce, what to kill, and what the evidence is behind every call. The output is called the Gate. Agencies use it as the standing input to their weekly production meetings.

## What's the technical moat?

The core is a signal ingestion and normalization pipeline that runs continuous analysis across TikTok and JP/KR content clusters. The system identifies anomalies in algorithmic weighting behavior: specific comment engagement patterns, keyword clusters, and retention curve shapes that precede format performance at scale. This is not trend aggregation. It is anomaly detection on platform algorithm behavior. The detection window is typically 1 to 2 weeks ahead of what agencies can see manually.

## Why now?

Performance creative agencies are scaling spend faster than their allocation frameworks can keep up. The standard process is to brief everything, shoot everything, and figure out what worked after. That is an expensive way to learn. The infrastructure to run systematic pre-spend allocation exists now. Setta is building it as a product, not a service.

## What have you built?

A config-driven workflow system that ingests cross-platform signals, normalizes them against algorithmic viability rules, and generates structured allocation decisions as output. The Gate document, including greenlight calls, do-not-shoot decisions, creator constraints, and the failure tree, is produced by that system rather than by manual analysis alone. Each agency's allocation policy is encoded as configuration. The system runs weekly without starting from scratch.
