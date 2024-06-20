var store = [{
        "title": ".bash_profile 和 .bashrc",
        "excerpt":"虚惊一场 昨天经历了一件十分吓人的事情，差点以为我的 bash 配置文件丢了！好在最后发现是虚惊一场😅。 事情的经过是这样的：由于更新 Rust 下载太慢，我找到了清华镜像站 TUNA 的 Rustup 镜像。以前其实也用过，但是是一次性启用的，这次就想不如直接长期启用了。于是按照指引，输入了下面这条指令： $ echo 'export RUSTUP_DIST_SERVER=https://mirrors.tuna.tsinghua.edu.cn/rustup' &gt;&gt; ~/.bash_profile 默默关闭了 terminal 窗口，又新开了一个。第一眼看着就有点不对劲，也没细想。但当我敲下指令之后，可怕的事情发生了！ $ rustup rustup: command not found $ cat ~/.bash_profile export RUSTUP_DIST_SERVER=https://mirrors.tuna.tsinghua.edu.cn/rustup …………WTF！当时我就慌了，不会吧不会吧，不会我的 .bash_profile 被覆盖了吧？？！这时才回头看指令内容 echo '...' &gt;&gt; ~/.bash_profile，第一反应是：我竟然真的覆盖了 .bash_profile，TUNA 也太坑了吧我要发朋友圈骂一下他…… 大脑宕机了一两分钟，然后稍微冷静下来一点以后搜索起了如何恢复被覆盖的文件（没戏）。过了一会儿突然觉得哪里不对，搜了一下发现 &gt;&gt; 是 append 啊，不会覆盖啊！！（我本当 bash 苦手） 那么配置没了到底是什么问题呢？5 分钟之后，本盲人终于在 ls...","categories": ["CS"],
        "tags": ["Random"],
        "url": "/cs/2020/08/07/bash_profile-and-bashrc.html",
        "teaser": null
      },{
        "title": "Typeclass vs Trait vs Interface/聊聊多态",
        "excerpt":"Disclamer：由于本人才疏学浅，并且本文涉及的话题内容过多，肯定有不全面甚至错误。本文既不学术也不实践，仅为个人阶段的学习理解，写的也比较随意。如有错误欢迎指正。 我的 PL 学习路径是 Python → C++（C with class）→ Coq → Haskell → Rust → Java。学 Haskell 的时候学到了 Typeclass，觉得太妙了，第一次看见有这么好的东西可以用来减少重复代码。不过随即觉得其实和 C++ 的抽象类挺像。Coq 里也有 Typeclass，但我没怎么用过。学 Rust 发现了 Trait，当时就隐隐觉得和 Typeclass 很像，不过表达力貌似要比 Typeclass 弱一些。稍微研究了一下也没完全搞清楚区别，甚至还发现了 Java 里的 Interface。 那么自然就引出了这个问题：Interface、Trait、Typeclass……这些概念之前都有什么联系和区别？ 分别介绍 首先我们先简单介绍/复习一下每个语言中的概念的功能。 Haskell: Typeclass From https://www.seas.upenn.edu/~cis194/spring13/lectures/09-functors.html class Eq a where (==) :: a -&gt; a -&gt;...","categories": ["CS"],
        "tags": ["PL"],
        "url": "/cs/2020/08/17/polymorphism.html",
        "teaser": null
      },{
        "title": "我在美团实习的经历与感想",
        "excerpt":"Disclaimer：本文提及的内容有效范围仅限于后端业务开发岗位，甚至仅限于我所在部门，仅为个人体验与看法，请酌情参考。 上回说到经过了惨烈的春招实习求职之后，我终于获得了美团的实习 offer。现在，这份实习刚刚结束，趁热做个总结吧。 我实习是在单车部门（也就是摩拜）里的营销组，负责单车月卡套餐相关的服务，Java 后端开发。上回也说了，我其实是更想找 infra 的实习，不过仅靠小半年的积累（寒假才开始学），水平确实不太够看。不过虽然和一开始想的不一样，找了一份 Java 业务开发的工作，在自己的观察感受以及和同事、manager 的交流中，也算是另有一番体验和收获。 其实以前我的想法一直是想专心搞技术，觉得业务没意思，Java 没意思。不过最近想法逐渐有点改变。一方面是在大多数情况，对大多数人而言，技术还是要用来解决实际问题的，沉迷于技术要做好孤芳自赏的准备。另一方面，不要人云亦云，成为无脑吹或黑，还是要踏踏实实地学好东西。我觉得从个人的审美角度喜欢某些技术，有理有据的知道一些东西的优点一些东西的缺点，去推广自己喜欢的技术，再或者纯粹的自娱自乐都是没问题的。就是不要产生一些无意义的优越感，成为半壶水的人，不要陷入无聊且无休止的争论之中，成为跟风的小鬼。 收获 总的来说，我觉得实习对我来说是进一步祛魅的过程。虽然我一直以来也并没有对大公司有迷信、崇拜等感情，不过亲自经历过大公司做的事以后，我对工业界项目、大公司的开发流程等东西能够更客观的看待。 大公司的开发流程 实际的企业级项目经历、实际的开发流程可以算是我实习想要学习体验的一大重点。 不同于学校里写代码的随意（虽然我在学校里也并没有多少正经的写代码经历），大公司里确实还是有一套完整的流程。简单的说，有这么一些步骤： （产品经理）提出需求 多端（前后端、不同的服务）在开发专用环境分别开发，分别自测 多端联调 提测（让专门的测试人员测），在测试专用环境测试 在预发布环境（和线上生产环境一样的环境，有的地方可能叫 staging）测试 跑 CI （编译打包、生成镜像、自动化测试等） 上线 大概的情况是这样，不过可能有遗漏，也可能视情况有变化，比如还有需求评审、技术评审会议，有时候可能开发自己提需求（尤其是技术需求），另外顺序可能也会有变化。 具体聊聊其中几个点： 前后端分开 听说只有国内会区分前/后端工程师这样的岗位，国外大厂通常都是只有统一的 software engineer，一个工程师要负责项目 end-to-end 的全流程。相应的，“前后端联调”也是一个中国特色的词，国外貌似没有相应的概念。不分开的好处是负责项目的程序员了解项目的方方面面，还能减少沟通成本；分开自然是各司其职，专业化更强。由于我对前端一窍不通，也不太好评价哪种更好。 开发测试分开 还听说国外大厂如 Facebook，Google，微软等都几乎没有专职的测试（SDET/QA），或者曾经有后来没了，功能测试都是由开发人员自己来完成。 是否需要专职的测试也是一件见仁见智的事情，就不细谈了，说几点我自己感受到的。 专职测试确实可以起到兜底的作用，但是程序员可能也会因此产生侥幸心理，让别人兜底。但自己写的代码还是自己更了解，尤其是遇到技术需求，或者写的一些通用公共函数，开发自己写单元测试应该更加高效与可靠。 提测会 block 项目进展，要等测试人员的排期。不太紧急的需求，尤其是技术需求（比如重构代码）可能会卡很久。虽然也有免测上线的机制，可以绕过测试。 代码质量 我感觉公司项目在代码质量方面要求不是特别高，还有不少提升的空间。有这么一些方面： 单元测试不做要求。众所周知测试不能保证程序的正确性，所以我们就不写测试了（×）。我觉得单元测试仍然是成本较低、效果又不错的检查正确性的方法，而且在一定程度上可以充当粗糙的 specification（测试驱动开发了解一下）。 Code review 有，但不太严格。不过我写了一堆...","categories": ["CS"],
        "tags": ["Random"],
        "url": "/cs/2020/09/02/intern-at-meituan.html",
        "teaser": null
      },{
        "title": "2020 总结",
        "excerpt":"2020 这一年对我有很大影响，但我在技术、知识上长进不大，主要是在心态观念上有不少改变。有人说年纪大了就会更在乎一些虚的东西，更在乎精神上的愉悦（Teahour Terry，GeekPlux），难道我提前进入这个阶段了？ 流水账 一、二月：因为 COVID-19 而蔓延的政治性抑郁没怎么影响到我，度过了最充实的寒假。快乐地看片、刷题、学课、做 project。 三月：开始投简历，纠结未来选择：保研/出国/工作，轻微焦虑。在女朋友家玩猫。 四月：找实习受挫，心态崩盘，大焦虑。 五月：实习有了结果。然后从颓丧中恢复，逐渐走回正轨，学 Java。 六月：水大作业（精神上参加，行动上划水）。开始实习。 七、八月：实习，给一个开源项目 zCore 写文档&amp;测试，看片&amp;游戏，体验社畜生活。 九、十月：挣扎托福。考虑去哪里上学。 十一月：微信读书、写 Haskell。选项目、写文书。 十二月：略 GROUP BY topic 自我认知 &amp; 心态 我自从在知乎看到纳米酱和微调老师两位”躺平学教主“的布道宣传以后就觉得很符合我的价值观，从此以躺平学信徒自居。我觉得所谓躺平学，道理其实很简单，就是：放弃对成功的幻想与执念，认清现实，享受生活，做一些当下能改变的事情。 当然心里怎么想是一回事，当困难挫折临头怎么做，如何应对焦虑又是另一回事了。今年的春招实习对我来说就是这样的考验，整天胡思乱想，控制不住地焦虑。虽然我后来心态一直很平稳，但是当时焦虑的消失很大程度是因为最终取得了一个较为满意的结果，很难说是自己战胜了焦虑，以及下一次遇到这样的挫折时能否坦然面对。所以阅读、思考教给你的道理并不能解决问题，只是工具，必须在实践中面对问题时加以运用。内心的平静尤其如此，需要长期的修炼才能获得。 看到社交媒体上的一些同学苦于焦虑，我有时候会很想分享躺平心得，但又觉得其实没必要，这些事情等毕业后成为社会人应该会自己慢慢看开。这种焦虑其实多出现于重点大学的大学生，之所以焦虑，本质上是没经历过多少实在的挫折毒打，没有认清现实；太顺利也容易太贪心，认为很多东西是自己应得的，所以害怕失去。所以这种焦虑是有点矫情、孩子气的，但我也无意指责，觉得这是年轻人真实存在的问题，只希望能有一个更友好的环境能帮助大家解决问题。 人类物质方面的实际拥有极大地丰富了，随之而来的竟然是一种挥之不去且愈显强烈的“一无所有”的感觉，以及对这种感觉的恐惧。 ——《身份的焦虑》 虽然焦虑来源于现实的系统性问题，内卷的根本原因是资源有限，但我觉得这不是放弃的借口。自我探索，走自己的路差异化生长是唯一的出路。追求稳定可复制的成功，再宽的路都会变得拥挤，并且“成功”以后也未必幸福。什么是手段什么是目的要想清楚，不要把手段当成了目的。参与卷可能会赢，焦虑对成就其实也有积极作用，但是它对我来说代价太过昂贵，是难以消除的情绪杂音，其消极后果难以承担：焦虑的时候我什么事也做不好，并且它还会不断自我强化。这对我来说无异于恶魔的契约。《身份的焦虑》中分析了一些焦虑的来源，让我意识到很多东西并非理所当然拥有，并不属于我，不是我需要，甚至让我觉得继续焦虑有点可笑。 对靠不住的可能性抱有希望，这才是万恶之源。 ——《四叠半神话大系》 高中时，大家总强调努力的重要性，我是个懒狗，不以为意。大学时，大家转而开始强调选择比努力更重要，我信以为然。但我现在的想法又发生了一点变化。大家在强调选择的重要性时，常常用上帝视角复盘以前错误的选择，陷入后悔的漩涡，这明显是一个陷阱，因为它对指导你未来的行动，如何做出选择毫无建设性帮助。是选择重要没错，但是大多数人缺乏在当下做选择的信息量和能力，也不能正确预测未来的发展。重视选择，根据当下的认知做选择就好了，没必要马后炮后悔以前走错了或者酸别人走对了。推论是运气最重要。在这件事上，《四叠半神话大系》给过我很大启发。 不想卷、追求学业事业上的世俗成功，除了成功不可求以外，还因为我觉得工作、技术、财富这些东西不是最重要的事，至少不是唯一重要的事。我讨厌无止境慕强的价值观，拒绝丛林法则。我讨厌”大佬“这种称呼，讨厌“他强我弱”，它会让我觉得：只有大佬有话语权，能得到别人的尊重，不是大佬就不配活着吗？我们都值得世上一切美好的东西，大家应该互相帮助互相学习。我觉得这一年来，我的同理心好像也在变强。 心态的问题也许就是情绪管理的问题。在我自己躺平应对焦虑，和三年多的恋爱的过程中，我学会了正视感性、情绪。接受情绪的存在，并且认为它在一定程度上是与理性独立、不太可控的，这样我更能够解释自己的行为，也更容易接纳自己。以前我看到一些技术、科研很厉害甚至年龄还比我小的人，总会觉得别人太强自己太菜，同时又想打鸡血疯狂学习，也成为那样的强者。但结果每次都是不了了之。这种心态的误区是太贪心，急于求成，是自我认知失调，是太关注他人。最近，我刷社交媒体的频率与热情都明显低了不少，我希望未来能继续把注意力更多地放到自己身上。 自我管理 曾经我是个很随意的人，不记笔记，也从没有什么计划性，但今年却开始逐渐学习实践各种自我管理方式。之所以这么做，主要是因为感受到人类的局限性，发现了自身的一些问题——理解力、记忆力有限，所以需要个人知识管理；事情太多，切换、处理不过来，或者事情太少，目标感缺失，感到迷茫，所以需要目标管理、时间管理……另一方面，我也逐渐认同：一个好的工具可以反过来塑造我们，在提升效率之外甚至能改变我们的工作、思考方式。 大概三月，我的 OneNote 坏了，我也一直苦于 OneNote 同步难的问题，觉得实在不可靠。这时我恰好看到了 Notion 的安利，就欣然试用起来。一开始我用 Notion 记录一切东西，但 Notion 虽然确实强大，几乎可以做一切事情。但它太复杂而且太慢了，因此不适合记录瞬间的想法。我曾觉得...","categories": ["Life"],
        "tags": ["Review"],
        "url": "/life/2021/01/20/2020-review.html",
        "teaser": null
      },{
        "title": "文石 BOOX Note Air 使用感想",
        "excerpt":"Disclaimer: 本文并非客观评测，纯属主观感受。 购买心路历程 很久很久以前开始，我就很想拥有一个（大屏）电纸书。除了电纸书，我又想买个平板。主要有两个需求：看书（尤其是看 pdf），和看片。一个可选的需求是手写记笔记方便。总之，我一直在 YY 能拥有一个好的设备，让我的生产力大大提升，能让我看更多的书和论文。另外能满足大屏看片的娱乐需求也是极好的。 之所以迟迟拖着没买，主要是没有让我完全满意的产品。有这么一些矛盾的点： 电纸书不能看片。 iPad 几乎完美，感觉生产力 Max，但是一直很担心文件传输不方便。另外价格太贵。 安卓平板貌似很适合我的蛇皮需求，但目前能打的好像只有三星和华为，我都不愿意买。如果小米平板出新款的话我可能就直接买了。 因此，我虽然想买，也就是偶尔想想然后就作罢。并且理智还是总会让我怀疑：我真的需要这样一个设备吗？（大胆一点，就是不需要） 现在回顾我当时的实际情况： 我拥有一台 Kindle Paperwhite（我其实几乎不看杂书，长期给女朋友用）。 我还拥有一台 Surface Pro 4，虽然槽点诸多，但是当一个看 pdf、看片、手写笔记的平板绝对很够用了（事实上长期闲置）。 看片、看 pdf 用电脑基本完全够了。 没错，我完全不需要一个额外的设备。 后来，最近几个月我竟然开始看杂书了，主要是用手机上的微信读书。虽然很方便，不过女朋友觉得看多了伤眼睛（我觉得还好），让我买个阅读器。于是我的购物欲再次燃起。这次专注于电纸书选购，主要看了这篇攻略介绍，大致了解了各种产品。 并且我也重新思考了一下我对电纸书的需求： 能用 Kindle 和微信读书，因为不想重复买书以及使用太多书城。不一定非得开放系统，但封闭系统一般都没有这些 App，毕竟都要靠自己书城赚钱……我看到有预装了这些应用的定制版 iReader，不过非官方产品不太敢上车。 能看 pdf，那必然要大屏，所以只考虑 10 寸和 13 寸（仍有点担心 10 寸够不够大）。但是又想要一定的便携性，能随手拿着看，比如通勤的时候看（可能是伪需求）。综合下来（再加上价格因素），最终决定 10 寸。 传文件方便（这个其实基本都没问题吧……）。 我挑选了以下几款： iReader Smart 2，约 2000...","categories": ["Life"],
        "tags": ["Device"],
        "url": "/life/2021/02/11/boox-note-air.html",
        "teaser": null
      },{
        "title": "MIT 6.824 Lab2 Raft 笔记",
        "excerpt":"最近终于自己动手做了一下大名鼎鼎的 MIT 6.824 Lab。因为 6.824 的资料已经有太多了，像介绍 Raft、介绍 Lab 之类的东西就不必再提了，另外 Raft 确实是名副其实的 understandable，算法很容易看懂，而且实现细节在 paper 中都体现得很好（Figure 2 is extremely precise），真的非常难得。不过还是有一些自己的收获和踩坑经历想记录一下，把我思考的过程写出来。 实现思路 尽管 Raft paper 的 Figure 2 算是一个相当详细的 specification 了，但是对我一个工程小白来说，中间有不少“不重要”的实现细节可能还是需要想一想。目前都是自己写的，还没参考过别人的实现，可能不是 best practice，可能会很 naive。 Election timeout 我们需要一个能 reset 的计时器。Lab 指导里建议不要用 golang 的 Timer，说很难用（还不知道为什么，以后学习一下）。 一个自然的想法是：每次 sleep(timeout)，然后检查是否发生事件。严格地说这跟 reset 并不等价，例如 timeout 1s，在 0.1s 和 1.9s 发生事件，严格计时的话是会...","categories": ["CS"],
        "tags": ["system"],
        "url": "/cs/2021/02/24/6.824-raft.html",
        "teaser": null
      },{
        "title": "MIT 6.824 Lab3 KVRaft 笔记",
        "excerpt":"本以为写完 Raft 以后，在 Raft 上搭一个 app 想必是行云流水。事实证明我错了，又是踩了许多坑。 T_T 实现思路 How clients find the cluster leader? 我从这开始的第一步就陷入了纠结。Client 自己要存 leader 是肯定的，但我在考虑当 leader 挂掉以后，怎么快速发现新的 leader，想让 server 直接给 client 返回一个 leader 信息，这样就能让 client 更快地找到 leader，而不需要遍历一遍所有 server。但我的 Raft 实现里并没有存现任 leader。 其实这个问题确实是有意义的，不过我不该一上来就想这个优化，这明显不会是一开始的瓶颈。一开始关注大局，搭起骨架，能跑起来才是最重要的。还是那句老话，premature optimization is the root of all evil。 How do you know when a client...","categories": ["CS"],
        "tags": ["system"],
        "url": "/cs/2021/02/28/6.824-kvraft.html",
        "teaser": null
      },{
        "title": "从接口视角看密码学原语",
        "excerpt":"现代密码学主要是建立在问题的困难性上的：解密相当于求解一个困难的数学问题。这些精妙的构造是人类智慧的精华，要想完全理解他们，需要不少的数学基础。但其实密码学也是模块化的，它提供了各种基础的原语，作为对密码学没那么感兴趣的普通人，尤其是开发者，我们可以先不用完全搞懂里面的数学问题，而是看它提供了什么样的接口，保证了什么性质，这种常识性的理解其实更实用也更重要。 Disclaimer: 因此本文在具体数学构造上会比较简化和不严谨，请勿当真。如有概念理解性错误，请多指正！ 对称加密 假设：双方提前通过可靠方式共享了一个 secret key。 Secret key 同时用来加密和解密。 ┌─────┐ ciphertext=encrypt(secret_key,message)┌─────┐ │Alice├──────────────────────────────────────&gt;│ Bob │ └─────┘ └─────┘ message=decrypt(secret_key,message) 这个相信大家都比较熟了，它最简单，性能也好。但是问题在于如何（在两个人之间）安全地共享 secret key，不能泄露。 非对称加密/公钥加密 假设：发送方提前通过可靠方式获得接收方的 public key。 用 public key 加密，用 private key 解密。 ┌─────┐ ciphertext=encrypt(public_key,message)┌─────┐ │Alice├──────────────────────────────────────&gt;│ Bob │ └─────┘ └─────┘ message=decrypt(private_key,message) 这个大家应该也比较熟了，它的性能比对称加密差很多。它的问题同样是如何安全共享密钥：如何知道 public key 真的属于接收方？攻击者可以拿自己的 public key 给 Alice，谎称自己是 Bob，同时向 Bob...","categories": ["CS"],
        "tags": ["crypto"],
        "url": "/cs/2021/11/13/crypto-interfaces.html",
        "teaser": null
      },{
        "title": "Why is Paxos So Hard to Understand?",
        "excerpt":"Chinese Version In this blog, I will omit practical aspects like performance issues. I will focus on general ideas like basic notions, expressiveness, or \"how to make it possible\" instead of \"how to make it super-fast\". Also, I will try to convey my ideas to readers without any knowledge of...","categories": ["CS"],
        "tags": ["consensus","system"],
        "url": "/cs/2022/02/07/paxos-hard.html",
        "teaser": null
      },{
        "title": "为啥 Paxos 这么难？",
        "excerpt":"English Version 本文中，我将忽略性能等实际问题，主要聊点 general 的东西，如基本概念、表达力，或者说“怎么把它变为可能”，而不是“怎么把它搞得快的飞起”。另外，我会尽量写的让不了解分布式系统或共识的读者也能看懂。不过，如果你已经对 Raft 或 Paxos 之类的共识算法有了概念，那当然还是更好。 我学习共识的经历 这个知乎回答：有没有哪一刻让你感受到了文献作者的恶意？是我第一次听说 Paxos 和共识。当时看了感觉贼逗，同时也就在脑子里留下了 “Paxos 很难” 的初印象。 正好一年前，我在写 MIT 6.824 的 Raft lab。读 Raft 的时候我感觉它挺好懂的，把东西拆成了模块，把每个模块解释得都很清楚。里面还有一章 \"What's wrong with Paxos?\" ，我读的时候又情不自禁地乐了起来。总之，虽然我在 debug 的时候还是有点小困难的，但学 Raft 的认知过程算是很平滑。 上学期，我有个作业要实现 Paxos。我碰巧收藏过这个博客，就拿出来看看。它用很简单的方式解释了 Paxos，我也就按照它讲的实现了（basic）Paxos，没再看论文或者别的文章。作业还要求我们用一个特定的方案实现 multiple decisions，所以我也没看 multi-Paxos 之类的东西。 上学期我还上了 Concurrent Algorithms 和 Distributed Algorithms 两门课。它们都比较理论，都讲了共识，我学的时候感觉共识这东西挺简单的。DA 课上的共识算法很像 Paxos，而且简单到一张 slide...","categories": ["CS"],
        "tags": ["consensus","system"],
        "url": "/cs/2022/02/09/paxos-hard-zh.html",
        "teaser": null
      },{
        "title": "递归改写成迭代的通用方法",
        "excerpt":"递归是像呼吸一般自然的事情。 ——罗宸《谈递归（一）：递归的五种定式》 喜欢刷 LeetCode 或者刚学数据结构的同学一定很熟悉二叉树的各种遍历，包括递归和迭代写法。显然递归写起来更简洁自然，迭代则需要一些 trick，尤其是后序遍历，入栈出栈，连续往左往右什么的，刚学难免有点挠头。总有时候，我们被迫要用非递归的方式实现，比如面试官强力要求，或者要实现迭代器（如 LeetCode 173. 二叉搜索树迭代器（中序遍历））。这可咋办呢？ 有一个通用的方法，可以非常容易地把任意的递归代码重写成迭代的代码，这就好比在呼吸受限的情况下，还可以戴上氧气面罩。这个方法就是：手动模拟递归执行，或者说手动模拟函数调用栈。 函数调用栈 为了理解这个方法，首先需要知道一点计算机的运行原理。其实很好懂，这里简单介绍一下。由于有各种控制语句，还有函数调用，代码的执行不是顺序的，那 CPU 怎么知道下一条指令是什么？答案是维护了一个寄存器 PC (program counter)，指向下一条要执行的指令。对于控制语句，我跳走了就没事了不需要回来了，所以只需要修改 PC，但是函数调用完了还需要回来，这可怎么办呢？答案是每当要进行函数调用时我就保存现场，把 PC 存起来就行了。这就是函数调用栈的作用。 函数调用栈（这个图是瞎画的，仅示意） ----------------------- (many frames ...) ----------------------- (last frame, caller) parameters pc (我最后执行到哪儿了，同时也是下一个函数的返回地址) ----------------------- (current frame, callee) parameters ----------------------- 手动模拟函数调用栈 接下来就进入正题。直接上代码说明问题。 一个一般的递归函数。 def foo(param): # pc = 0 foo(param_1) # pc...","categories": ["CS"],
        "tags": [],
        "url": "/cs/2022/02/15/recursion-to-iteration.html",
        "teaser": null
      },{
        "title": "Profiling 101",
        "excerpt":"以前也浅尝辄止地试图 profile 过，但是被一大堆概念和工具搞的头昏脑涨，全是问题： 什么是 profiling，这个词什么意思？ CPU profiling 和 memory profiling 有什么区别？为什么都是火焰图？ Instrument 又是什么意思？ Golang 的 pprof package 和 pprof tool 有什么区别？ Mac 的 XCode Instruments 可以比较傻瓜式地 profile，但是没有 flamegraph，怎么办？ 然后平时要么没有需求用不到 profiling，要么遇到问题很急，就病急乱投医，各种工具瞎试一通，最后不了了之，也没搞懂在干什么。 这两天在尝试用 profiling 工具查内存问题，虽然最后问题没让我看出来，但是这回终于基本搞懂他们到底是在干什么了，趁热打铁水一篇博客记录一下。 本文不包括：如何根据 profiling 的结果来进行性能优化（这是最终目标，需要大量经验），profiling 的各种具体实现技术。 本文主要科普基本概念，理解 profiling 在干什么，这算是一切后续工作的前提。因此本文目标读者是像我一样可能听说过一些，但是没怎么上手搞过 profiling，对基本概念也不太理解的朋友。 TL; DR Profiling 其实包括分开的两个步骤： 收集程序运行的信息 分析/展示信息 Flamegraph 只是一种数据可视化方法，属于 profiling...","categories": ["CS"],
        "tags": [],
        "url": "/cs/2023/02/08/profiling-101.html",
        "teaser": null
      },{
        "title": "我如何动动小手就让 CI 时间减少了 10 分钟",
        "excerpt":"English version of this post 虽然经常有逸闻抱怨 Rust 编译速度臭名昭著地慢，但我们的项目 RisingWave 在经过前人比如（skyzh，BugenZhao）的一些努力后，编译速度并不算慢，特别是我自从用上 M1 的 Macbook Pro 后，编译速度根本不是问题，全量 debug 编译也就两三分钟。 然而随着时间推移，CI 里加了越来越多的东西，越来越臃肿了。现在 main workflow 需要大概 40min，PR workflow 需要大概 25min30s。虽然并不算特别慢，但是可以体感到比以前变慢了不少。 于是我前两天心血来潮，决定花点时间研究一下能不能再优化一点编译速度。 令我非常震惊的是，没想到存在着一些非常简单的方法，动动小手就产生了惊人的成效。感觉完全可以用 low-hanging fruits、silver bullet 甚至是 free lunch 来形容🤯。 P.S. 很推荐 matklad（IntelliJ Rust 和 rust-analyzer 的原作者）的 blog： Fast Rust Builds Delete Cargo Integration Tests...","categories": ["CS"],
        "tags": [],
        "url": "/cs/2023/02/11/optimize-rust-comptime.html",
        "teaser": null
      },{
        "title": "Stupidly effective ways to optimize Rust compile time",
        "excerpt":"本文的中文版 Although there are often complaints saying Rust's compilation speed is notorious slow, our project RisingWave is not very slow to compile, especially since previously contributors like (skyzh, BugenZhao) have put in a lot of effort. After using an M1 MacBook Pro, compiling is not a problem at all. A...","categories": ["CS"],
        "tags": [],
        "url": "/cs/2023/02/17/optimize-rust-comptime-en.html",
        "teaser": null
      },{
        "title": "New site for This Week in RisingWave",
        "excerpt":"This Week in RisingWave is now migrated to a new dedicated site: this-week-in-risingwave.vercel.app. By the way, xxchan's blog also has a new domain name: xxchan.me. The old domain name xxchan.github.io should still work. Please tell me if any of the links or other things like RSS are broken! Thanks! 🥰...","categories": ["This-Week-in-RisingWave"],
        "tags": [],
        "url": "/this-week-in-risingwave/2023/04/02/twirw-migration.html",
        "teaser": null
      },{
        "title": "Why English Quote (') looks bad in my blog?",
        "excerpt":"As you might have noticed, I write blogs in both Chinese and English. My approach to multilingual blogs is straightforward and somewhat brute-force: I simply put them together without a language switcher or any filtering. Admittedly, I haven't figured out how to implement this in Jekyll due to a lack...","categories": ["Misc"],
        "tags": [],
        "url": "/misc/2024/06/12/quotation-mark.html",
        "teaser": null
      }]
