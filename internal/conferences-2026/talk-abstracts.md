# Talk Abstracts

Three abstracts. Each follows the same structure: Hook + What you'll learn (4 bullets) + Who this is for + About me.

---

## 1. AI Tinkerers SLC (local meetup, demo format)

**Title:** The Operator Stack: How I Run 5 Brands Solo With Claude, n8n, and a $200 VPS

**Format:** 20-minute demo + 10-minute Q&A. Live screen-share, real systems.

**Abstract:**

Most solo operators I know are drowning in tools. Twelve SaaS subscriptions, three Notion workspaces, four Zapier accounts, an AI subscription stack that costs more than their first car, and somehow the actual work still does not get shipped on time.

I went the other direction. One self-hosted VPS at $200 a month. One orchestrator. One Notion content board. One Telegram bot for approvals. From that stack I run Catalyst Works (consulting), Signal Works (productized AI presence), Ghost Works (ghostwriting), HumanAtWork (a 61-SKU digital catalog), and three faceless content channels. All solo. Same engine, different surfaces.

This talk is the architecture walkthrough. I will open the actual code, show the actual containers, run a live job, and explain why it costs less than half what most operators spend on tooling.

**What you'll learn:**

- The single-orchestrator pattern that lets one VPS host every business motion you run
- How to wire Claude into a daily cron loop without burning your API budget in a week
- Where n8n still earns its place even when Claude can write the same workflow in a prompt
- The two things I tried that did not work, and what I replaced them with

**Who this is for:**

Solo operators, indie hackers, small agency owners, and tinkerers who want to see a production AI stack run live, not described in slides. Bring laptops if you want to follow along; the stack pattern is replicable.

**About me:**

I am Boubacar. I build AI workflow stacks for solo consultants and small business operators. South Jordan, Utah. Catalyst Works founder. First time speaking at AI Tinkerers SLC.

---

## 2. MicroConf Europe (Reykjavik, Sept 21-23)

**Title:** I Replaced My VA, My Designer, and My SDR With One Async Agent Loop. Here is the Architecture.

**Format:** 25-minute single-track talk.

**Abstract:**

The dream of the bootstrapped founder has always been the same: ship more without hiring more. For the last decade the path was virtual assistants in another timezone, freelance designers on call, and an SDR contractor who maybe sent three good emails a week. The path worked, sort of, but the management overhead ate the leverage.

In 2026 I rebuilt the entire support layer of my business as a single async agent loop. The loop proposes work, waits for me to approve or reject from Telegram, then executes. The same loop drafts cold outreach, ships design assets, queues social posts, and watches the inbox for replies. I never sit in front of it. I respond to its pings between client calls.

This talk is not a vibe. It is the architecture. I will show the database schema for the proposal queue, the prompt structure for the approval messages, the failure modes that nearly killed it in week three, and the exact moment I realized the agent had gotten faster than I could read its proposals.

**What you'll learn:**

- The async-approval pattern that turns LLM agents into reliable workers without losing the human checkpoint
- How to design proposal messages so you can decide in under 10 seconds on your phone
- The three guardrails that prevent agent loops from quietly burning your inventory or your reputation
- Real cost numbers: what this loop runs me per month and what it would have cost as a fractional team

**Who this is for:**

Bootstrapped SaaS founders, agency owners, and solo consultants who have already tried the VA route and felt the management overhead eat the leverage. Bring scaled patience for honest numbers; I share what did not work too.

**About me:**

I am Boubacar. I left a 14-year career at GE and RBL to build Catalyst Works, an AI consultancy that ships motion not slide decks. Based in South Jordan, Utah. Originally from Guinea. Father of four. Building in public because the system underneath the work is meant to be transferable.

---

## 3. AfroTech Conference 2026 (Houston, Nov 2-6)

**Title:** First-Gen Operator: Building an AI Agency From South Jordan Utah With Guinean Roots

**Format:** 30-minute story-driven keynote with technical artifacts. Single-track or breakout, both work.

**Abstract:**

I grew up in Conakry, Guinea. I spent 14 years inside large American institutions doing technology work I was good at but never owned. In 2026 I left to find out what a first-generation operator could build alone with AI as the leverage layer. No fallback. 18 months of runway. One year in.

This is the talk I wish I had heard from someone who looked like me five years ago. Not the polished founder story. The real version. The week I almost ran out of money before the first invoice cleared. The decision to stop chasing every shiny opportunity and lock onto one swim lane. The architecture I built when I realized I could not afford a team but could afford a VPS and a willingness to learn the tools deeply.

I will share the stack, the failures, the unit economics, and the specific moments where being a Black African immigrant operator changed the path in ways that are not in the standard founder playbook. I will not pretend the path is the same for everyone. It is not. I will share what worked for me and let you decide what travels.

**What you'll learn:**

- The five-motion solo portfolio structure I use to spread risk across consulting, productized services, content, and a digital catalog
- How to build an asset stack your kids can inherit, even when you are starting from a single laptop and a single network of one
- The specific community resources that matter when you are first-gen in tech and do not have inherited capital or inherited contacts
- Honest numbers on what a year of all-in solo building actually costs, in dollars and in everything else

**Who this is for:**

First-generation operators, Black and African founders in tech, immigrants navigating the American startup ecosystem, and anyone who has been told their accent or their background is a liability rather than a competitive moat.

**About me:**

I am Boubacar. I build AI workflow stacks for solo consultants and small business operators. Founder of Catalyst Works. South Jordan, Utah by way of Conakry, Guinea. Father of four. First-generation, first-time founder, first time at AfroTech.

---

## Voice + structure notes

- Each hook leads with a real tension the audience already feels.
- "What you'll learn" bullets are concrete, not vague. ("The async-approval pattern" not "How to use AI better.")
- "About me" closes with a fact about Boubacar that audience members can verify (location, origin, real businesses).
- No fabricated speaking history.
- No tier labels in title or body (no V1/V2/Tier 1/etc.).
- Sentence case everywhere except titles.
