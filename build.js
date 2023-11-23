const pug = require('pug');
const fs = require('fs');
const MarkdownIt = require('markdown-it');
const plainText = require('markdown-it-plain-text');

const md = new MarkdownIt();
md.use(plainText);

try { fs.rmSync('pages', { recursive: true }); }
catch { }
fs.mkdirSync('pages');
fs.mkdirSync('pages/post');
fs.mkdirSync('pages/posts');
for (const category of fs.readdirSync('post')) {
    fs.mkdirSync(`pages/post/${category}`);
}

// render post pages
var post;
var categories = {};
var sortedPosts = {};
for (const category of fs.readdirSync('post')) {
    sortedPosts[category] = [];
    for (const post of fs.readdirSync(`post/${category}`)) {
        categories[post.substring(0, post.length - 3)] = category;
        sortedPosts[category].push(post.substring(0, post.length - 3));
    }
}
const posts = Object.keys(categories);
posts.sort();
posts.reverse();
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
            category: category,
            date: `${post.slice(0, 2)}/${post.slice(2, 4)}/${post.slice(4, 6)} ${post.slice(6, 8)}:${post.slice(8, 10)}`
        }),
        () => { }
    );
}


// render pages without additional content
const files = fs.readdirSync('pugs').map(x => x.substring(0, x.length - 4)).sort();
const exceptions = ['header', 'container', 'post', 'index', 'postlist', 'categorylist'];
const pages = files.filter(x => !exceptions.includes(x));
for (const page of pages) {
    fs.writeFileSync(`pages/${page}.html`, pug.renderFile('./pugs/' + page + '.pug'));
}

// render pages with additional content
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
var categoryLinks = {};
for (const c of Object.keys(sortedPosts)) {
    categoryLinks[c] = `category/${c}`;
}
var categorylist = [];
var allposts = 0;
for (const category of Object.keys(categoryLinks)) {
    categorylist.push({
        name: category,
        url: '/' + categoryLinks[category] + '.html',
        posts: sortedPosts[category].length
    });
    allposts += categorylist.at(-1).posts
}
const pagelength = parseInt(posts.length / 15) + Boolean(posts.length % 15);
for (var i = 0; i < pagelength; i++) {
    splittedPosts = [];
    for (var j = 0; j < 15; j++) {
        if (15 * i + j == posts.length) break;
        post = posts[15 * i + j];
        category = categories[post];
        splittedPosts.push({
            title: post.slice(11),
            category: category.length > 6 ? category.slice(0, 5) + '…' : category,
            url: `/post/${category}/${post}.html`,
            date: `${post.slice(0, 2)}/${post.slice(2, 4)}/${post.slice(4, 6)} ${post.slice(6, 8)}:${post.slice(8, 10)}`
        });
    }
    before = [];
    start = i >= 5 ? i - 5 : 0
    for (var j = start; j < i; j++) {
        before.push({
            number: j,
            url: `/posts/${j}.html`
        });
    }
    now = {
        number: i,
        url: `/posts/${i}.html`
    };
    after = [];
    end = i <= pagelength - 5 ? i + 5 : pagelength
    for (var j = i + 1; j < end; j++) {
        after.push({
            number: j,
            url: `/posts/${j}.html`
        });
    }
    fs.writeFileSync(`pages/posts/${i}.html`, pug.renderFile('./pugs/postlist.pug', { allposts: allposts, categorylist: categorylist, posts: splittedPosts, now: now, after: after, before: before, categories: categoryLinks }));
}

if (pagelength == 0) {
    fs.writeFileSync('pages/posts/0.html', pug.renderFile('./pugs/postlist.pug', { allposts: 0, categorylist: [], posts: [], now: { number: 0, url: `/posts/0.html` }, after: [], before: [], categories: {} }));
}

for (const category of Object.keys(sortedPosts)) {

}