import type { InferPageType } from "fumadocs-core/source";
import type { DocData, DocMethods } from "fumadocs-mdx/runtime/types";
import {
	type FileObject,
	printErrors,
	scanURLs,
	validateFiles,
} from "next-validate-link";
import { source } from "../lib/source";

type Page = InferPageType<typeof source>;
type AsyncPageData = DocMethods & {
	title?: string;
	description?: string;
	load: () => Promise<DocData>;
};

const getHeadings = async (page: Page): Promise<string[]> => {
	const pageData = page.data as AsyncPageData;
	const { toc } = await pageData.load();
	return toc?.map((item) => item.url.slice(1)) ?? [];
};

const getFiles = (): Promise<FileObject[]> =>
	Promise.all(
		source.getPages().map(async (page) => {
			const pageData = page.data as AsyncPageData;
			return {
				path: page.file.path,
				content: await pageData.getText("raw"),
				url: page.url,
				data: page.data,
			};
		})
	);

async function checkLinks() {
	const pages = source.getPages();

	const scanned = await scanURLs({
		preset: "next",
		populate: {
			"docs/[[...slug]]": await Promise.all(
				pages.map(async (page) => ({
					value: { slug: page.slugs },
					hashes: await getHeadings(page),
				}))
			),
		},
	});

	const errors = await validateFiles(await getFiles(), {
		scanned,
		markdown: {
			components: {
				Card: { attributes: ["href"] },
				Cards: { attributes: ["href"] },
				Link: { attributes: ["href"] },
			},
		},
		checkRelativePaths: "as-url",
	});

	printErrors(errors, true);

	if (errors.length > 0) {
		process.exit(1);
	}
}

checkLinks().catch(console.error);
