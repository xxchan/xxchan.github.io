---
title: Data Driven Development with Agents
pubDate: 2025-11-16T00:00:00.000Z
excerpt: snapshot testing is the king
categories:
  - AI Agent
toc: true
tocSticky: true
locale: zh
translationKey: scripting
---

本文想介绍一种使用 coding agent 的非常高效的开发方式，我还没完全想好它具体有哪些形态，但它的内核非常简单：尽可能地把（真实）数据给 agent——我愿意称之为 Data Driven Development。

## API exploration




## Snapshot Testing (Data Driven Tests)

## 广义的 data driven: Log retrieval



- 为什么 data driven development 是个好的 idea？好像没想清楚
  + few shot learning （learn by example）
  + data (sample input/output) 是代码之外的非常好的 context。代码是抽象的，而 data 是具体的
  + real data 是 source of truth。你不知道哪里有 bug，但是从最基础的 real API 的返回结果开始开发是一个非常稳的推理链。

- snapshot testing 肯定算 data driven development 
- 其他还有啥？
  + api exploration 

- design testable & scriptable systems
  snapshot testing

- api explore
- CLI tool 或许也算是 script 的简单延伸


- 中间过程 print 出来（observability？ o11y in scripting）

- 所谓 agent 的 feedback loop，就是 data driven？
  + no，比如 “pass / fail” 是 feedback，但不是 data driven - 不知道哪里错了


- 之前的 “tool eval” 其实必须得是 data driven
  + 需要知道 tool 的执行结果。才能知道对不对
  + 对于 mutation 类的 tool，其实很难知道对不对 - 必须接一个 read 来验证。

- big data - 必须要写到 file system，然后用 jq 之类的（scripting）
  + 


- functional programming: 大部分的 function 都是在做 data mapping 
- 有状态的系统 （st,x）->
- 对于 data system/data processing library，这是好办的。对于 business system，可能有点难度。
  why？可能很多东西是流程驱动，而非数据驱动。
- 可能不是所有的 API 都是 data driven - 有副作用。但是所有 API 一定都是基于一些对 data 的 contract 