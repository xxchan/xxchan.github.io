---
layout: post
title: "xxchan 的 AI 产品观察（1）"
categories:
- AI
toc: true
toc_sticky: true
---

> 这篇文章其实六月就想写了，最开始是想写个周报，然后不知不觉拖了三个多月 🤪

现在 AI 发展极快，天天都有新东西发布，一周就像一年。眼花缭乱，信息爆炸，难免让人 FOMO。
另一方面自媒体的内容也参差不齐，但大多浮于表面，对产品本身的体验，不同产品的微妙区别讲的非常浅尝辄止。
（这肯定有多方面原因，讲太好了可能吸引同行，讲太犀利了也影响恰饭。另外也可能很多产品确实是没啥好讲，
和同类产品没啥区别。只好说一些官话。）
对宏观未来的分析也大多是纯饼、车轱辘话比较多。

我是挺喜欢琢磨产品的，特别是不同产品之间的区别。例如之前对 [Coding Agent](https://xxchan.me/ai/2025/06/08/ai-coding.html) 的分析。
所以想写一些东西，主要讲 AI 产品，想要回答“和我有什么关系” 以及 “他们为什么要这么做”。
（当然也会畅想一下未来，也可能讲一讲有意思的技术）

本文不一定 most up to date，也不一定全面。


## Claude AI App & YouWare AI App

25/06/27: Anthropic 推出了 AI-powered apps（Artifacts），
- https://www.anthropic.com/news/build-artifacts
- https://support.anthropic.com/en/articles/11649438-prototype-ai-powered-apps-with-claude-artifacts


window.claude.complete()

artifact system
UGUI  -  GPTs with UI

七月中旬，YouWare 也推出了 AI app 功能。除了 LLM 之外，还陆续接入了 Image & Video Generation。
和 Claude 的“使用用户的账号 usage”之外，youware 也是完全类似，user 在使用 ai app 的时候，消耗自己的 credit，而非创作者的 credit。


“造一个网页”的 aha moment 过去的很快，“享受到 ai 的能力”的 aha moment 似乎更强。
往大了说，这属于“平台内建能力”的一部分，类似的还有平台自带后端。这当然是把双刃剑，对于 tob 用户，或者对自己项目掌控要求很高的用户，对此
肯定很难接受，因为这等同于完全锁死平台能力。
但对于真正普惠 coding 的能力给大众来说，这个用户体验提升非常巨大。减少了创作者理解以及配置后端、AI api key 的麻烦，更重要的是不需要考虑
成本问题。
不用担心开销是好事，但如果还能赚一点点小钱岂不是更妙？于是 YouWare 还出了以此为基础的[返利计划](https://www.youware.com/legal/creator-incentive-rules?enter_from=dashboard_hover_tip): 用户使用 AI app 消耗的 credit，在去除成本后，创作者和平台平分收益。
当自己有个 idea 想搞个小项目，可能不想搞很严肃的商业化，usage based billing 什么的搞起来也挺麻烦，这时候有 youware 这样的机制就极其方便。
我发现这种反馈机制甚至有一些成瘾性，会总让我想着能不能给我的 app 多搞点流量。
反馈的力量确实很强，YouWare 正在从多个层次上实现这件事：让你“被看到”：点击量，emoji reaction；互动性：评论区；和现金激励。社交媒体、视频网站
的这些套路确实是极其有用。一开始会困扰“为什么要把网站部署到 YouWare”，现在逐渐理解了一切。对于普通用户来说，玩 vibe coding 极其容易腻，
基本上玩了两个 demo 就不会再打开了。YouWare 第一次让我有了继续玩下去的动力。



vscode 插件

https://www.anthropic.com/news/claude-for-financial-services
48 【Claude AI展示AI如何替代金融分析师 - Vicente Schumpeter | 小红书 - 你的生活兴趣社区】 😆 A8xVGyw9Ylc73lg 😆 https://www.xiaohongshu.com/discovery/item/6881deb1000000002400eb60?source=webshare&xhsshare=pc_web&xsec_token=ABYQ6kfvSgjZi2GgAvneZaX4Cx27j8XkWGHScFitKPWy0=&xsec_source=pc_share

claude code custom subagent

## ChatGPT Agent

A natural evolution of Operator and deep research

We’ve equipped ChatGPT agent with a suite of tools: a visual browser that interacts with the web through a graphical-user interface, a text-based browser for simpler reasoning-based web queries, a terminal, and direct API access

味儿很对
但是就是 Manus

![](/assets/img/ai-comment-1/chatgpt-agent.png)


## Cursor Web 

Cursor 必然会做自然语言入口

现在这些 AI coding 的愿景可能都是 make everyone can code，只是实现路径不一样

https://x.com/benhylak/status/1940126199046709376

https://x.com/ryolu_/status/1943447809690341874

Cursor, the hottest AI code editor, might destroy their user base in 30 days.


What happened:

Cursor switched from 500 fixed requests/month to "compute-based pricing."
Result? Users burning through their $20 monthly plan in hours instead of weeks.

The screenshot says it all:
"Cursor is unusable now"
Reddit is flooded with posts like this. Users hitting rate limits after just a few prompts.

The backlash:
- Mass subscription cancellations
- Developer exodus to Claude Code

The brutal lesson:
Cursor had better AI than competitors. Didn't matter.
Developers chose predictable pricing over superior features.

The reality: AI compute costs are exploding. Users expect flat pricing.
This tension will break more AI companies in 2025.


https://x.com/TechCrunch/status/1945953918686580942

claude code 也被骂，有 sustainability 问题

## Copilot Agent

最好的点：低摩擦
cursor/claude code 能干，但是懒

## Kiro


## manus

https://manus.im/updates

Manus slides

text editing

我本来的判断是“slides”必须自己准备材料。但好像没那么绝对，特别是对于学校课件这个场景来说，让 ai 自己搜索可能非常够甚至更好。（但教学这个场景可能没那么高价值……用祖传课件够了？）更多的可能是白领汇报工作的 slides。但这种场景他可能不傻，自己知道上传文件

![](/assets/img/ai-comment-1/manus.png)

context engineering

## Beast mode

https://gist.github.com/burkeholland/88af0249c4b6aff3820bf37898c8bacf


## Kimi K2

如果真的能以 1/10 的价格达到 Claude Sonnet 3.5 的性能，可能杰文斯悖论？
便宜可能不够，还得快
我现在用claude code 用的多了以后有点嫌他慢了。
理论上一个 agent 自助干活，异步协作，其实慢点无所谓，但是还是效果不够好。
对于 pair programming 场景，需要快。


## Codex vs Claude Code

没有 planning
无法动态控制思考时间

非常聪明的高手和干活很利索但是容易犯错的人。后者更适合 pair programming


## Imagine with Claude

![](/assets/img/ai-comment-1/imagine-with-claude.png)

The Problem
⏰
Slow Development
Building UIs takes weeks of coding, testing, and iteration

🔧
Technical Barriers
Non-technical users can't prototype their own ideas

🔄
Iteration Friction
Every change requires code, deploy, and test cycles




Our Solution
🤖
AI-Powered Agent
Claude acts as both backend and frontend, building interfaces in real-time through natural language

⚡
Instant Iteration
Make changes by simply asking. No code, no deploy, no waiting

🪟
Window-Based Apps
Each feature lives in its own draggable window. Organize your workspace naturally

🎯
Zero JavaScript
Agent handles all interactivity. Buttons just work, forms just submit, games just play





Use Cases
🚀
Rapid Prototyping
Test ideas in minutes instead of days. Perfect for design sprints and stakeholder demos

📊
Data Dashboards
Visualize data on demand. Charts, tables, maps - all generated from natural language

🎮
Interactive Tools
Calculators, converters, games, surveys - anything turn-based works beautifully

🎨
Creative Exploration
Generate slide decks, mockups, diagrams - creativity without technical constraints

🛠️
Internal Utilities
Build one-off tools for specific tasks without spinning up full projects

```
INITIAL VISION DOC
==================

what if we could build web apps without writing code?

not low-code. not no-code.
something different.

an AI agent that:
- understands what you want
- builds the UI live
- reacts to your interactions
- evolves the interface as you use it

the interface streams into existence
you can interrupt it, click things, change direction
the agent adapts in real-time

---

PRINCIPLES:

1. PROGRESSIVE
   UI appears token by token
   you see it being created
   you can interact before it's "done"

2. REACTIVE
   every click, every input -> agent responds
   no JavaScript needed
   the agent IS the interactivity layer

3. MINIMAL
   clean, simple interfaces
   Apple-like design philosophy
   nothing extra, nothing missing

4. ITERATIVE
   start simple, add complexity
   surgical updates, not full rewrites
   each interaction refines the UI

---

TECHNICAL APPROACH:

- Claude as the backend AND frontend
- DOM manipulation via tool calls
- Tailwind + daisyUI for styling
- No
```



```
ASYNC ARCHITECTURE NOTES
========================

The magic: every user interaction = new prompt to agent

button click -> agent receives: "clicked on #btn-submit"
enter key -> agent receives: "pressed Enter on #input-field"
form change -> agent receives: "changed inputs: #name='John'"

agent doesn't need to "wait" for anything
agent just reacts to events as they come

this is why JS is forbidden!
- no event listeners needed
- no state management needed
- no callbacks or promises
- agent IS the event handler

---

LATENCY: ~3 seconds per interaction
this shapes what we can build:

✓ turn-based games (chess, cards, strategy)
✓ forms and surveys
✓ data dashboards
✓ text adventures
✓ management sims

✗ real-time games (tetris, snake, pong)
✗ animations triggered by user
✗ drag and drop (technically possible but janky)

---

STREAMING HTML:
agent streams HTML token by token
user sees it appear progressively
BUT: user can click mid-stream!

-> [UI STREAMING INTERRUPTED BY USER ACTION]
-> agent gets partial HTML state
-> must work with what's already rendered
-> can't assume full UI is there yet

solution: design for interruption
- make early elements functional
- don't rely on later elements existing
- buttons should work even if page incomplete

---

THE AGENT LOOP:
1. user does something
2. system sends action to agent
3. agent makes tool calls to update UI
4. UI updates appear
5. goto 1

it's like building a web app where
the server IS the frontend framework
and HTTP requests are instant

---

COST MODEL:
every interaction = LLM inference
tokens matter!
- don't re-rend
```



```
TODO: Figure out window system
- draggable?
- resizable?
- minimize/maximize?

agent should create windows on demand
not pre-render everything

IDEA: what if windows ARE the apps?
each window = independent feature
no global navigation needed

tools for window management:
window_new(id, title, size)
window_close(id)
dom_replace_html for content

sizes: xs, sm, md, lg, xl
fixed widths, no responsive needed

remember: surgical updates!
don't re-render entire window
use append, replace on specific selectors

---

NOTE: user clicks button -> agent gets notified
no JS needed! magic! 🎩

darkmode? lightmode? 
-> let daisyui handle it
-> semantic classes FTW

FIXME: need better skeleton loading
FIXME: toast notifications?

streaming HTML = progressive reveal
but can be interrupted mid-stream
need to handle partial renders

---

windows in windows? 🤔
probably not... keep it simple
```
