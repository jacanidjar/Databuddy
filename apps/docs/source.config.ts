import { defineDocs, frontmatterSchema, metaSchema } from "fumadocs-mdx/config";

export const docs = defineDocs({
	dir: "content/docs",
	docs: {
		schema: frontmatterSchema,
		async: true,
	},
	meta: {
		schema: metaSchema,
	},
});
