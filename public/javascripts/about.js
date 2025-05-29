const projectData = {
    "Machine Learning-Based Traditional Chinese Medicine Tongue Diagnosis": {
        colors: ['#3572a5', '#e34c26', '#563d7c', '#ffe04d', '#41b883'],
        percentages: [35.4, 0.3, 1.7, 6.3, 56.3],
        languages: ['Python', 'HTML', 'CSS', 'JavaScript', 'Vue']
    },
    "Integrated Appointment System for Aberdeen Institute of Data Science and Artificial Intelligence, SCNU (Front-end)": {
        colors: ['#41b883', '#ffe04d', '#616875'],
        percentages: [90.3, 9, 0.7],
        languages: ['Vue', 'JavaScript', 'Other']
    },
    "Integrated Appointment System for Aberdeen Institute of Data Science and Artificial Intelligence, SCNU (Back-end)": {
        colors: ['#8c5225', '#7d52cb', '#34495e'],
        percentages: [74.5, 25.3, 0.2],
        languages: ['Java', 'Kotlin', 'DockerFile']
    },
    "Campus Second-Hand Trading Platform - Goods Exchange (Front-end)": {
        colors: ['#ffe04d', '#41b883', '#616875'],
        percentages: [94.6, 5.3, 10],
        languages: ['JavaScript', 'Vue', 'Other']
    },
    "Campus Second-Hand Trading Platform - Goods Exchange (Back-end)": {
        colors: ['#3572a5', '#e34c26'],
        percentages: [82.8, 17.2],
        languages: ['Python', 'HTML']
    },
    "DLVbri Control - DisplayLink Display Brightness Adjustment Application": {
        colors: ['#0f6b01', '#e34c26'],
        percentages: [79.2, 20.8],
        languages: ['C#', 'XAML']
    },
    "Personal blog page and Quiz battle Application": {
        colors: ['#ffe04d', '#e34c26', '#563d7c'],
        percentages: [45.6, 32.8, 21.6],
        languages: ['JavaScript', 'HTML', 'CSS']
    }
};

function generateCodePie(projectCard, data) {
    const codePie = projectCard.querySelector('.code-pie');
    const langLegend = projectCard.querySelector('.lang-legend');

    let gradient = [];
    let accumulated = 0;
    data.percentages.forEach((percent, index) => {
        gradient.push(`${data.colors[index]} ${accumulated}% ${accumulated + percent}%`);
        accumulated += percent;
    });
    codePie.style.background = `conic-gradient(${gradient.join(', ')})`;

    langLegend.innerHTML = data.languages.map((lang, index) => `
            <div class="lang-item">
                <div class="lang-color" style="background: ${data.colors[index]}"></div>
                <span>${lang} (${data.percentages[index]}%)</span>
            </div>
        `).join('');
}

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

    document.querySelectorAll('.project-card').forEach(card => {
        const title = card.querySelector('.project-title span').textContent.trim();
        if (projectData[title]) {
            generateCodePie(card, projectData[title]);
        }
    });
});