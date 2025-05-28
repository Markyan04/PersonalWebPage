document.addEventListener('DOMContentLoaded', () => {
    const defaultTab = document.querySelector('.tab-item[data-target="tech-stack-part"]');
    if (defaultTab) {
        defaultTab.classList.add('active');
        document.querySelector('.tech-stack-part').style.display = 'block';
        document.querySelector('.project-part').style.display = 'none';
    }

    const tabs = document.querySelectorAll('.tab-item');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            const target = document.querySelector(`.${tab.dataset.target}`);
            document.querySelectorAll('.tech-stack-part, .project-part').forEach(el => {
                el.style.display = 'none';
            });
            target.style.display = 'block';
        });
    });

    const techItems = document.querySelectorAll('.tech-stack-item');
    techItems.forEach(item => {
        item.addEventListener('mouseenter', () => {
            item.style.transform = 'scale(1.05)';
        });
        item.addEventListener('mouseleave', () => {
            item.style.transform = 'scale(1)';
        });
    });
});