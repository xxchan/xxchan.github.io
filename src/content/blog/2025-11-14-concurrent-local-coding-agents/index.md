---
title: Concurrent Local Coding Agents
pubDate: 2025-11-14T00:00:00.000Z
excerpt: AgentDev, toolset and UI for Git Worktrees and agent sessions - My opinionated, more flexible version of Cursor 2.0
categories:
  - AI
toc: true
tocSticky: true
locale: zh
translationKey: concurrent-local-coding-agents
---

> P.S.1 本文假设读者对日常使用 coding agent 进行开发已经比较熟悉
> 如果不熟悉，可以看看一些一线工程师分享真实一手经验的 blog，如 [Xuanwo](https://xuanwo.io/)、[Armin](https://lucumr.pocoo.org/)。

> P.S.2 本文主要是从已经能完全 end-to-end 用 agent 干活的情况延伸至如何并行干活，更 scalable
> 并不适合“希望更精准地控制 agent 如何干活”，或者类似“pair programming”等用法

## Remote Agent

一直以来，我对 coding agent 有比较大的两个判断（在[锐评 Coding Agent](https://xxchan.me/zh/blog/2025-06-08-ai-coding/) 一文中也提过一些）：
1. Cursor 会出更 high-level 的 UI，而不是像现在的以 IDE 为中心。当 agent 能力足够强，应该是它来主导，而不是我。
    就像 YouWare, Lovable 等各种 "Vibe coding platform" 一样，Cursor 也该出一个 Chat + Preview 为中心的 UI 模式。
> P.S. 最近看了[《Inside Cursor》](https://x.com/dotey/status/1986985829701484563)这篇文章，发现我对 Cursor 野心的理解似乎不对，他们似乎并不急着像 YouWare, Lovable 一样去急着优化小白的体验。
> 
> “别的公司可以去“降低地板”（Lower the floor），让小白也能写代码。而 Cursor 的使命是 “提高天花板” (Raising the ceiling)。”
2. Remote agent（e.g., Cursor Background Agent, Devin, Codex/Claude Code web, ...）是个好东西。它好在:
    - 有独立的工作环境，于是可以并行工作，并且不影响你的工作
    - 在集成很好，一切都配置好了的情况下，发任务这件事很爽，很轻松（例如在 GitHub/Linear 上 `@agent` 或 assign issue，在 slack 上 `@agent`）。它还能自带 context。

Coding agent 的重度使用者肯定都深有同感：很想要“一想到一个活，就无脑让 agent 去干”。现在 coding agent 的水平确实已经是这样了，特别是对 web 开发或者任意“堆功能，堆人力”性质的活，能干个八九不离十。理想中，remote agent 应该能做到这件事。

但实际上用起来还是有不少问题：
1. Vendor lock-in，你要从某一个平台中选一个。各个平台都有一些和平台深度绑定的功能，例如 memory & knowledge base，又例如 repo checkout 跑的 dev container、dev script。所以会有 setup 以及迁移成本。另外 remote agent 产品大多是需要整个团队一起 adopt 效果才会更好，这可能是更大的问题。
2. 成本问题。Coding agent 还是很贵的，而 Claude Code 率先推出，其他各家都在跟进的模型厂商第一方订阅 local CLI coding agent 是目前性价比最高的方式，成本远比 token 计费便宜。用的猛的话一天的用量按 token 计费就能超过月订阅费。或许第三方产品公司（特别是像 Amp 这样的很有自己思考的产品）有能力在性能上比第一方产品做得更好，但是性价比是不太可能超越。（然而 Amp 创新地推出了[在免费版中加广告的模式](https://ampcode.com/news/amp-free)，说不定有望超越……）

    对于老板，独立开发者等给自己打工的人，可能会愿意不计成本地追求最好的性能，毕竟 coding agent 再怎么贵也比 engineer 便宜。但对于打工人来说，能愿意花 20 刀订阅来提升效率可能就很不错了……（按照传统的雇佣模式，提升公司收入对 engineer 自己的收入的影响太小了。）
3. Flexibility 和“最后一公里”问题。还是那句话，coding agent 的水平虽然已经 90% 到位了，但还是经常差点意思。在完成不了任务的时候，还是得人工接入手动改来的高效。在 remote agent 平台上往往人工接手开发的体验不太好，虽然很多也都做了 IDE，但再怎么也没有本地 setup 好的开发环境顺手。所以最顺手的 code review / 返工方式肯定是把代码拉到本地。如果要拉下来，那难免会遇到“如何在本地维护多个工作区”的问题。经常 checkout 切换的话也会挺影响效率。

## Git Worktrees

因此本地 concurrent development 成了一个非常合理的需求：既具备了并行开发的速度，又有本地的灵活性，还能用上性价比高的模型第一方 CLI coding agent。

Git worktree 是能做到这件事的一个方案。[matklad: How I Use Git Worktrees](https://matklad.github.io/2024/07/25/git-worktrees.html) 是一篇不错的在古法手工编程时代使用 worktree 来并发开发的博文
> TL;DR: consider using worktrees not as a replacement for branches, but as a means to manage concurrency in your tasks. My level of concurrency is:
> 
> - `main` for looking at the pristine code,
> - `work` for looking at my code,
> - `review` for looking at someone else’s code,
> - `fuzz` for my computer to look at my code,
> - `scratch` for everything else!

Coding agent 时代，自然有人想到为 agent 开发集成上 worktree。例如 [Xuanwo: How I Vibe Coding?](https://xuanwo.io/2025/06-how-i-vibe-coding-sept-2025-edition/) 中介绍的 [xlaude](https://github.com/Xuanwo/xlaude)。

`xlaude` 这样的 tool 可以做到一个命令创建一个 worktree，同时启动 CLI coding agent session，这就几乎做到了 remote agent
的那种随心所欲发任务的体验。

也有类似于 [Conductor](https://conductor.build/) 的产品，本地的 Claude Code 客户端，给 CC 增加 Chat/Code Review UI 的同时也自带了 worktree 功能。

## Cursor 2.0

刚刚发布的 [Cursor 2.0: The multi-agent interface](https://cursor.com/blog/2-0#the-multi-agent-interface) 非常有意思：
1. 出了基于 worktree 的 local agent 功能。这让我有点意外，因为他们毕竟有 Background Agent。并且我认为 concurrent local agent 可能是个暂时性的需求，按照终局思维，应该优化 agent 性能到不需要人的干预返工，那时候也不需要什么 local worktree 了。他们还做了“给不同的 agent 发同一个任务”，让他们赛马 🏇。这个功能可以用来 `pass@k`，通过多次生成取最好的来提升性能，也可以用来直观感受不同模型的区别。
2. 出了 Agent Chat first 的 UI。我想到他们会出，但是没想到会是和 multi agent 一起出。

但根据我这段时间的并行开发经历，Cursor 2.0 目前还不够好用。最大的痛点是这 Agent first UI 似乎仅限于 Chat，并不能让我很快地 preview 结果（像 vibe coding 平台那样的体验）。我也没法在单个 worktree 里运行如 `pnpm dev` 这样的命令。

下面就展开讲讲我的并行开发经历。

## Local Concurrent Dev 实战经历

我最近的工作有不少是开发偏 web 的“堆功能”的事情，算是 coding agent 比较擅长的事情了。
我频繁地会出现脑子里有 N 个事情，想同时给 agent 派活的情况。在实践的过程中，我也发现了这种开发模式的痛点。

### Stage 0: 一片混乱

在最开始，我无脑在同一个 VSCode 工作区，直接开多个 CLI agent，写不同的功能。我只想要快。但即便是完全不相干的功能并行开发，这么做也有很大问题：

首先，有的模型或者壳的行为会非常谨慎地每次改完代码后检查 git diff 状态，然后其他 agent 的改动就会让它非常 confused，
比较好的情况是它会把自己的改动精心挑出来向你汇报，但有时他会 revert 别人的改动，觉得是出错了。
但就算是前者，其实也是浪费了 agent 的 context。

但即使再退一步，用没有这么谨慎的 agent 无脑并行开发也很痛苦：混成一坨的代码，完全无法 review。
虽然话是说很多 feature 开发出来是完全可以不 review 的。但是不 review 和不 reviewable 就完全是两个概念了……
会变成想看的时候也看不懂，出了问题想改则是完全没法改。

因此，传统开发智慧还是非常有必要的：每个独立的改动拆分成一个小 PR。
这看似麻烦，实际上最终更省时间。每个 PR 都可以独立验证，并且代码改动少，扫一眼就能知道在干嘛（不相干的代码混在一起的 review 难度是指数上升的）——真是**慢就是快**了。


### Stage 1: Agent 开发的很爽，但我成了瓶颈

我很快切换到 `xlaude` 这样的工具，开始无脑使用 worktree 来开发。再小的功能也要新建一个 worktree 开发。
实际上如果工具足够好用，这种拆分的方式并不会很麻烦。

实测下来原生的 `xlaude` 对于我这样非常激进非常频繁地并行开发而言还是不够好用。

对于开始一个 task 而言，`xlaude` 是挺好用的。
为了提升每个 task 完成的成功率，需要做一些例如在 `AGENTS.md` 里强烈要求 agent 完成工作后必须以某种方式 verify 的事，
这也算是老生常谈了，对普通的单 agent 开发也是有必要的，但越是想 more concurrent, more autonomous agents，就越得
把这个开发工作流打磨好。

在 worktree 场景，有一个小问题是每个 worktree 创建的时候都是干净的环境，因此需要干一些 `pnpm install`, 或者创建 `.env`
之类的事。这可以通过 git checkout hook 来实现。

让 agent 爽爽开发以后，我发现我成了瓶颈，review 不过来了。按照开发的流程，主要有下面这些症状：
1. 在开发中，因为同时开了 n 个 agent session 同时聊，我会忘了每个对话是在干什么。我甚至时不时会冒出来一句“我刚在干啥来着”。
    这问题很大。本质上是频繁 context switch 是非常损害注意力的。可以把和 agent 的同步协作模式改成异步协作：攒批一次发多个任务，然后就不要管了，过一段时间集中验收。
    在中间这段时间里，可以选一个更难的任务专注在上面，不 context switch。
2. 但异步工作以后，还是会有“忘了这个分支要做什么”的情况。看一个 GitHub PR 的时候，PR description 很重要。Review code diff 当然
    也是必要的。本地 worktree 开发缺一个类似 GitHub PR 的页面。
3. 除了看代码以外，自己人工把服务跑起来测一测也是 review 非常重要的一环，特别是对于 web 开发，打开 dev server 测一下很需要。
    > 逻辑可验证逐渐转变为结果可观测的需求，最终需要的不是拆开理解黑盒，而是我踢一脚黑盒能打开手电筒看看它飞哪里了
   >  https://x.com/ec12edfae2cb221/status/1985525485116465544
4. 验收完，合并分支的过程不是很丝滑，步骤比较多。对于正常速度的开发不是多大问题，但是对于我们想要**无脑让 agent 创建非常多小 PR 来开发**的用法就影响非常大了。

### Stage 2: Build My Own Tools

Agent 时代的最大变化就是 **execution becomes extremely cheap**, 打造适合自己的工具变得极其容易。
`xclaude` 提供了一个非常好的操作 worktree 和 agent 的能力的 CLI 工具，针对我的这些痛点，
我对它二次开发成了我的 AgentDev。AgentDev 基本上是纯 vibe coding，我只看结果，不看代码。
对于小工具类需求，vibe coding 感觉非常胜任。

上面的有一些需求是相对比较好做的：
- 快速 review 代码，以及 review 开发结果：前者可以打开我最熟悉的 IDE review，后者是运行命令启动一下服务，于是他们本质上都只需要“在 worktree 中运行命令”这一个原子能力。所以我增加了 `agentdev wt exec <cmd>`，这个基础能力可以玩出花来：
```bash
# In a given worktree
# open dev server
agentdev wt exec pnpm dev
# open VSCode
agentdev wt exec [code|cursor|zed] .
# open GitHub PR in browser
agentdev wt exec gh pr view --web
# open a new / resume an old agent session
agentdev wt exec [codex|claude|kimi]
```
- 快速合并代码到主线：这也比较简单，只需要把一些 git 操作封装成 `agentdev wt merge <worktree>` 命令，如果有需要，还可以额外封装 GitHub CLI `gh` 的能力进去。

### Stage 3: Still Want a UI

有了这些能力以后，对单个任务的验收流程丝滑了许多。不过由于任务太多、context switch 而导致的“我刚在干啥来着”还是有点难办：
- 从 agent 对话 / 代码改动中，很难关联回原始的任务。
- Resume 工作的时候忘记了当前的进度。
- Agent 工作过程非常冗长，它的工作具体过程我其实不想看，只想看总结。

这个问题每个人可以有自己的解法。一个 idea 是某种形式的 scratchpad 作为 offload context 的载体，可以是本地文件，也可以是无脑用 GitHub/Linear issue，只通过拉 issue 的方式发 task，并把任务进度更新过去。
如果用 Amp 这种有 sharable conversion link 的 agent，甚至还可以把完整的 agent 对话同步过去。

无论哪种解法，我觉得这个问题的本质是我们还是想要一个不一样的 UI，一个类似 GitHub PR 页面的东西，它能够用更浓缩精炼地方式呈现一个任务工作区（在我们语境下，就是 agent 工作的 git worktree）的各种信息，最好还能管理这些任务。

Remote agent 都会有自己的 UI，所以这算另一大有事（虽然好不好用不一定）。
`xlaude` 也有一个 TUI dashboard，我一开始试图在上面扩展我想要的功能，毕竟 CLI 工具延伸到 TUI 是最自然的，
要是改造成 GUI，比如 electron，总觉得会比较累（并不想在开发工具上花那么大精力）。但总觉得不够好用。

后来，我终于觉得 Terminal UI 不是最优解。在 Claude Code 刚出的时候，很多人 challenge 它用 TUI 是一大倒退。我觉得对“和 agent 协作，让 agent 开发”这件事而言， chat UI 其实挺够用的，并且 TUI 开发 chat UI 相对而言也没多复杂，所以 CC 这么做很合适，可以低成本地快速迭代核心功能。
但是就像 engineer 工作的大部分时间不是在写代码，而是 review、design 等工作，这些外围工作的 UI 是复杂的，所以会需要 IDE 等 GUI 工具。Worktree 工作任务的界面最好也需要一个 GUI。

我自然想到，那 IDE 中的 git worktree view（如 VSCode 中的 GitLens 插件的功能）是不是就够用了？
但它只解决了看 commit 的功能，缺乏对任务的 high level 描述。切换 worktree 运行命令之类的事情也不够灵活。

后来的两个灵感让我做出了 AgentDev 的 worktree UI：
1. 重新回到我前面说的关于任务 context 的痛点，我突然想到，其实如果能让我看到我在对话中给 agent 发的消息，好像就能完全知道这个任务是在干什么了。User messages 几乎可以完全覆盖“需求是什么”，并且长度又很短，并不需要再有一个额外的像 GitHub PR description 之类的东西了。
2. 想要 GUI 可以用 server 的形式做 WebUI，不必上 electron。这个灵感来自于 [RisingWave embedded dashboard](https://github.com/risingwavelabs/risingwave/tree/main/dashboard)：RisingWave 一个 single binary 里同时嵌入了打包的前端 web 资源，以及 serve api。那我 AgentDev CLI 当然也可以做同样的事，通过 WebUI 来调用核心能力。相比 TUI，WebUI 自然是又好用，糊起来又容易。

> 事实上，AgentDev 这个名字也来源于 [RiseDev - RisingWave Devtools](https://zhuanlan.zhihu.com/p/559055842)

于是我弄出了个这么个东西：

![agentdev worktree UI](/assets/img/agentdev/agentdev.png)

这是它现在的样子，已经逐渐加入了各种实用功能，但它最初的版本其实已经和现在差别不大——核心就是解决那个最根本的问题：让你一眼就能看明白"我刚才在干什么"。

这个 UI 最核心的设计思想是：**一个 agent worktree 最想看的就是两种信息——Session（要做什么）和 git diff（实际改了什么）**。

Git diff UI 其实没啥好提的，Sessions UI 相对比较有意思。

#### 对话即任务描述

UI 中最重要的信息来源就是用户发给 agent 的消息。我的初衷很简单：要在 UI 里展示 user messages，因为它本身就是最好的任务描述。实现上很直接——主流 CLI agent（Claude、Codex、Kimi CLI）都会把 Session history 存在本地，我只要爬取出来就行。

爬取的过程中发现，不同 agent 的 session 格式差异很大。于是我增加了一个统一的 agent 实现了一个 agent session 抽象层。
在 UI 上可以用统一的方式消费。未来要支持新的 agent 也只需要多实现一种 provider 就能接入。

有了这个 list sessions 的能力以后，其实就可以在“展示 user messages”之外还能做很多有意思的事情。

首先是不同 detail mode 的支持：
- **user_only**: 只展示用户消息（最简洁）
- **conversation**: 在 user message 之外，其实 assistant message 也不是很多，可以加进来（通常就是最后一条回复用户的消息。中间都是 thinking 和 tool call）
- **full**: 展示完整 transcript（包含所有 tool calls）

并且既然已经做了 session 抽象，为什么不做一个独立的 sessions browser 呢？于是我有做了一个单独的 `/sessions` 页面，展示所有本地 agent sessions，不管是否与 worktree 相关。这其实延伸了 AgentDev 的使用场景：你不仅可以用它来管理工作区，还可以把它当做一个通用的 agent session 浏览器，随时回顾任何一次 agent 对话。

> **Disclaimer**: 这个功能是做出来了，不过性能有点垃圾，完全没优化，打开会很卡 XD

### Stage 4: Full-featured UI...?

有了 AgentDev worktree UI 以后，确实再也没有丢失任务上下文，忘了在干嘛的痛点了。
配合上 `agentdev wt exec`，也可以快速打开 IDE review 或者接管微调。

但是一旦有了 UI，就又想更近一步，再多塞点功能进来：
- 我能看到对话历史了，那能不能直接在 UI 上增加一个 ChatUI，resume session 继续聊？
- 能不能把 `exec` 功能缝合到 UI 上来，我直接一键在当前 review 的 worktree 里启动 `pnpm dev`？
- 能不能在 UI 上一键 merge？
- ...

一键打开 VSCode 和一键 merge 的功能一下就搞出来了。但 ChatUI 和启动 `pnpm dev` 这种需要长时间运行的命令还是有点费劲的。我甚至考虑是不是要在 UI 里集成一个 pty，想想就有点麻烦。

在某次点击 “Open In VSCode” 的时候，我突然灵光一现：我能启动 VSCode，那也能直接启动 Terminal 来运行命令啊！这样完全就不需要 pty 什么的了，UI 也不需要额外做了。在 UI 上 “Run Command” 输入一个命令，就启动 Terminal.app 首先 `cd` 到这个 worktree 目录，然后运行命令，完美！

![agentdev run command UI](/assets/img/agentdev/run_command.png)


这个设计解决了运行 dev server 的需求，甚至还可以用来解决 resume agent session 的问题：我有一个 session ID，基本上就能拼出一个命令行的 resume 命令，那同样在 Terminal 里 resume 就行了，不再需要 ChatUI：

![agentdev resume sessions UI](/assets/img/agentdev/resume.png)

至此，AgentDev 好像就几乎成为了一个 *Full-featured UI*，能做我想在一个 agent worktree 里做的任何事了。

## Multi-agent 并行赛马？

Cursor 2.0 “给不同的 agent 发同一个任务”，让他们赛马这个功能挺有意思。但其实回到最初，我想要 fork Xlaude 魔改的初心，
做的第一个功能，其实就是 multi agent 并行开发同一个任务……

![agentdev 赛马](/assets/img/agentdev/agentdev-init.png)

这是个听起来非常合理的需求：市场有太多的 coding agent，以及太多的模型，并且新王一段时间就会换一个，
那我到底应该如何评估 agent 的性能，找出最好用或者最适合我的那款呢？经常切换工具其实挺影响工作效率。

因此我就想通过实现一个能够低成本并行发任务，以及快速收菜的工具来降低 “vibe eval” 的成本，能够融入日常
工作流中。但这件事最大的瓶颈果然还是在人工验收环节。为了能看到每个 agent 的工作，我在 Xlaude 的 TUI dashboard
上搞了个 git diff dashboard。但确实是很难用……所以这个赛马功能基本上是逐渐废弃了。

但是随着日常使用 agent 开发的强度变高，就回到一开始说的，出现了想用 worktree 来管理任务的需求，于是又捡起了 agentdev
重新做出了完全不一样的东西。但是“想要一个好的 UI”的精神倒是完全继承下来了。

事实上，假设我有一个很好的赛马 UI，我可能还是不会很爱用，因为再怎么样，我得每个 agent 的改动都自己看一遍，
这是很累的。
而现在，我单个 agent 开发的代码改动也就是大体扫一眼，如非必要不会细看……

在我真的想严肃评估 agent 性能的时候，可能会重新想要这样的好的赛马 UI，但日常开发中还是算了，一段时间用的最趁手
的基本上就那么一两个，就一直用就行了。

## Recap of AgentDev

至此整体回顾 AgentDev，它像是一个中枢，或是一个瑞士军刀，让我能快速访问到我想要的工具，而不是打造出一个 all-in-on 的
产品体验（如 Cursor 2.0 想做的），这是两条完全不一样的道路。

从使用者的角度，AgentDev 最大的优势就是**灵活**，它几乎**兼容任何其他工具和工作流**。你可以无缝衔接任何你喜欢的 IDE、CLI agent、或命令行工具。不需要你切换已经顺手的工具。

从开发者的角度，AgentDev 的实现非常极简，没有太多开发成本和维护负担。它本质上只用了很少几个核心原子能力，就组合出了强大的效果：
- Worktree 创建和管理（thanks to Xlaude）
- Worktree exec
- Sessions list



## Workflow > 工具

工具其实只占效率的很小一部分，工作流以及方法论才是大头。开发 AgentDev 的过程也是这样，更多是我想到一个工作流，然后
开发出工具让这个流程更顺滑。

前文中也提到了一些，总的来说，我现在的工作流大概有这么几步：
- **planning**: 在 agent 让我的产出能力大大提升之后，我深刻感觉到了任务管理的重要性。当任何 idea 都可以立刻实现，
  我反而应该停下来抑制住这种冲动，要花更多时间思考什么是最重要和紧急的。我开始用 Linear 管理任务，想到一个事情要做先
  记录下来，然后排优先级再做……理论上是这样，但在实践中，依然经常会被很急的需求，或者只是我很想立刻实现一个 idea 的欲望
  推动着不做 planning。
- **派活**: 这个动作相对简单，和其他人区别应该也不大。主要特点包括：
  + 因为我的并行开发用法中期望 agent 全程 end to end 完成任务，而不需要我干涉太多，我会尽量事无巨细地描述我的需求（我会直接在 linear 中写想要发给 agent 的 prompt）。
  + 对于复杂的任务，我会在实现前和 agent 聊很久 design（这个过程会让 agent 去仔细地 explore 相关的 codebase）。
  + 尽可能拆分小 PR，快速 merge
- **验收**: 基本就是前文介绍的 AgentDev 的核心功能了。


并行开发需要的最核心哲学或许就是：**注意力是最宝贵和稀缺的资源**，也是一种**慢就是快**。
过度 context switch 非常损害大脑。

## 总结

本文介绍了一种基于 worktree 的 local parallel agent 开发框架和工作流，解决了 agent 开发中的一大痛点：Post-completion integration: “我的 agents 们活干完了，然后呢？”

我对此的解法：Just your traditional dev tools and workflow。


欢迎使用或再次 fork 魔改成你想要的样子
