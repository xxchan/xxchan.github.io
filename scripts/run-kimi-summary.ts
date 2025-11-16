import { spawn } from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';
import { createInterface } from 'node:readline/promises';
import type { Interface as ReadlineInterface } from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import { fileURLToPath } from 'node:url';
import matter from 'gray-matter';

type BlogFrontmatter = {
  title?: string;
  locale?: string;
  pubDate?: string | Date;
};

type BlogEntry = {
  id: string;
  filePath: string;
  relativePath: string;
  title: string;
  locale: string;
  published?: Date;
  hasSummary: boolean;
};

async function collectBlogEntries(blogRoot: string, projectRoot: string): Promise<BlogEntry[]> {
  const blogDirs = await fs.readdir(blogRoot, { withFileTypes: true });
  const entries: BlogEntry[] = [];

  for (const dirent of blogDirs) {
    if (!dirent.isDirectory()) continue;
    const dirPath = path.join(blogRoot, dirent.name);
    const files = await fs.readdir(dirPath, { withFileTypes: true });

    for (const file of files) {
      if (!file.isFile() || !/^index.*\.(md|mdx)$/i.test(file.name)) continue;
      const filePath = path.join(dirPath, file.name);
      const source = await fs.readFile(filePath, 'utf-8');
      const frontmatter = matter(source).data as BlogFrontmatter;
      const title = typeof frontmatter.title === 'string' ? frontmatter.title : dirent.name;
      const locale = typeof frontmatter.locale === 'string' ? frontmatter.locale : 'unknown';
      const publishedRaw = frontmatter.pubDate ? new Date(frontmatter.pubDate) : undefined;
      const published = publishedRaw && Number.isNaN(publishedRaw.getTime()) ? undefined : publishedRaw;

      entries.push({
        id: `${dirent.name}/${file.name}`,
        filePath,
        relativePath: path.relative(projectRoot, filePath),
        title,
        locale,
        published,
        hasSummary: source.includes('<LlmSummary'),
      });
    }
  }

  if (entries.length === 0) {
    throw new Error('未找到任何博客文章。');
  }

  entries.sort((a, b) => {
    const timeA = a.published?.getTime() ?? 0;
    const timeB = b.published?.getTime() ?? 0;
    if (timeA === timeB) {
      return b.title.localeCompare(a.title);
    }
    return timeB - timeA;
  });

  return entries;
}

function formatEntry(entry: BlogEntry, index: number): string {
  const dateLabel = entry.published ? entry.published.toISOString().slice(0, 10) : '未注明日期';
  const summaryFlag = entry.hasSummary ? '（已有摘要）' : '';
  return `${index + 1}. [${dateLabel}] ${entry.title} · ${entry.locale} ${summaryFlag}\n   → ${entry.relativePath}`;
}

async function promptForSelection(rl: ReadlineInterface, entries: BlogEntry[]): Promise<BlogEntry | undefined> {
  console.log('请选择需要生成摘要的文章：');
  entries.forEach((entry, idx) => {
    console.log(formatEntry(entry, idx));
  });

  while (true) {
    const answer = (await rl.question('输入编号，或按 q 退出: ')).trim().toLowerCase();
    if (answer === 'q') return undefined;
    const choice = Number.parseInt(answer, 10);
    if (Number.isNaN(choice) || choice < 1 || choice > entries.length) {
      console.log('输入无效，请重新输入编号。');
      continue;
    }
    return entries[choice - 1];
  }
}

async function confirmOverwrite(rl: ReadlineInterface): Promise<boolean> {
  const answer = (await rl.question('该文章已经包含 LlmSummary，是否覆盖？ (y/N) ')).trim().toLowerCase();
  return answer === 'y' || answer === 'yes';
}

async function removeExistingSummaries(filePath: string): Promise<number> {
  const source = await fs.readFile(filePath, 'utf-8');
  const summaryStartToken = '<LlmSummary';
  const summaryEndToken = '</LlmSummary>';

  if (!source.includes(summaryStartToken)) {
    return 0;
  }

  let updated = source;
  let removedCount = 0;

  while (true) {
    const startIdx = updated.indexOf(summaryStartToken);
    if (startIdx === -1) break;
    const endIdx = updated.indexOf(summaryEndToken, startIdx);
    if (endIdx === -1) {
      throw new Error(`在 ${filePath} 中找到了 LlmSummary 起始标签，但缺少 ${summaryEndToken}。`);
    }
    const blockEndIdx = endIdx + summaryEndToken.length;
    updated = `${updated.slice(0, startIdx)}${updated.slice(blockEndIdx)}`;
    removedCount += 1;
  }

  if (removedCount > 0) {
    await fs.writeFile(filePath, updated);
  }

  return removedCount;
}

function buildAgentInstruction(entry: BlogEntry): string {
  return `Generate a summary for ${entry.relativePath}.`;
}

function runKimi(commandText: string, cwd: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const child = spawn('kimi', ['--yolo', '-c', commandText], { stdio: 'inherit', cwd });
    child.on('error', (error) => reject(error));
    child.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`kimi 以状态 ${code} 退出`));
        return;
      }
      resolve();
    });
  });
}

async function main() {
  const projectRoot = fileURLToPath(new URL('..', import.meta.url));
  const blogRoot = path.join(projectRoot, 'src', 'content', 'blog');
  const entries = await collectBlogEntries(blogRoot, projectRoot);
  const rl = createInterface({ input, output });

  try {
    const selected = await promptForSelection(rl, entries);
    if (!selected) {
      console.log('已取消。');
      return;
    }

    if (selected.hasSummary) {
      const overwrite = await confirmOverwrite(rl);
      if (!overwrite) {
        console.log('未做任何修改。');
        return;
      }
      const removedBlocks = await removeExistingSummaries(selected.filePath);
      console.log(`已删除 ${removedBlocks} 个现有的 LlmSummary 区块。`);
    }

    const instruction = buildAgentInstruction(selected);
    console.log(`正在调用 kimi 处理 ${selected.relativePath} ...`);
    await runKimi(instruction, projectRoot);
    console.log('kimi 已完成处理，请检查文件变更。');
  } finally {
    rl.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
