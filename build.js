const pug = require('pug');
const fs = require('fs');
const MarkdownIt = require('markdown-it');
const plainText = require('markdown-it-plain-text');

const md = new MarkdownIt();
md.use(plainText);

try {fs.rmSync('pages', {recursive: true});}
catch {}
fs.mkdirSync('pages');
fs.mkdirSync('pages/post')


// render post pages
var post;
const posts = fs.readdirSync('post').map(x => x.substring(0, x.length - 3));
for (var i=0; i < posts.length; i++) {
    post = posts[i];
    const content = fs.readFileSync(`post/${post}.md`, 'utf8')
    const n = i === posts.length - 1 ? " " : posts[i+1];
    const p = i === 0 ? " " : posts[i-1];
    var next, previous, date;
    if (n !== " ") {
        date = n.slice(0, 6);
        next = {
            url: `/post/${n}.html`,
            title: n.slice(13),
            date: `20${date.slice(0, 2)}년 ${date.slice(2, 4)}월 ${date.slice(4)}일`
        }
    } else {
        next = {
            url: '',
            title: ' ',
            date: ''
        }
    }
    if (p !== " ") {
        date = p.slice(0, 6);
        previous = {
            url: `/post/${p}.html`,
            title: p.slice(13),
            date: `20${date.slice(0, 2)}년 ${date.slice(2, 4)}월 ${date.slice(4)}일`
        }
    } else {
        previous = {
            url: '',
            title: ' ',
            date: ''
        }
    }
    fs.writeFile(
        `pages/post/${post}.html`,
        pug.renderFile('pugs/post.pug', {
            title: post, 
            content: md.render(content), 
            next: next, 
            previous: previous
        }),
        () => {}
    );
}


// render pages without additional content
const files = fs.readdirSync('pugs').map(x => x.substring(0, x.length - 4)).sort();
const exceptions = ['header', 'container', 'post', 'index'];
const pages = files.filter(x => !exceptions.includes(x));
for (const page of pages) {
    fs.writeFileSync(`pages/${page}.html`, pug.renderFile('./pugs/' + page + '.pug'));
}


// render pages with additional content
const recentPosts = [];
var preview;
var date;
const length = 300;
for (const post of posts.slice(files.length - 4).reverse()) {
    md.render(fs.readFileSync(`post/${post}.md`, 'utf8'))
    preview = md.plainText.replace('\n', ' ');
    date = post.slice(0, 6);
    recentPosts.push({
        title: post.slice(13),
        url: `/post/${post}.html`,
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
fs.writeFileSync('pages/index.html', pug.renderFile('./pugs/index.pug', {posts: recentPosts}));