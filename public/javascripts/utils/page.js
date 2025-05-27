class HallPageManager {
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

class QuizPageManager {

    static readyPageInit = () => {
        document.querySelector('.test-part').style.display = 'none';
        document.querySelector('.final-result-part').style.display = 'none';
        document.querySelector('.ready-part').style.display = 'block';
        document.querySelector('.ready-text-after').style.display = 'none';
        document.querySelector('.ready-text-before').style.display = 'block';
        document.querySelector('.start-button').classList.add('start-button-before');
        document.querySelector('.start-button').classList.remove('start-button-after');
    }

    static readyButtonClick = () => {
        document.querySelector('.test-part').style.display = 'none';
        document.querySelector('.ready-part').style.display = 'block';
        document.querySelector('.ready-text-after').style.display = 'block';
        document.querySelector('.ready-text-before').style.display = 'none';
        document.querySelector('.start-button').classList.add('start-button-after');
        document.querySelector('.start-button').classList.remove('start-button-before');
    }

    static enterTestPage = () => {
        document.querySelector('.test-part').style.display = 'block';
        document.querySelector('.ready-part').style.display = 'none';
    }

    static beforeAnswerState = () => {
        document.querySelector('.ready-for-next-button').style.display = 'none';
        document.querySelector('.upload-button').style.display = 'block';
        document.querySelector('.waiting-for-result').style.display = 'none';
        document.querySelector('.result-text').classList.add('result-late');
    }

    static uploadAnswerButNoResultState = () => {
        document.querySelector('.upload-button').style.display = 'none';
        document.querySelector('.operation-part').style.display = 'none';
        document.querySelector('.waiting-for-result').style.display = 'block';
    }

    static getResultState = () => {
        document.querySelector('.operation-part').style.display = 'block';
        document.querySelector('.ready-for-next-button').style.display = 'block';
    }

    static readyAgainForNextQuestion = () => {
        console.log('ready again');
    }

    static showFinalResult = () => {
        document.querySelector('.test-part').style.display = 'none';
        document.querySelector('.final-result-part').style.display = 'block';
    }
}

export { HallPageManager, QuizPageManager };
