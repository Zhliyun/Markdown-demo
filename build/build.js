const fs = require('fs');
const path = require('path');
const render = require('json-templater/string');

const markdownList = () => {
    return fs.readdirSync(path.join(__dirname, '../src/docs')).filter((item) => {
        return item !== 'markdown-list.json';
    }).map((item) => {
        const _index = item.search(/\.md$/);
        const _fileName = _index === -1 ? item : item.substring(0, _index);
        return _fileName;
    });
};

const markdownRoutes = new Array();
markdownList().forEach((item) => {
    markdownRoutes.push(`{
        path: '${item}',
        name: '${item}',
        component: r => require.ensure([], r(require('@/docs/${item}.md')))
    }`);
});

const ROUTER_TEMPLATE = fs.readFileSync(path.join(__dirname, './template/router.tpl'), { encoding: 'utf-8' });
const MARKDOWN_LIST = fs.readFileSync(path.join(__dirname, './template/markdown-list.tpl'), { encoding: 'utf-8' });

fs.writeFileSync(path.join(__dirname, '../src/router.js'), render(ROUTER_TEMPLATE, {
    markdownRouter: `[${markdownRoutes.join(',')}]`
}));
fs.writeFileSync(path.join(__dirname, '../src/docs/markdown-list.json'), render(MARKDOWN_LIST, {
    markdownList: `["${markdownList().join('","')}"]`
}));