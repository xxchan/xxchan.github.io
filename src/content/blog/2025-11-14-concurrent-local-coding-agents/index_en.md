---
title: Concurrent Local Coding Agents
pubDate: 2025-11-14T00:00:00.000Z
excerpt: AgentDev, toolset and UI for Git Worktrees and agent sessions - My opinionated, more flexible version of Cursor 2.0
categories:
  - AI
toc: true
tocSticky: true
locale: en
translationKey: concurrent-local-coding-agents
---


**This post is translated by [Kimi CLI](https://github.com/MoonshotAI/kimi-cli) (kimi-k2-thinking-turbo) from Chinese.**

> This post assumes readers are already quite familiar with using coding agents for daily development. If you're not, check out some first-hand experience blogs from engineers in the trenches, like [Xuanwo](https://xuanwo.io/) or [Armin](https://lucumr.pocoo.org/).

> This article mainly extends from "being able to work end-to-end with agents" to "how to work in parallel and more scalably." It's not suitable for those who "want more precise control over how agents work" or use cases like "pair programming."

## Remote Agent

For the longest time, I've had two major hypotheses about coding agents (some of which I mentioned in my [Hot Take on Coding Agents](https://xxchan.me/zh/blog/2025-06-08-ai-coding/)):

1. Cursor will release a higher-level UI, not IDE-centric like it is now. When agent capabilities are strong enough, they should take the lead, not me. Just like various "Vibe coding platforms" such as YouWare and Lovable, Cursor should also have a Chat + Preview-centric UI mode.

> After reading ["Inside Cursor"](https://x.com/dotey/status/1986985829701484563) recently, I realized my understanding of Cursor's ambitions might be wrong. They don't seem to be in a hurry to optimize the experience for beginners like YouWare or Lovable.
>
> "Other companies can 'lower the floor' to let beginners write code. Cursor's mission is 'raising the ceiling.'"

2. Remote agents (e.g., Cursor Background Agent, Devin, Codex/Claude Code web, etc.) are great. The benefits are:
   - They have independent working environments, so they can work in parallel without affecting your work
   - With good integration and everything pre-configured, assigning tasks is delightful and effortless (e.g., `@agent` on GitHub/Linear or assigning issues, `@agent` on Slack). They can also bring their own context.

Heavy users of coding agents definitely share this feeling: you really want to "have an agent immediately work on any idea that comes to mind." Coding agents' capabilities are indeed at this level now, especially for web development or any "feature-stacking, manpower-stacking" type of work - they can get it 80-90% right. Ideally, remote agents should achieve this.

But in practice, there are still quite a few problems:

1. **Vendor lock-in**: You have to choose one platform. Each platform has features deeply tied to it, like memory & knowledge base, or repo checkout running dev containers, dev scripts. So there are setup and migration costs. Also, remote agent products mostly require the whole team to adopt them for the best effect, which might be an even bigger problem.

2. **Cost issues**. Coding agents are still quite expensive, and Claude Code leading the way with other model vendors following suit - the model vendors' first-party subscription for local CLI coding agent is currently the most cost-effective approach, much cheaper than token-based billing. Heavy usage can exceed the monthly subscription cost in a single day with token-based billing. Perhaps third-party product companies (especially thoughtful products like Amp) can outperform first-party products in performance, but it's unlikely they'll surpass them in cost-effectiveness. (However, Amp innovatively launched [an ad-supported free tier](https://ampcode.com/news/amp-free), which might have a chance to surpass...)

   For bosses, indie developers, or people working for themselves, they might be willing to spare no expense to chase the best performance, since coding agents are still cheaper than engineers no matter how expensive. But for salaried workers, being willing to spend $20 on a subscription to improve efficiency might already be quite good... (Under the traditional employment model, the impact of increasing company revenue on an engineer's own income is too small.)

3. **Flexibility and "last-mile" problems**. Again, although coding agents are 90% there in capability, they often still fall a bit short. When they can't complete tasks, manual intervention is still more efficient. The experience of manually taking over development on remote agent platforms is often not great. Although many have built IDEs, they can't match the convenience of a locally set-up development environment. So the most convenient code review/rework method is definitely pulling the code locally. If you pull it down, you'll inevitably encounter the "how to maintain multiple workspaces locally" problem. Frequently checking out and switching can also affect efficiency.

## Git Worktrees

Therefore, local concurrent development becomes a very reasonable need: it has the speed of parallel development, the flexibility of local environments, and can use cost-effective first-party CLI coding agents from model vendors.

Git worktrees are one solution to achieve this. [matklad: How I Use Git Worktrees](https://matklad.github.io/2024/07/25/git-worktrees.html) is a good blog post about using worktrees for concurrent development in the "ancient manual coding era":

> TL;DR: consider using worktrees not as a replacement for branches, but as a means to manage concurrency in your tasks. My level of concurrency is:
>
> - `main` for looking at the pristine code,
> - `work` for looking at my code,
> - `review` for looking at someone else's code,
> - `fuzz` for my computer to look at my code,
> - `scratch` for everything else!

In the coding agent era, naturally someone thought of integrating worktrees for agent development. For example, [Xuanwo: How I Vibe Coding?](https://xuanwo.io/2025/06-how-i-vibe-coding-sept-2025-edition/) introduced [xlaude](https://github.com/Xuanwo/xlaude).

Tools like `xlaude` can create a worktree with one command and simultaneously start a CLI coding agent session, which almost achieves the delightful task-assigning experience of remote agents.

There are also products like [Conductor](https://conductor.build/), a local Claude Code client that adds Chat/Code Review UI to CC while also having built-in worktree functionality.

## Cursor 2.0

The just-released [Cursor 2.0: The multi-agent interface](https://cursor.com/blog/2-0#the-multi-agent-interface) is very interesting:

1. They released a local agent feature based on worktrees. This surprised me a bit, since they already have Background Agent. And I think concurrent local agents might be a temporary need. With endgame thinking, they should optimize agent performance to not require human intervention and rework, making local worktrees unnecessary at that point. They also made a feature to "send the same task to different agents" and have them race 🏇. This feature can be used for `pass@k`, improving performance through multiple generations and taking the best one, or intuitively feeling the differences between different models.

2. They released an Agent Chat-first UI. I thought they would, but I didn't expect it to come together with multi-agent.

But based on my recent experience with parallel development, Cursor 2.0 isn't quite usable enough yet. The biggest pain point is that this Agent-first UI seems to be limited to Chat only, and doesn't let me quickly preview results (like the experience on vibe coding platforms). I also can't run commands like `pnpm dev` in a single worktree.

Let me expand on my parallel development experience below.

## Local Concurrent Dev: Practical Experience

A lot of my recent work has been developing web-oriented "feature-stacking" tasks, which are things that coding agents are quite good at.
I frequently find myself having N things in my mind and wanting to assign work to agents simultaneously. In practice, I also discovered the pain points of this development model.

### Stage 0: Chaos

At the very beginning, I mindlessly ran multiple CLI agents directly in the same VSCode workspace to write different features. I just wanted speed.

But even with completely unrelated features being developed in parallel, this approach had big problems:

First, some models or wrappers behave very cautiously - **checking git diff status after each code change** - and changes from other agents would confuse them greatly.
In better cases, they would carefully pick out their own changes to report to you or commit; sometimes they would revert others' changes, thinking something went wrong. But even the former wastes context.

Even stepping back, using less cautious agents for mindless parallel development is painful: the tangled mess of code becomes completely unreviewable. Although it's true that many features can be developed without review, not reviewing and being unreviewable are completely different concepts... When you want to look, you can't understand it, and when problems arise, you can't fix it at all.

Therefore, traditional development wisdom is still very necessary: **split each independent change into a small PR**. This seems like more trouble, but actually saves time in the end. Each PR can be independently verified, and with fewer code changes, a quick glance tells you what's happening (the difficulty of reviewing unrelated code mixed together increases exponentially) - truly **slow is fast**.

### Stage 1: Agents Work Smoothly, but I Become the Bottleneck

I quickly switched to tools like `xlaude` and started using worktrees mindlessly. I'd create a new worktree for even the smallest features.
In practice, if the tools are good enough, this splitting approach isn't troublesome.

Testing showed that the native `xlaude` wasn't good enough for my very aggressive, very frequent parallel development.

For starting a task, `xlaude` works well.
To improve each task's success rate, some extra work is needed, like strongly demanding in `AGENTS.md` that agents must verify in some way after completion.
This is also old news - it's necessary for single-agent development too, but the more concurrent and autonomous you want agents to be, the more you need to polish this development workflow.

After letting agents work smoothly, I found **I became the bottleneck** 🤡 - I couldn't review fast enough.

Following the development process, the main symptoms are:

1. During development, because I had n agent sessions chatting simultaneously, I'd forget what each conversation was doing. I'd even mutter "what was I just doing?" from time to time.

   This is a big problem: frequent context switching actually damages concentration severely. I thought of changing the synchronous collaboration mode with agents to asynchronous: batch up and send multiple tasks at once, then ignore them, and concentrate on validation later.
   In between, I could pick a harder task to focus on without context switching.

2. But after working asynchronously, there would still be cases of "forgetting what this branch was supposed to do." Analogous to looking at a GitHub PR, the PR description is important. Reviewing code diff is also necessary. Local worktree development lacks a page similar to a GitHub PR.

3. Besides looking at code, manually running the service to test it is also a very important part of review, especially for web development - opening the dev server to test is essential.

   > "(Under the AI programming paradigm) the need for verifiable logic gradually transforms into a need for observable results. Ultimately, what's needed isn't to understand the black box by breaking it apart, but to kick the black box and shine a flashlight to see where it flies"
   > https://x.com/ec12edfae2cb221/status/1985525485116465544

4. After validation, the process of merging branches isn't very smooth - there are many steps. For normal development speed, this isn't a big problem, but for our desired usage of **mindlessly having agents create many small PRs**, the impact is significant.

### Stage 2: Build My Own Tools

The biggest change in the agent era is that **execution becomes extremely cheap**, making it extremely easy to build tools that suit you.
`xlaude` provides a very good CLI tool for operating worktrees and agents. Addressing these pain points of mine,
I redeveloped it into my [AgentDev](https://github.com/xxchan/AgentDev).

The development of AgentDev was basically pure vibe coding - I only looked at results, not code.
For small tooling needs, vibe coding feels very competent.

Some of the above requirements are relatively easy to implement:

- Quick code review and reviewing development results: The former can open my most familiar IDE for review, the latter is running commands to start services, so they essentially only need the atomic capability of "running commands in a worktree". So I added `agentdev wt exec <cmd>`. This basic capability can be used in creative ways:

```bash
# In a given worktree
# open dev server
agentdev wt exec pnpm dev
# open VSCode
agentdev wt exec [code|cursor|zed] .
# open GitHub PR in browser
agentdev wt exec gh pr view --web
# open a new / resume an old agent session
agentdev wt exec [codex|claude|kimi] [resume]
```

- Quick merging to mainline: This is also relatively simple, just wrapping some git operations into `agentdev wt merge <worktree>` command, and if needed, can also wrap GitHub CLI `gh` capabilities.

### Stage 3: Still Want a UI

With these capabilities, the validation workflow for individual tasks became much smoother. But the "what was I just doing" problem caused by too many tasks and context switching was still difficult:

- From agent conversations/code changes, it's hard to trace back to the original task.
- Forgetting current progress when resuming work.
- The agent's working process is very verbose - I don't actually want to see the specific process, just the summary.

Everyone can have their own solution to this problem. One idea is some form of scratchpad as a carrier for offloading context. It could be local files, or GitHub/Linear issues, where you only send tasks by pulling issues and update task progress there.
If using agents like Amp that have sharable conversation links, you can even sync the complete agent conversation there.

No matter which solution, I think the essence of this problem is that we still want a different UI - something like a GitHub PR page that can present various information about a task workspace (in our context, an agent's git worktree) in a more condensed and refined way, and preferably manage these tasks.

Remote agents all have their own UI, so this is another major advantage over local agents (though whether it's good or not is uncertain).
`xlaude` also has a TUI dashboard. I initially tried to extend the features I wanted on it, since extending a CLI tool to TUI is the most natural thing. Rewriting it as a GUI, like Electron, felt like too much work (didn't want to spend that much effort on dev tools). But making TUI work well is still quite hard.

Later, I finally realized **Terminal UI is not the optimal solution**.

When Claude Code first came out, many people challenged that using TUI was a big step backward. I think for "collaborating with agents and letting agents develop," chat UI is actually quite sufficient, and developing chat UI in TUI is relatively not that complicated (though CC already has a lot of fancy features), so CC doing this is very appropriate - it can iterate core functions quickly at low cost.

But just like most of an engineer's work time isn't spent writing code, but on review, design, and other work, the UI for these peripheral tasks is complex, so GUI tools like IDEs are needed. The worktree task interface also needs a GUI.

I naturally thought, would the git worktree view in IDEs (like the functionality in VSCode's GitLens plugin) be enough?
But it only solves the function of viewing commits, lacking high-level descriptions of tasks. Switching worktrees to run commands and such isn't flexible enough either.

Two inspirations later made me create AgentDev's worktree UI:

1. Going back to the pain point about task context mentioned earlier, I suddenly thought: if I could see what messages I sent to the agent in the conversation, it seems I could completely know what this task is doing. User messages can almost completely answer "what is the requirement," and they're short, not needing an additional thing like a GitHub PR description.

2. Wanting a GUI can be done as a server-based WebUI, no need for Electron. This inspiration came from [RisingWave embedded dashboard](https://github.com/risingwavelabs/risingwave/tree/main/dashboard): RisingWave embeds packaged frontend web resources and serves APIs in a single binary. My AgentDev CLI can, of course, do the same thing, calling core capabilities through WebUI. Compared to TUI, WebUI is naturally more user-friendly and easier to slap together.

> In fact, the name AgentDev also comes from [RiseDev - RisingWave Devtools](https://zhuanlan.zhihu.com/p/559055842)

So I made something like this:

![agentdev worktree UI](/assets/img/agentdev/agentdev.png)

This is what it looks like now, gradually adding various practical features, but the initial version wasn't much different from now - the core is solving that most fundamental problem: letting you understand at a glance "what was I just doing."

The core design philosophy of this UI is: **the two things you most want to see for an agent worktree are Session (what to do) and git diff (what was actually changed)**.

The git diff UI is nothing special to mention, but the Sessions UI is relatively more interesting.

#### Conversation as Task Description

The most important information source in the UI is the messages users send to agents. My original intention was simple: display user messages in the UI because they are the best task descriptions. The implementation is straightforward - mainstream CLI agents (Claude, Codex, Kimi CLI) all store session history locally, I just need to crawl it.

During crawling, I found that different agents' session formats vary greatly. So I added a unified agent session abstraction layer.
It can be consumed in a unified way on the UI. Supporting new agents in the future only requires implementing one more provider to integrate.

With this list sessions capability, many other interesting things can be done immediately beyond "displaying user messages."

First is support for different detail modes:
- **user only**: Only display user messages (most concise)
- **conversation**: Besides user messages, assistant messages aren't many either, can add them in (usually the last message replying to the user. The middle parts are thinking and tool calls)
- **full**: Display complete transcript (including all tool calls)

And since I've already made the session abstraction, why not make an independent sessions browser? So I made a separate `/sessions` page, displaying all local agent sessions, whether or not they're related to worktrees.

This extends AgentDev's usage scenarios: you can use it as a general agent session browser even without worktrees, reviewing any agent conversation anytime.

> **Disclaimer**: This feature is implemented, but the performance is garbage, completely unoptimized, opening it will be very laggy XD

### Stage 4: Full-featured UI...?

After having AgentDev worktree UI, I no longer lost task context, and the "what was I just doing" pain point was solved.
Combined with `agentdev wt exec`, I can also quickly open IDE for review or take over for fine-tuning.

Once you have a UI, you want to go further and cram in more features:
- I can see conversation history, can I add a ChatUI directly on the UI to resume sessions and continue chatting?
- Can I stitch the `exec` functionality into the UI to directly start `pnpm dev` in the current worktree with one click?
- Can I merge with one click on the UI?
- ...

The "Open VSCode with one click" and "Merge with one click" features were done quickly. But ChatUI and starting commands like `pnpm dev` are still a bit laborious. I even considered whether to integrate a pty in the UI, which feels a bit troublesome.

One time when clicking "Open In VSCode", I suddenly had an epiphany: if I can launch VSCode, I can also directly launch Terminal to run commands! This completely eliminates the need for pty and extra UI work. On the UI, input a command in "Run Command", and it launches Terminal.app, first `cd` to this worktree directory, then run the command - perfect!

![agentdev run command UI](/assets/img/agentdev/run_command.png)

This design solves the need to run dev servers, and can even solve the problem of resuming agent sessions: I have a session ID, which basically allows me to piece together a command-line resume command, then similarly resume in Terminal, no longer needing ChatUI:

![agentdev resume sessions UI](/assets/img/agentdev/resume.png)

At this point, AgentDev has almost become a *Full-featured UI*, able to do anything I want to do in an agent worktree.

## Multi-agent Parallel Racing?

After talking about AgentDev's worktree development, let's return to Cursor 2.0.

Cursor 2.0's feature of "sending the same task to different agents" and having them race is quite interesting. But actually, the first feature I wanted when I thought about forking Xlaude was multi-agent parallel development for the same task...

![agentdev racing](/assets/img/agentdev/agentdev-init.png)

This sounds like a very reasonable need: there are so many coding agents in the market, and so many models, and new champions change every once in a while, so how should I evaluate agent performance and find the best or most suitable one for me? Frequently switching tools actually affects work efficiency quite a bit.

So I wanted to reduce the cost of "vibe eval" by implementing a tool that can assign tasks at low cost and harvest results quickly, integrating it into daily workflows. But the biggest bottleneck for this is indeed the manual validation aspect. To see each agent's work, I made a git diff dashboard on Xlaude's TUI dashboard. But it's still hard to use... so this racing feature was basically gradually abandoned.

As the intensity of daily agent development usage increased, the need to use worktrees to manage tasks became stronger, so I picked up agentdev again and remade it into something completely different. The spirit of "wanting a good UI" was completely inherited though.

In fact, even if I had a good racing UI, I probably still wouldn't love using it. Because no matter what, it's tiring for me to look through each agent's changes myself. And now, I only roughly glance through code changes from single agent development, and won't look closely unless necessary...

When I really want to seriously evaluate agent performance, I might want such a good racing UI again, but for daily development, forget it. There are only one or two that I use most comfortably over time, and I just keep using them.

## Recap of AgentDev

Looking back at AgentDev overall, it's like a hub, or a Swiss Army knife, letting me quickly access the tools I want, rather than creating an all-in-one product experience (like what Cursor 2.0 wants to do). These are two completely different paths.

From a user's perspective, AgentDev's biggest advantage is **flexibility** - it almost **works with any other tools and workflows**. You can seamlessly integrate any IDE, CLI agent, or command-line tool you like. No need to switch from tools you're already comfortable with.

From a developer's perspective, AgentDev's implementation is very minimal, with little development cost or maintenance burden. It essentially uses only a few core atomic capabilities to combine powerful effects:
- Worktree creation and management (thanks to Xlaude)
- Worktree exec
- Sessions list

## Workflow > Tools

Tools only account for a small part of efficiency; workflow and methodology are the big parts. The process of developing AgentDev was the same - more often I thought of a workflow, then developed tools to make that process smoother.

I mentioned some earlier. Overall, my current workflow has these steps:

- **Planning**: After agents greatly improved my output capability, I deeply felt the importance of task management. When any idea can be implemented immediately, I should instead stop to suppress this impulse, spend more time thinking about what's most important and urgent. I started using Linear to manage tasks, recording things when I think of them, then prioritizing before doing them.

  ...In theory, that's how it should be. But in practice, I'm still often driven by urgent needs, or just my desire to "immediately implement an idea," to skip planning and indulge in execution.

- **Task Assignment**: This action is relatively simple and probably not much different from others. Main characteristics include:
  + Because I expect agents to complete tasks end-to-end without much intervention in my parallel development usage, I try to describe my needs in as much detail as possible (I write the prompt I want to send to the agent directly in linear).
  + For complex tasks, I'll talk with the agent about design for a long time before implementation (this process lets the agent carefully explore the relevant codebase).
  + Split into small PRs as much as possible, making them reviewable & mergeable.

- **Validation**: Basically the core features of AgentDev introduced earlier.

The core philosophy needed for parallel development is perhaps: **Attention is the most precious and scarce resource**, and **slow is fast**.

Excessive context switching is very damaging to the brain.

## Conclusion

This article introduces a local parallel agent development framework and workflow based on worktrees, solving a major pain point in agent development: **Post-completion integration**

> "My agents have finished their work, then what?"

My solution to this: Just your traditional dev tools and workflow.

Welcome to use AgentDev or fork it again to make it what you want: https://github.com/xxchan/AgentDev
