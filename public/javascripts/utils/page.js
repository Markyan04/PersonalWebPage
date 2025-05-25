class PageManager {
    static initState = () => {
        document.querySelector('.in-matching-part').style.display = 'none';
        document.querySelector('.nobody-challenge-part').style.display = 'none';
        document.querySelector('.matching-success-part').style.display = 'none';
    }

    static showMatchingPart = () => {
        document.querySelector('.before-matching-part').style.display = 'none';
    document.querySelector('.in-matching-part').style.display = 'block';
    }

    static showMatchingList = () => {
        document.querySelector('.before-matching-part').style.display = 'block';
        document.querySelector('.in-matching-part').style.display = 'none';
    }

    static showWaitingResponse = ()=>  {
        document.querySelector('.nobody-challenge-part').style.display = 'none';
        document.querySelector('.waiting-response-part').style.display = 'block';
    }

    static showNobodyWaiting = () => {
        document.querySelector('.nobody-challenge-part').style.display = 'block';
        document.querySelector('.waiting-response-part').style.display = 'none';
    }

    static showMatchingSuccess = () => {
        document.querySelector('.matching-success-part').style.display = 'block';
        document.querySelector('.matching-part').style.display = 'none';
        document.querySelector('.accept-part').style.display = 'none';
        document.querySelector('.user-info-part').style.display = 'none';
    }
}

export { PageManager };
