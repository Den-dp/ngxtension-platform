import starlight from '@astrojs/starlight';
import { defineConfig } from 'astro/config';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

// Get utility directories and map them to sidebar groups
const utilityBase = join(process.cwd(), 'src/content/docs/utilities');
const utilityDirs = readdirSync(utilityBase, { withFileTypes: true })
	.filter((dirent) => dirent.isDirectory())
	.sort((a, b) => a.name.localeCompare(b.name));

const standaloneGroups = [];
const otherItems = [];

for (const dirent of utilityDirs) {
	const dirPath = join(utilityBase, dirent.name);
	const contentList = readdirSync(dirPath, { withFileTypes: true }).filter(
		(ent) =>
			ent.isDirectory() ||
			ent.name.endsWith('.md') ||
			ent.name.endsWith('.mdx'),
	);

	if (contentList.length === 0) continue;

	if (contentList.length === 1 && contentList[0].isFile()) {
		const filePath = join(dirPath, contentList[0].name);
		const content = readFileSync(filePath, 'utf-8');
		const titleMatch = content.match(/title:\s*['"]?(.*?)['"]?\n/);
		const title = titleMatch ? titleMatch[1] : dirent.name;
		const link = `/utilities/${dirent.name.toLowerCase()}/${contentList[0].name.replace(/\.mdx?$/, '')}`;
		otherItems.push({ label: title, link });
	} else {
		standaloneGroups.push({
			label: dirent.name,
			autogenerate: { directory: `utilities/${dirent.name}` },
			collapsed: true,
		});
	}
}

if (otherItems.length > 0) {
	standaloneGroups.push({
		label: 'Others',
		items: otherItems.sort((a, b) => a.label.localeCompare(b.label)),
		collapsed: true,
	});
}

export const locales = {
	root: { label: 'English', lang: 'en' },
	es: { label: 'Español', lang: 'es' },
};

// https://astro.build/config
export default defineConfig({
	markdown: {
		syntaxHighlight: 'shiki',
		shikiConfig: {
			theme: 'tokyo-night',
			wrap: true,
			themes: {
				light: 'github-light',
				dark: 'tokyo-night',
			},
		},
	},
	integrations: [
		starlight({
			title: 'ngxtension',
			logo: {
				light: './public/ngxtension-blue.svg',
				dark: './public/ngxtension-white.svg',
				alt: 'ngxtension logo',
				replacesTitle: true,
			},
			favicon: './ngxt-blue.svg',
			social: [
				{
					label: 'GitHub',
					icon: 'github',
					href: 'https://github.com/ngxtension/ngxtension-platform',
				},
				{
					label: 'Twitter',
					icon: 'twitter',
					href: 'https://twitter.com/Nartc1410',
				},
			],
			customCss: ['./src/styles/custom.css'],
			lastUpdated: true,
			sidebar: [
				{
					label: 'Getting Started',
					autogenerate: { directory: 'getting-started' },
					translations: {
						es: 'Inicio',
					},
				},
				...standaloneGroups,
				{
					label: 'Project Graph',
					translations: {
						es: 'Gráfico de Proyecto',
					},
					link: '/dep-graph',
				},
				{
					label: 'Press Kit',
					link: '/logos/logos',
				},
			],
			components: {
				PageTitle: './src/components/PageTitle.astro',
				MarkdownContent: './src/components/Content.astro',
				Sidebar: './src/components/Sidebar.astro',
			},
			defaultLocale: 'root',
			locales,
		}),
	],
});
