// contentlayer.config.js
import { defineDocumentType, makeSource } from "contentlayer/source-files";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
var Syllabus = defineDocumentType(() => ({
  name: "Syllabus",
  filePathPattern: `syllabus.mdx`,
  contentType: "mdx",
  fields: {
    title: { type: "string", required: false }
  },
  computedFields: {
    url: { type: "string", resolve: (doc) => `/syllabus` },
    toc: {
      type: "json",
      resolve: async (doc) => {
        const headingRegex = /^(#{2,3})\s+(.+)$/gm;
        const headings = [];
        let match;
        while ((match = headingRegex.exec(doc.body.raw)) !== null) {
          const level = match[1].length === 2 ? "two" : "three";
          const text = match[2].trim();
          const slug = text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
          headings.push({ level, text, slug });
        }
        return headings;
      }
    }
  }
}));
var Reading = defineDocumentType(() => ({
  name: "Reading",
  filePathPattern: `readings/*.md`,
  contentType: "markdown",
  fields: {
    title: { type: "string", required: true },
    description: { type: "string", required: false }
  },
  computedFields: {
    url: {
      type: "string",
      resolve: (doc) => `/readings/${doc._raw.flattenedPath.replace("readings/", "")}`
    },
    slug: {
      type: "string",
      resolve: (doc) => doc._raw.flattenedPath.replace("readings/", "")
    }
  }
}));
var MP = defineDocumentType(() => ({
  name: "MP",
  filePathPattern: `mps/*.md`,
  contentType: "markdown",
  fields: {
    title: { type: "string", required: true },
    subtitle: { type: "string", required: false },
    author: { type: "string", required: false },
    summary: { type: "string", required: false }
  },
  computedFields: {
    url: {
      type: "string",
      resolve: (doc) => `/mps/${doc._raw.flattenedPath.replace("mps/", "")}`
    },
    slug: {
      type: "string",
      resolve: (doc) => doc._raw.flattenedPath.replace("mps/", "")
    },
    number: {
      type: "number",
      resolve: (doc) => {
        const match = doc._raw.flattenedPath.match(/mp(\d+)/i);
        return match ? parseInt(match[1]) : null;
      }
    }
  }
}));
var Doc = defineDocumentType(() => ({
  name: "Doc",
  filePathPattern: `**/*.{md,mdx}`,
  contentType: "mdx",
  fields: {
    title: { type: "string", required: true },
    description: { type: "string", required: false }
  },
  computedFields: {
    url: { type: "string", resolve: (doc) => `/${doc._raw.flattenedPath}` }
  }
}));
var contentlayer_config_default = makeSource({
  contentDirPath: "content",
  documentTypes: [Syllabus, Reading, MP, Doc],
  mdx: {
    rehypePlugins: [
      rehypeSlug,
      [
        rehypeAutolinkHeadings,
        {
          behavior: "wrap",
          properties: {
            className: ["anchor"]
          }
        }
      ]
    ]
  }
});
export {
  Doc,
  MP,
  Reading,
  Syllabus,
  contentlayer_config_default as default
};
//# sourceMappingURL=compiled-contentlayer-config-D33CLKKR.mjs.map
