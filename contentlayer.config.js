import { defineDocumentType, makeSource } from 'contentlayer/source-files'
import rehypeSlug from 'rehype-slug'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'

export const Syllabus = defineDocumentType(() => ({
  name: 'Syllabus',
  filePathPattern: `syllabus.mdx`,
  contentType: 'mdx',
  fields: {
    title: { type: 'string', required: false },
  },
  computedFields: {
    url: { type: 'string', resolve: (doc) => `/syllabus` },
  },
}))

export const Reading = defineDocumentType(() => ({
  name: 'Reading',
  filePathPattern: `readings/*.md`,
  contentType: 'markdown',
  fields: {
    title: { type: 'string', required: true },
    description: { type: 'string', required: false },
  },
  computedFields: {
    url: { 
      type: 'string', 
      resolve: (doc) => `/readings/${doc._raw.flattenedPath.replace('readings/', '')}` 
    },
    slug: {
      type: 'string',
      resolve: (doc) => doc._raw.flattenedPath.replace('readings/', '')
    }
  },
}))

export const Doc = defineDocumentType(() => ({
  name: 'Doc',
  filePathPattern: `**/*.{md,mdx}`,
  contentType: 'mdx',
  fields: {
    title: { type: 'string', required: true },
    description: { type: 'string', required: false },
  },
  computedFields: {
    url: { type: 'string', resolve: (doc) => `/${doc._raw.flattenedPath}` },
  },
}))

export default makeSource({
  contentDirPath: 'content',
  documentTypes: [Syllabus, Reading, Doc],
  mdx: {
    rehypePlugins: [
      rehypeSlug,
      [
        rehypeAutolinkHeadings,
        {
          behavior: 'wrap',
          properties: {
            className: ['anchor'],
          },
        },
      ],
    ],
  },
})
