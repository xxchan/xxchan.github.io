> 在你不知道如何测试代码之前，就不该编写程序。而一旦你完成了程序，测试代码也应该完成
>
> Martin Fowler

前两天在学习跳表这个数据结构是怎么回事，实现细节、复杂度还没学清楚，我就不由得开始思考：怎么测试？

 Mersenne conjecture 
> quickCheck(\n -> isPrime n ==> isPrime(2^n - 1))

## PBT

### Shrinking

## 现实好用吗？

程序员不想学，思维方式不习惯。PBT as a mindset，TDD(Type driven) as a mindset，FP。。writing your tests as properties not only
generates you many more test cases, but it forces you to think
about the specification of the system.

场景受限？

基础数据结构适用，但没那么多，而且成熟的库有自己的人肉测试+经过了用户的考验也不需要了。Redis，JDK。不过万一有一天要改了？收益有，但不是特别大

分布式系统，有状态系统？ How do you specify and test concurrent behaviour?

繁杂业务

代码本身就是specification

## Alternatives

### formal methods
> Randomized testing exemplifies the 80/20 rule: it yields 80% of the benefit of formal verification for 20% of the effort.
#### verification
predicate 可以写 relation，不仅仅是 computable function

Testing helps proving：QuickChick https://softwarefoundations.cis.upenn.edu/qc-current/index.html
proving helps testing： https://lemonidas.github.io/pdf/Foundational.pdf
#### model checking
model-based testing 
 
 http://www.ist.tugraz.at/aichernig/publications/papers/icst17_smc.pdf
 statistical model checking
  algebraic and state machine properties？

  system-under-test (SUT)
### logic programming
> PBT is rediscovering logic and, in particular, logic programming: to begin with, QuickCheck’s DSL is basically Horn clause logic

http://www.lix.polytechnique.fr/~dale/papers/ppdp2019-pbt.pdf
-------

Hello, Redis test suite is written in Tcl because for this kind of stuff Tcl is very good. A few reasons:
1. It is very easy to write DSLs in Tcl, you can turn it into a radically different on-purpose language. If you think Ruby is good at DSLs, try Tcl.

2. It has good I/O functions and is event-driven by default. The Redis test for example uses a server-client model using the event driven support of Tcl.

3. It has excellent ways to interact with other Unix commands, see for example the [exec] command: http://www.tcl.tk/man/tcl8.5/TclCmd/exec.htm

4. It has automatic memory management but does not use a garbage collector, reference counting is used instead. This means that the memory footprint is small and there are no GC pauses. Moreover the interpreter is extremely stable.

There are more reasons for using Tcl in certain projects, the above are the reasons I'm using it for Redis testing.

https://news.ycombinator.com/item?id=9963162


https://github.com/openjdk/jdk/tree/master/test/jdk/java/util/TreeMap



 “generative testing”

randomized testing f

fuzz test

 
 algebra driven design??



 https://zhuanlan.zhihu.com/p/78639528 如何少快好省地写一个QuickCheck