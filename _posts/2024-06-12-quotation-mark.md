---
layout: post
title: "Why English Quote (') looks bad in my blog?"
categories:
- Misc
toc: true
toc_sticky: true
---

As you might have noticed, I write blogs in both Chinese and English. My approach to multilingual blogs is straightforward and somewhat brute-force: I simply put them together without a language switcher or any filtering. Admittedly, I haven't figured out how to implement this in Jekyll due to a lack of motivation.

One issue I encountered was the font, as Chinese characters looked unattractive with the default settings. I also don't want different configurations for each language, but some Chinese fonts don't support English characters. Currently, I'm using [Noto Serif SC](https://fonts.google.com/noto/specimen/Noto+Serif+SC), which looks decent enough.

This setup works well for the most part, except for two small, puzzling clouds..
1. The HTML header is `<html lang="zh">` for all pages. I'm unsure of the impact, so I haven't have enough motivation to address it yet.
2. (The main topic of this post) The quotation mark `'` is displayed as a full-width character (`’`), which looks quite strange.

![quotation-mark.png](/assets/img/quotation-mark.png)

Initially, I thought it was a font issue. However, testing revealed that the Noto Serif SC font could render `'` nicely. Copying the rendered character showed it was indeed converted to `’`, rather than just being rendered differently.

I suspected it might be a Jekyll issue, but found no similar questions. Eventually, I broadened my search to "Jekyll Quotes" and discovered some related issues: [All quotes in markup text had to be escaped · Issue #1858 · jekyll/jekyll](https://github.com/jekyll/jekyll/issues/1858). In their case, the quotation mark was even more problematic. I tried escaping it in my blog with `\'`, which could also solve my issue.

![quotation-mark-2.png](/assets/img/quotation-mark-2.png)

I began to realize that it's a feature (not a bug) of the markdown processor (not Jekyll), called "smart quotes", which performs the conversion. And here's a blog about the rationale behind it: [Common Typography Mistakes: Apostrophes Versus Quotation Marks](https://webdesignledger.com/common-typography-mistakes-apostrophes-versus-quotation-marks/)

To summarize, the reason why `'` looks bad in my blog is because it's first converted to `’`, and since I'm using a Chinese font, it is rendered in full-width, which looks awkward among English words.

Why aren't others complaining about this? Perhaps because few people mix English and Chinese posts together..

How should I solve this problem? According to the post mentioned, the conversion is legitimate, and the quotation mark should not be used. 
However, this would require using different fonts for English and Chinese. 
I'd rather not be so "correct" and opt for a simpler workaround: disable the "smart quotes" feature and live with the quotation marks.

---

At this point, I'm considering whether I should switch to a better multilingual solution or even abandon Jekyll altogether. 
Maybe I should develop my own blog without using any static site generator, as my blog is noting fancy just markdown to HTML?

> Static Site Generators are an example of the template method pattern, where the framework provides the overall control flow, but also includes copious extension points for customizing behaviors. Template method allows for some code re-use at the cost of obscure and indirect control flow. This pattern pays off when you have many different invocations of template method with few, if any, non-trivial customizations. Conversely, a template method with a single, highly customized call-site probably should be refactored away in favor of direct control flow.
>
> If you maintain dozens mostly identical websites, you definitely need a static site generator. If you have only one site to maintain, you might consider writing the overall scaffolding yourself.
>
> [Data Oriented Blogging](https://matklad.github.io/2023/11/07/dta-oriented-blogging.html) by matklad

