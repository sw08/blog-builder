const pug = require('pug');
const fs = require('fs');
const MarkdownIt = require('markdown-it');
const plainText = require('markdown-it-plain-text');
const { json } = require('express');

const md = new MarkdownIt();
md.use(plainText);

try { fs.rmSync('pages', { recursive: true }); }
catch { }
fs.mkdirSync('pages');
fs.mkdirSync('pages/post');
fs.mkdirSync('pages/posts');
fs.mkdirSync('pages/data');
for (const category of fs.readdirSync('post')) {
    fs.mkdirSync(`pages/post/${category}`);
}
if (!fs.existsSync('post')) fs.mkdirSync('post');

// render post pages
const posts = []; // sorted list of posts, not seperated
var post;
var _posts;
var categories = {}; // category of every posts
var sortedPosts = {}; // sorted list of posts seperated by category
const _categories = fs.readdirSync('post');
_categories.sort();
for (const category of _categories) {
    sortedPosts[category] = [];
    _posts = fs.readdirSync(`post/${category}`);
    _posts.sort()
    for (const post of _posts) {
        if (post.startsWith('-')) continue;
        categories[post.substring(0, post.length - 3)] = category;
        sortedPosts[category].push(post.substring(0, post.length - 3));
        posts.push(post.substring(0, post.length - 3));
    }
}
posts.sort();
posts.reverse();

var categoryLinks = {};
for (const c of _categories) {
    categoryLinks[c] = `/posts/${c}/0.html`;
}
categoryLinks['0'] = '/posts/0/0.html'
fs.writeFile('pages/data/category.json', JSON.stringify(categoryLinks), () => { });

// render pages with additional content
var category;
for (var i = 0; i < posts.length; i++) {
    post = posts[i];
    category = categories[post]
    const content = fs.readFileSync(`post/${category}/${post}.md`, 'utf8')
    const j = sortedPosts[category].indexOf(post);
    const n = j === sortedPosts[category].length - 1 ? " " : sortedPosts[category][j + 1];
    const p = j === 0 ? " " : sortedPosts[category][j - 1];
    var next, previous, date;
    if (n !== " ") {
        date = n.slice(0, 6);
        next = {
            url: `/post/${category}/${n}.html`,
            title: n.slice(11),
            date: `20${date.slice(0, 2)}년 ${date.slice(2, 4)}월 ${date.slice(4)}일`
        };
    } else {
        next = {
            url: '',
            title: ' ',
            date: ''
        };
    }
    if (p !== " ") {
        date = p.slice(0, 6);
        previous = {
            url: `/post/${category}/${p}.html`,
            title: p.slice(11),
            date: `20${date.slice(0, 2)}년 ${date.slice(2, 4)}월 ${date.slice(4)}일`
        };
    } else {
        previous = {
            url: '',
            title: ' ',
            date: ''
        };
    }
    fs.writeFile(
        `pages/post/${category}/${post}.html`,
        pug.renderFile('pugs/post.pug', {
            title: post,
            content: md.render(content),
            next: next,
            previous: previous,
            category: { name: category, url: categoryLinks[category] },
            date: `${post.slice(0, 2)}/${post.slice(2, 4)}/${post.slice(4, 6)} ${post.slice(6, 8)}:${post.slice(8, 10)}`
        }),
        () => { }
    );
}

const recentPosts = [];
var preview, date;
const length = 300;
for (const post of posts.slice(posts.length - 3).reverse()) {
    md.render(fs.readFileSync(`post/${categories[post]}/${post}.md`, 'utf8'));
    preview = md.plainText.replace('\n', ' ');
    date = post.slice(0, 6);
    recentPosts.push({
        title: post.slice(11),
        url: `/post/${categories[post]}/${post}.html`,
        preview: preview.length > length ? preview.slice(0, length) : preview,
        date: `20${date.slice(0, 2)}년 ${date.slice(2, 4)}월 ${date.slice(4)}일`
    });
}
while (recentPosts.length < 3) {
    recentPosts.push({
        title: '작성된 포스트가 없습니다',
        preview: '내용 없음',
        url: '',
        date: ''
    });
}
fs.writeFileSync('pages/index.html', pug.renderFile('./pugs/index.pug', { posts: recentPosts }));


var before, after, splittedPosts;
var categorylist = [];
var allposts = 0;
for (const category of _categories) {
    categorylist.push({
        name: category,
        url: categoryLinks[category],
        posts: sortedPosts[category].length
    });
    allposts += categorylist.at(-1).posts
}

function categoryPosts(categoryCode, posts) {
    fs.mkdirSync('pages/posts/' + categoryCode);
    const pagelength = parseInt(posts.length / 15) + Boolean(posts.length % 15);
    for (var i = 0; i < pagelength; i++) {
        splittedPosts = [];
        for (var j = 0; j < 15; j++) {
            if (15 * i + j == posts.length) break;
            post = posts[15 * i + j];
            category = categories[post];
            splittedPosts.push({
                title: post.slice(11),
                category: category.length > 10 ? category.slice(0, 9) + '…' : category,
                url: `/post/${category}/${post}.html`,
                date: `${post.slice(0, 2)}/${post.slice(2, 4)}/${post.slice(4, 6)} ${post.slice(6, 8)}:${post.slice(8, 10)}`
            });
        }
        before = [];
        start = i >= 5 ? i - 5 : 0
        for (var j = start; j < i; j++) {
            before.push({
                number: j,
                url: `/posts/${categoryCode}/${j}.html`
            });
        }
        now = {
            number: i,
            url: `/posts/${categoryCode}/${i}.html`
        };
        after = [];
        end = i <= pagelength - 5 ? i + 5 : pagelength
        for (var j = i + 1; j < end; j++) {
            after.push({
                number: j,
                url: `/posts/${categoryCode}/${j}.html`
            });
        }
        fs.writeFileSync(`pages/posts/${categoryCode}/${i}.html`, pug.renderFile('./pugs/postlist.pug', { selected: categoryCode, allposts: allposts, categorylist: categorylist, posts: splittedPosts, now: now, after: after, before: before, categories: categoryLinks }));
    }

    if (pagelength == 0) {
        fs.writeFileSync(`pages/posts/${categoryCode}/0.html`, pug.renderFile('./pugs/postlist.pug', { selected: categoryCode, allposts: 0, categorylist: categorylist, posts: [], now: { number: 0, url: `/posts/0/0.html` }, after: [], before: [], categories: categoryLinks }));
    }
}
categoryPosts("0", posts);
for (const category of _categories) {
    categoryPosts(category, sortedPosts[category]);
}


fs.writeFileSync('pages/search.html', pug.renderFile('./pugs/search.pug', { categorylist: _categories }))

function divide(list, per) {
    if (list.length > per) {
        return [list.slice(0, per)].concat(divide(list.slice(per), per))
    } else {
        return [list]
    }
}

var n;
sortedPosts[0] = posts.map(x => categories[x] + '$' + x);
for (const category of Object.keys(sortedPosts)) {
    fs.mkdirSync('pages/data/' + category + '/');
    n = 0;
    for (const divided of divide(sortedPosts[category], 30)) {
        fs.writeFile('pages/data/' + category + '/' + (n++).toString() + '.json', JSON.stringify(divided), () => { });
    }
}

// render pages without additional content
const files = fs.readdirSync('pugs').map(x => x.substring(0, x.length - 4)).sort();
const exceptions = ['header', 'container', 'post', 'index', 'postlist', 'categorylist', 'search'];
const pages = files.filter(x => !exceptions.includes(x));
for (const page of pages) {
    fs.writeFileSync(`pages/${page}.html`, pug.renderFile('./pugs/' + page + '.pug'));
}