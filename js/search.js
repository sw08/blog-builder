window.onload = async () => {
    window.page = 0;
    window.ended = false;
    const params = new URLSearchParams(window.location.href.split('?')[1]);
    window.keyword = (params.get('keyword') || '').toString();
    if (window.keyword === '') return;
    document.getElementById('searchInput').value = window.keyword;
    window.category = (params.get('category') || '0').toString();
    document.getElementById('categorySelect').childNodes.forEach((x) => { if (x.value === window.category) { x.setAttribute('selected', 'selected') } })
    fetch('/data/category.json').then(resp => resp.json())
        .then((resp) => {
            window.categoryLinks = resp;
            loadUntilFound();
        });
};

async function loadUntilFound() {
    document.getElementById('result').style.display = 'flex';
    if (window.ended) return;
    var temp;
    while (true) {
        temp = await loadPosts();
        if (temp) break;
    }
    window.scrollTo({
        left: 0,
        behavior: 'smooth',
        top: document.getElementById('result').getBoundingClientRect().top + window.scrollY
    });
}


function loadPosts() {
    return new Promise((resolve, reject) => {
        fetch('/data/' + window.category + '/' + window.page.toString() + '.json')
            .then(resp => resp.json())
            .then((resp) => {
                var found = false;
                for (const post of resp) {
                    if (post.split('-').slice(1).join('-').includes(window.keyword.toString())) {
                        addPostList(post);
                        found = true;
                    }
                }
                window.page++;
                resolve(found);
            })
            .catch((err) => {
                window.ended = true;
                document.getElementById('ended').style.display = 'block';
                resolve(true);
            });
    });
}

function addPostList(post) {
    var category;
    if (window.category === '0') {
        post = post.split('$');
        category = post[0];
        post = post.slice(1).join('$')
    } else {
        category = window.category;
    }
    post = post.split('-');
    var temp = [];
    const date = post[0];
    const title = post.slice(1).join('-');
    temp.push(document.createElement('tr'));
    temp[0].setAttribute('class', 'post');
    temp.push(document.createElement('td'));
    temp[1].setAttribute('class', 'category');
    temp.push(document.createElement('a'));
    temp[2].setAttribute('href', window.categoryLinks[category]);
    temp.push(document.createElement('h5'));
    temp[3].innerText = category;
    temp[2].appendChild(temp[3]);
    temp[1].appendChild(temp[2]);
    temp[0].appendChild(temp[1]);
    temp.push(document.createElement('td'));
    temp[4].setAttribute('class', 'title middle vertical');
    temp[4].setAttribute('style', 'align-items:start;')
    temp.push(document.createElement('a'));
    temp[5].setAttribute('href', `/post/${category}/${date}-${title}.html`)
    temp.push(document.createElement('h5'));
    temp[6].innerText = title;
    temp[5].appendChild(temp[6]);
    temp[4].appendChild(temp[5]);
    temp[0].append(temp[4]);
    temp.push(document.createElement('td'));
    temp[7].setAttribute('class', 'date desktop');
    temp.push(document.createElement('h5'));
    temp[8].setAttribute('class', 'graytext');
    temp[8].innerText = `${date.slice(0, 2)}/${date.slice(2, 4)}/${date.slice(4, 6)} ${date.slice(6, 8)}:${date.slice(8, 10)}`;
    temp[7].appendChild(temp[8]);
    temp[0].appendChild(temp[7]);
    document.getElementById('posts').appendChild(temp[0]);
}