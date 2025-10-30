---
title: 回顾 Claude Code 的成功：天时地利人和+大道至简
pubDate: 2025-09-27T00:00:00.000Z
categories:
  - AI
toc: false
tocSticky: true
locale: zh
translationKey: cc-reflection
---

[上一篇博客锐评 Coding Agent](/ai/2025/06/08/ai-coding.html)时就觉得 CC 性能遥遥领先，并且有种"第一性原理"的美。现在今非昔比，大家的认知都跟上了，甚至 Codex 已成新神。

但今天读了 [How Claude Code is built](https://newsletter.pragmaticengineer.com/p/how-claude-code-is-built)，还是小有感触。让人不禁想回顾过去反思一下：为什么是 CC 第一个做出了如此超前的产品？

看了这篇文章，CC 的诞生并不是下一盘大棋（当然项目成功以后就不好说了）而是 hobby 项目，作者也并不是有多么超越时代的认知，而是在恰当的时间地点和人的作用下的自然产物。

对于足够有产品 sense 和技术 sense，爱玩，**且有时间自己探索**，且主要精力花在**探索模型能力**，且**用模型不需要花钱**，且模型 agent 能力到了可用的时机，且有人一直用一直给反馈……的情况下，造出 Claude Code 仿佛是显然的。

---

> Boris and the Claude Code team released a dogfooding-ready version in November 2024 – two months after the first prototype

也就是他们 24 年九月就开始做了。认知足够早，有足够多的时间打磨，并且以正确的方式做事，很难不成功。

> I hooked up this prototype to AppleScript: it could tell me what music I was listening to while working. And then it could also change the music playing, based on my input.
>
> I tried giving it some tools to interact with the filesystem and to interact with the batch; it could read files, write files, and run batch commands.
> Suddenly, this agent was really interesting

所有玩 local agent 的人都是从 AppleScript 开始吗（

从这里可以看出 CC 的诞生像是一个 aha moment——给了模型 read/write/bash 它就能干活了。这样的感悟很珍贵，但是应该不至于别人想不到。

但这里如果换个人做，特别是没那么爱用/会用命令行的人，可能会一开始就想做桌面 GUI。但那就会不够快。

> Architecture: **choose the simplest option**
>
> The Claude Code team tries to write as little business logic as possible.
>
> "This might sound weird, but the way we build this is we want people to feel the model as raw as possible. We have this belief the model can do much more than products today enable it to do. 
>
> ... Every time there’s a new model release, we delete a bunch of code." 
>
> "With every design decision, we almost always pick the simplest possible option. What are the simplest answers to the questions: "where do you run batch commands?" and "where do you read from the filesystem?" It’s to do it locally.

大道至简最有含金量的一集。

一方面现在都说 "less structure, more intelligence" 了，但我相信对模型公司以外的产品公司应该很难忍住雕花的冲动。以及这里可以明显看出他们会持续关注模型和 prompt 的适配性。

大道至简在 CC 的例子上，更关键的是节省了钻研各种复杂功能以及复杂 UI 的精力，于是可以只琢磨 agent 最核心的事情（雕 system prompt 和 build 适合 agent 使用的 tool），并且迭代速度足够快——这可能是 CC 成功最本质的原因。

Dogfooding 是好文明，也是加速迭代的重要因素。但是可能没那么独特。比如我相信 Cursor 的所有人也都是用 Cursor 开发的。但是开发 IDE 要做的事太多了，谁来思考迭代 agent 呢。

> **~60-100 internal releases/day.**（真假？） Any time an engineer makes a change to Claude Code, they release a new npm package internally. Everyone at Anthropic uses the internal version and the dev team gets rapid feedback.
>
> **1 external release/day.** Almost every day, a new version of the package is released as part of a deployment.

CC 可以一天发版好多次，加个功能就发了，但 Cursor 不太可能。而且在 IDE 里做 agent，一上来就要想 UI 怎么搞。又还因为 Cursor 必须适配很多模型，所以可能要用更"通用"的方法，达成更稳定的工具调用。而 CC 只需适配一个最好的模型。

包括小团队开发也很本质，对迭代速度有巨大加成。CC 在很长的时间里应该都是独裁项目，没有任何包袱。Cursor 的迭代应该需要很多合作。你改个东西可能把别人的搞坏了。

CC 刚出的时候很多人质疑 terminal UI 是开倒车，以及没有 codebase indexing 性能会不如 Cursor。

但对 coding agent 来说，codebase indexing 这种东西没那么本质，它可能确实在某些场景比 grep readfile 效果好，但是更本质的能力是 agentic task 的能力。

RAG 是 chat 时代的产物，是因为没有 agent 所以搞来的轮椅。并不是轮椅不好，但是轮椅坐久了可能大家就忽略了其实可以用脚走路的。

只有 RAG 不行，但 RAG 本身大概还是有用的。现在会走路了之后还是可以坐高级电动轮椅，说不定可以更加起飞。

我一直认为长期看显然 Cursor 没理由不做 CC 的功能，在 agent 能力上追上来。CC 并不是终极产品形态。但 CC 就是迭代足够快，所以认知和产品领先了。Cursor 慢可以理解，是被 IDE 的包袱拖慢了速度。


但为什么 OpenAI 没搞出来？是因为忙着搞 remote agent（operator）？
没有这种做实验性项目乱搞的文化？也不太像，毕竟《伟大不能被计划》就是 openai 的人写的。
通用模型的 agentic 能力不够好可能是的（虽然有 deep research，operator，但是主模型不行）。

---

> "We actually weren't even sure if we wanted to launch Claude Code publicly because we were thinking it could be a competitive advantage for us, like our "secret sauce": if it gives us an advantage, why launch it?"

这段笑死。但也说明他们确实知道自己认知领先了，CC 做的是对的事情。

---

最后再回顾一些时间点：

Cursor agent mode 在 24 年 11 月发布，之前是 Composer （跨 codebase 的 "chat edit"）。怀疑在那个时候其实是没有工具调用这个事情的，是只有一些 parse 代码块，因为他们有 "apply edit model" 这种实践。2025-02-19 成为默认模式。

[Claude 3.5 Sonnet](https://www.anthropic.com/news/claude-3-5-sonnet) - 24-06-21 发布。
- 很多 AI 应用创业者（例如 Manus）说在 24 年年底看到了 Sonnet 的 agentic 能力到了够用的临界点。现在回看当时的发布，里面已然在提 agentic coding 了。
- 壳还是很重要的，是承载能力的容器，不然 3.5 Sonnet 一出来大家应该立刻直接用上，而不必等到 CC。
- 3.5 Sonnet 并不是 thinking 模型，说明执行力还是 block agent 能力最久的东西。没有 reasoning 可以先用 prompting 来凑一凑嘛，但干活能力是完全没法激发出来。
