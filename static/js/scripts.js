

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
    section_names.forEach((name, idx) => {
        fetch(content_dir + name + '.md')
            .then(response => response.text())
            .then(markdown => {
                const html = marked.parse(markdown, {
                    headerIds: true,
                    headerPrefix: name + '-',
                });
                const container = document.getElementById(name + '-md');
                container.innerHTML = html;

                const headings = container.querySelectorAll('h2, h3, h4');
                if (headings.length) {
                    const toc = document.createElement('nav');
                    toc.className = 'section-toc';
                    const ul = document.createElement('ul');
                    headings.forEach(h => {
                        if (!h.id) return;
                        const li = document.createElement('li');
                        const a = document.createElement('a');
                        a.href = '#' + h.id;
                        a.textContent = h.textContent;
                        li.appendChild(a);
                        ul.appendChild(li);
                    });
                    toc.appendChild(ul);
                    container.parentElement.insertBefore(toc, container);
                }
            }).then(() => {
                // MathJax
                MathJax.typeset();
            })
            .catch(error => console.log(error));
    })

}); 
