import fs from "fs";
import matter from "gray-matter";

export default function getPostContent(slug) {
  const folder = "syllabus/";
  const file = folder + `${slug}.md`;
  const content = fs.readFileSync(file, "utf8");

  const matterResult = matter(content);
  return matterResult;
}
