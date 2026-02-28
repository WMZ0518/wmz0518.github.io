

const content_dir = 'contents/'
const config_file = 'config.yml'
const section_names = ['home', 'publications', 'awards']


window.addEventListener('DOMContentLoaded', event => {

    // Activate Bootstrap scrollspy on the main nav element
    const mainNav = document.body.querySelector('#mainNav');
    if (mainNav) {
        new bootstrap.ScrollSpy(document.body, {
            target: '#mainNav',
            offset: 74,
        });
    };

    // Collapse responsive navbar when toggler is visible
    const navbarToggler = document.body.querySelector('.navbar-toggler');
    const responsiveNavItems = [].slice.call(
        document.querySelectorAll('#navbarResponsive .nav-link')
    );
    responsiveNavItems.map(function (responsiveNavItem) {
        responsiveNavItem.addEventListener('click', () => {
            if (window.getComputedStyle(navbarToggler).display !== 'none') {
                navbarToggler.click();
            }
        });
    });


    // Yaml
    fetch(content_dir + config_file)
        .then(response => response.text())
        .then(text => {
            const yml = jsyaml.load(text);
            Object.keys(yml).forEach(key => {
                try {
                    document.getElementById(key).innerHTML = yml[key];
                } catch {
                    console.log("Unknown id and value: " + key + "," + yml[key].toString())
                }

            })
        })
        .catch(error => console.log(error));


    // Marked
    marked.use({ mangle: false })
    const navList = document.querySelector('#navbarResponsive .navbar-nav');
    const navItems = [];
    let sectionsLoaded = 0;
    const cleanNavText = (text) => text
        .replace(/[\u{1F000}-\u{1FAFF}]/gu, '')
        .replace(/[\u{2600}-\u{27BF}]/gu, '')
        .replace(/[\uFE0F\u200D]/g, '')
        .replace(/\s{2,}/g, ' ')
        .trim();

    section_names.forEach((name, idx) => {
        fetch(content_dir + name + '.md')
            .then(response => response.text())
            .then(markdown => {
                const html = marked.parse(markdown, {
                    headerIds: true,
                    headerPrefix: name + '-',
                });
                const container = document.getElementById(name + '-md');
                const existingToc = container.parentElement.querySelectorAll('.section-toc');
                existingToc.forEach(node => node.remove());
                container.innerHTML = html;

                const headings = container.querySelectorAll('h3');
                headings.forEach(h => {
                    if (!h.id) return;
                    navItems.push({ idx, id: h.id, text: cleanNavText(h.textContent) });
                });
            }).then(() => {
                // MathJax
                MathJax.typeset();
            })
            .then(() => {
                sectionsLoaded += 1;
                if (sectionsLoaded !== section_names.length) return;
                if (!navList || !navItems.length) return;

                navItems
                    .sort((a, b) => (a.idx - b.idx))
                    .forEach(item => {
                        const li = document.createElement('li');
                        li.className = 'nav-item';
                        const a = document.createElement('a');
                        a.className = 'nav-link me-lg-3';
                        a.href = '#' + item.id;
                        a.textContent = item.text;
                        li.appendChild(a);
                        navList.appendChild(li);
                    });
                navItems.length = 0;
            })
            .catch(error => console.log(error));
    })

}); 
