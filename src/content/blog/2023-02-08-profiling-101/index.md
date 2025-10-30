---
title: Profiling 101
description: A beginner's guide to profiling
excerpt: A beginner's guide to profiling
pubDate: 2023-02-08T00:00:00.000Z
categories:
  - CS
toc: true
tocLabel: 目录
tocSticky: true
locale: en
translationKey: profiling-101
---

以前也浅尝辄止地试图 profile 过，但是被一大堆概念和工具搞的头昏脑涨，全是问题：
- 什么是 profiling，这个词什么意思？
- CPU profiling 和 memory profiling 有什么区别？为什么都是火焰图？
- Instrument 又是什么意思？
- Golang 的 pprof package 和 pprof tool 有什么区别？
- Mac 的 XCode Instruments 可以比较傻瓜式地 profile，但是没有 flamegraph，怎么办？

然后平时要么没有需求用不到 profiling，要么遇到问题很急，就病急乱投医，各种工具瞎试一通，最后不了了之，也没搞懂在干什么。

这两天在尝试用 profiling 工具查内存问题，虽然最后问题没让我看出来，但是这回终于基本搞懂他们到底是在干什么了，趁热打铁水一篇博客记录一下。

本文不包括：如何根据 profiling 的结果来进行性能优化（这是最终目标，需要大量经验），profiling 的各种具体实现技术。

本文主要科普基本概念，理解 profiling 在干什么，这算是一切后续工作的前提。因此本文目标读者是像我一样可能听说过一些，但是没怎么上手搞过 profiling，对基本概念也不太理解的朋友。

## TL; DR

Profiling 其实包括*分开*的两个步骤：
1. 收集程序运行的信息
2. 分析/展示信息

Flamegraph 只是一种数据可视化方法，属于 profiling 的第二步。它不包括第一步收集信息，profiling 也可以不用它来展示信息。

## 什么是 flamegraph

就算不太懂 profiling 原理或者实践，看到这样的火焰图也会觉得非常直观，基本上能猜个大概是什么意思。

![Example](https://camo.githubusercontent.com/eecfbf00e6cc5baf6ae2b66283573d765f8fe29f1d3df10f4ce3423d942c0af3/687474703a2f2f7777772e6272656e64616e67726567672e636f6d2f466c616d654772617068732f6370752d626173682d666c616d6567726170682e737667)

这一定程度上导致对门外汉来说提到 profiling 和 flamegraph 就觉得是绑定在一起的两个概念，但实际上不是。

其实它只是一种可视化工具，只负责展示信息。它的 input 可以是任何长得像 **stacktrace** 的东西。它的主要优点也正是可以明了地看出 stacktrace 和占比。

**[brendangregg/FlameGraph](https://github.com/brendangregg/FlameGraph)** 这个 repo 作者 Brendan Gregg 是 flamegraph 的发明者。这个 repo 里包含了一系列（perl 写的）flamegraph 工具。里面包括：
- `flamegraph.pl` 是最重要的用来生成 flamegraph SVG 图片的工具
- `stackcollapse-*.pl` 系列可以把各种格式的 stacktrace 转换成 `flamegraph.pl` 的 input 格式

所以实际上我手写一个 `flamegraph.pl` 的输入格式的东西，也可以生成一个 flamegraph。例如这样：

```
a 1
a;b 0
a;b;c 1
a;b;c;e 1.5
a;b;d 2
```

![flamegraph.svg](/assets/img/flamegraph.svg)

上面这个例子应该很好地解释了 flamegraph 的原理。每一行是一个函数的完整的调用栈，最后一个数字是它*自己*的（时间/内存/...）占用数量。

### 把 stacktrace 转换成 flamegraph

现在很多 profiling 工具应该都可以直接生成 flamegraph，如果不行的话，可以自己想办法弄个脚本转换一下。例如 XCode Instruments 其实可以导出（它里面叫 Deep Copy... 并且还需要先选中才好导）这样的 stacktrace 文本（内存，CPU 什么的都可以导） ：

```
# Allocation
Bytes Used	Count		Symbol Name
   9.75 KB     100.0%	56	 	_pthread_start
   9.75 KB     100.0%	56	 	 std::sys::unix::thread::Thread::new::thread_start::h8134a9cc26f143c2
...

# Time Profiler
Weight	Self Weight		Symbol Name
74.00 ms  100.0%	0 s	 	thread_start
74.00 ms  100.0%	0 s	 	 _pthread_start
74.00 ms  100.0%	0 s	 	  std::sys::unix::thread::Thread::new::thread_start::h8134a9cc26f143c2
...

# CPU Profiler
Weight	Self Weight		Symbol Name
34.35 Mc  100.0%	-	 	thread_start
34.35 Mc  100.0%	-	 	 _pthread_start
34.35 Mc  100.0%	-	 	  std::sys::unix::thread::Thread::new::thread_start::h8134a9cc26f143c2
...
```

我想要把 Allocation（内存 profile）的结果弄成 flamegraph，发现没有现成的工具。上面的工具包里有一个 [ `stackcollapse-instruments.pl` ](https://github.com/brendangregg/FlameGraph/blob/master/stackcollapse-instruments.pl)，实际上处理的是 Time Profiler 的格式：

```perl
<>;
foreach (<>) {
	chomp;
	/\d+\.\d+ (?:min|s|ms)\s+\d+\.\d+%\s+(\d+(?:\.\d+)?) (min|s|ms)\t \t(\s*)(.+)/ or die;
	my $func = $4;
	my $depth = length ($3);
	$stack [$depth] = $4;
	foreach my $i (0 .. $depth - 1) {
		print $stack [$i];
		print ";";
	}

	my $time = 0 + $1;
	if ($2 eq "min") {
		$time *= 60*1000;
	} elsif ($2 eq "s") {
		$time *= 1000;
	}

	printf("%s %.0f\n", $func, $time);
}
```

这个 perl 代码和正则表达式虽然都看不懂，但是可以目测感受一下就是先做个匹配，然后根据空格缩进的数量处理 stack，最后再把时间单位转换一下就行了。

祭出 [ `regex101` ](https://regex101.com/)（其实我也第一次用）鉴定一下正则表达式：

![regex.png](/assets/img/regex.png)

再回头结合代码中 `$2, $3, $4` 的用法，可以非常确信每个变量的含义。

然后想要转 Allocation 的格式的话，依葫芦画瓢小改一下正则表达式和单位就行了（可以结合 regex101 的 debug 功能，看正则匹配到哪儿挂了，相当好用）。注意 Allocation 的信息里默认不包括 *Self Bytes*，可以手动打开一下。

## 什么是 profiling

### profiling 这个词的含义

翻了翻词典和 wiki 的解释：

> the recording and analysis of a person's psychological and behavioral characteristics, so as to assess or predict their capabilities in a certain sphere or to assist in identifying a particular subgroup of people

> **Profiling**, the extrapolation of information about something, based on known qualities

感觉是个非常 general 的词，但感觉差不多就是通过收集信息（观测）来分析推断的意思。常见其他用法包括心理学中的罪犯心理画像侧写，都差不多是一回事。

从第一个解释也可以看出，profiling 其实有两个步骤：收集信息和分析信息。例如 golang 自带的 [pprof 包](https://pkg.go.dev/runtime/pprof)提供了多种方式启用 profiling：go test、HTTP 服务、手动在程序里启用，其实做的事情都是收集信息。以前我还搞不清楚它和 pprof tool 的关系，实际上后者是个分析、可视化工具，前者收集信息，收集成后者定义的输入格式。

### 收集信息

主要有两种收集信息的方式：
- Statistical sampling：probes the target program's call stack at regular intervals using operating system interrupts.
- Code instrumentation：either inject code into a binary file that captures timing information or by using callback hooks.

后者比前者更精确，但是 overhead 也更大。前面提到的 Mac 上的 XCode Instruments，想必就是以后面这种方式来收集信息的。

#### instrumenation 这个词的含义

> **Instrumentation** a collective term for measuring instruments that are used for indicating, measuring and recording physical quantities. The term has its origins in the art and science of scientific instrument-making.

Scientific instruments 实际上指科学仪器，that are used for **indicating, measuring and recording** physical quantities。Instrumentation 可以指*使用*科学仪器。

那么在软件的语境下， instrumentation 就指往代码中加入一些“仪器”，从而可以*观测*到软件的行为。它的中文好像叫“插桩”，也挺形象，就是感觉不太符合原意。

插入软件里的东西可能包括：
- Collect profiling statistics：profiling 实际上就是 measuring dynamic program behaviors，非常像做科学实验
- Run-time checking：像 AddressSanitizer 这种也被算作是 instrumentation，感觉稍微有点词义扩大的感觉

不过这么说来，我感觉 sampling 在更广义的角度看也可以算是一种“instrumentation”……

### 分析/展示信息

分析除了 flamegraph，其他还有像下面这样的 graphviz 图等等。

![](https://go.dev/blog/pprof/havlak1a-75.png)

也可以不可视化，就看一看一些统计信息，例如 TopN。

不同的收集工具接受不同的 input 格式，相应地做的事情也会不一样，例如有的分析工具可能还有把 debug symbol 转成 source code address 这一步，而像之前的 flamegraph 就是接受现成的处理好的（collapsed）stacktrace。pprof 的输入格式是一个 [protobuffer 定义](https://github.com/google/pprof/blob/main/proto/profile.proto)。

## CPU profiling & memory profiling

> CPU profiling 和 memory profiling 有什么区别？为什么都是火焰图？

现在看这个问题就很简单了，它们要做的事情都是收集信息、分析信息这两步，只是具体收集的方法不一样而已。例如 jemalloc 的 heap profile 就是把 memory dump 一坨下来，然后可以用它的 jeprof 工具来分析，包括转成火焰图的格式。

## 总结

我终于理解了一切，所以那然后该怎么看懂火焰图，定位解决性能问题呢？😭
