document.addEventListener('scroll', () => {
    const homeheight = document.getElementById('intro').getBoundingClientRect().height + window.innerHeight * 0.25
    document.getElementById('bg').style.filter = `blur(${(window.scrollY <= homeheight ? window.scrollY / homeheight : 1) * 5}px)`
})