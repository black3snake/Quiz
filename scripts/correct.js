(function () {
    const Correct = {
        userResult: [],
        correctAnswers: null,
        originalQuestions: null,
        questionsElement: null,
        levelElement: null,
        completeTestElement: null,
        questionOptionsElement: null,
        logoElement: null,
        backResult: null,
        objId: null,
        result: null,
        init() {
            let resultIdStr = sessionStorage.getItem('resultId');
            if (resultIdStr) {
                this.objId = JSON.parse(resultIdStr);
            } else {
                console.log('Ошибка в данных sessionStorage');
            }

            const xhr = new XMLHttpRequest();
            xhr.open("GET", 'https://testologia.ru/get-quiz-right?id=' + this.objId.id, false);
            xhr.send();

            if (xhr.status === 200 && xhr.responseText) {
                try {
                    this.correctAnswers = JSON.parse(xhr.responseText);
                } catch (e) {
                    location.href = "index.html";
                }
            } else {
                location.href = "index.html";
            }
            this.start();
            // console.log(this.correctAnswers);

            this.showQuestion();

        },
        start() {
            this.questionsElement = document.getElementById("questions");
            this.levelElement = document.getElementById("level");

            this.completeTestElement = document.getElementById("complete-test");
            const fullName = `${this.objId.name} ${this.objId.lastName}`
            this.completeTestElement.innerHTML = `Тест выполнил <span>${fullName}, ${this.objId.email}</span>`;

            this.logoElement = document.getElementById("logo");
            this.logoElement.style.cursor = "pointer";
            this.logoElement.onclick = () => location.href = "index.html"


            this.backResult = document.getElementById("back-result");
            this.backResult.onclick = () => {
                location.href = 'result.html?score=' + this.result.score + '&total=' + this.result.total;
            }

            const testId = 1;
            const xhrQ = new XMLHttpRequest();
            xhrQ.open("GET", 'https://testologia.ru/get-quiz?id=' + this.objId.id, false);
            xhrQ.send();

            if (xhrQ.status === 200 && xhrQ.responseText) {
                try {
                    this.originalQuestions = JSON.parse(xhrQ.responseText);
                } catch (e) {
                    location.href = "index.html";
                }
            } else {
                location.href = "index.html";
            }
            // console.log(this.originalQuestions);

            this.levelElement.innerText = this.originalQuestions.name;

        },
        showQuestion() {
            const that = this;
            this.loadSessionStorageData();

            this.originalQuestions.questions.forEach((question, index) => {
                // console.log(question.question);
                const questionTitleString = `<span>Вопрос ${index + 1}:</span> ${question.question}`;
                const questionElement = document.createElement('div');
                questionElement.className = 'correctAnswer__question';

                const questionTitleElement = document.createElement('div');
                questionTitleElement.className = 'correctAnswer__question-title';
                questionTitleElement.innerHTML = questionTitleString;
                questionElement.appendChild(questionTitleElement);

                that.questionOptionsElement = document.createElement('div');
                that.questionOptionsElement.className = 'correctAnswer__question-options';

                let chosenVariantAnswer = that.userResult[index].chosenAnswerId === that.correctAnswers[index];

                question.answers.forEach(item => {
                    const inputId = `answer-${item.id}`

                    const questionOptionElement = document.createElement('div');
                    questionOptionElement.className = 'correctAnswer__question-option';

                    const fakeRadioElement = document.createElement('span');
                    fakeRadioElement.className = 'correctAnswer__fake-radio';

                    if (chosenVariantAnswer && item.id === that.correctAnswers[index]) {
                        fakeRadioElement.classList.add('success');
                    } else if (!chosenVariantAnswer && item.id === that.userResult[index].chosenAnswerId ) {
                        fakeRadioElement.classList.add('error');
                    }

                    const labelElement = document.createElement('label');
                    labelElement.setAttribute('for', inputId);
                    labelElement.innerText = item.answer;

                    questionOptionElement.appendChild(fakeRadioElement);
                    questionOptionElement.appendChild(labelElement);
                    that.questionOptionsElement.appendChild(questionOptionElement);

                    // console.log(that.questionOptionsElement);
                })
                questionElement.appendChild(that.questionOptionsElement)
                that.questionsElement.appendChild(questionElement);
            })
        },
        loadSessionStorageData() {
            let userResultStr = sessionStorage.getItem('userResult');
            let resultStr = sessionStorage.getItem('result');

            if (userResultStr) {
                this.userResult = JSON.parse(userResultStr);
            } else {
                console.log('Ошибка в данных sessionStorage');
            }
            // console.log(this.userResult);
            if (resultStr) {
                this.result = JSON.parse(resultStr);
            } else {
                console.log('Ошибка в данных sessionStorage');
            }

        }
    };

    Correct.init();
})()