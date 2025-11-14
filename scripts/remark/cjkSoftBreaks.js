import { visit } from 'unist-util-visit';

const CJK_OR_FULLWIDTH = /[\u3000-\u303F\uFF00-\uFFEF\p{Script=Han}\p{Script=Katakana}\p{Script=Hiragana}\p{Script=Hangul}]/u;

function isCjkLike(char) {
  if (!char) return false;
  return CJK_OR_FULLWIDTH.test(char);
}

export default function remarkCjkSoftBreaks() {
  return (tree) => {
    visit(tree, 'text', (node) => {
      if (typeof node.value !== 'string' || !node.value.includes('\n')) {
        return;
      }

      const source = node.value;
      let result = '';

      for (let index = 0; index < source.length; index += 1) {
        const char = source[index];
        if (char === '\n') {
          const prev = source[index - 1];
          const next = source[index + 1];
          if (isCjkLike(prev) && isCjkLike(next)) {
            continue;
          }
        }
        result += char;
      }

      node.value = result;
    });
  };
}
