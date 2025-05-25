const LoadingManager = {
    show: () => {
        const loadingDiv =
                document.getElementById('global-loading') || createLoadingElement();
        loadingDiv.style.display = 'flex';
    },
    hide: () => {
        const loadingDiv = document.getElementById('global-loading');
        if (loadingDiv) loadingDiv.style.display = 'none';
    }
};

const createLoadingElement = () => {
    const loadingDiv = document.createElement('div');
    loadingDiv.id = 'global-loading';
    loadingDiv.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(255, 255, 255, 0.8);
        display: none;
        justify-content: center;
        align-items: center;
        z-index: 9999;
    `;
    loadingDiv.innerHTML = `
        <div class="loading-spinner"></div>
    `;
    document.body.appendChild(loadingDiv);
    return loadingDiv;
};

export default LoadingManager;