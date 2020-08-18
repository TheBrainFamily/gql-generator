module.exports = {
  title: 'Chimp.js',
  tagline: 'Tooling that helps you do quality, faster.',
  url: 'https://www.chimpjs.com',
  baseUrl: '/',
  onBrokenLinks: 'throw',
  favicon: 'favicon-96x96.png',
  organizationName: 'TheBrainFamily', // Usually your GitHub org/user name.
  projectName: 'chimp', // Usually your repo name.
  themeConfig: {
    navbar: {
      title: 'chimp',
      logo: {
        alt: 'Chimp Logo',
        src: 'img/logo.svg',
      },
      items: [
        {
          to: 'docs/quickstart',
          activeBasePath: 'docs',
          label: 'Docs',
          position: 'left',
        },
        { to: 'blog', label: 'Blog', position: 'left' },
        {
          href: 'https://github.com/xolvio/chimp',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Docs',
          items: [
            {
              label: 'Intro',
              to: 'docs/quickstart',
            },
          ],
        },
        {
          title: 'Community',
          items: [
            {
              label: 'Stack Overflow',
              href: 'https://stackoverflow.com/questions/tagged/chimp',
            },
            {
              label: 'Twitter',
              href: 'https://twitter.com/xolvio',
            },
          ],
        },
        {
          title: 'More',
          items: [
            {
              label: 'Blog',
              href: 'https://www.xolv.io/blog',
            },
            {
              label: 'GitHub',
              href: 'https://github.com/xolvio/chimp',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Xolv.io.`,
    },
  },
  presets: [
    [
      '@docusaurus/preset-classic',
      {
        docs: {
          // It is recommended to set document id as docs home page (`docs/` path).
          homePageId: 'doc1',
          sidebarPath: require.resolve('./sidebars.js'),
          // Please change this to your repo.
          editUrl: 'https://github.com/facebook/docusaurus/edit/master/website/',
        },
        blog: {
          showReadingTime: true,
          // Please change this to your repo.
          editUrl: 'https://github.com/facebook/docusaurus/edit/master/website/blog/',
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      },
    ],
  ],
};
