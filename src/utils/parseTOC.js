import { marked } from "marked";

export default function parseMarkdownHeadings(markdown) {
  const tokens = marked.lexer(markdown);
  const headingList = [];
  let lastH1 = null;
  let lastH2 = null;

  tokens.forEach((token) => {
    if (token.type === "heading") {
      const slug = token.text.toLowerCase().replace(/\s+/g, "-");
      const entry = {
        level: token.depth,
        text: token.text,
        slug: slug,
        subheadings: [],
      };

      if (token.depth === 1) {
        headingList.push(entry);
        lastH1 = entry;
        lastH2 = null;
      } else if (token.depth === 2) {
        if (lastH1) {
          lastH1.subheadings.push(entry);
        } else {
          headingList.push(entry);
        }
        lastH2 = entry;
      } else if (token.depth === 3) {
        if (lastH2) {
          lastH2.subheadings.push(entry);
        } else if (lastH1) {
          lastH1.subheadings.push(entry);
        } else {
          headingList.push(entry);
        }
      }
    }
  });

  return headingList;
}
