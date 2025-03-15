(function () {
    const Test = {
        quiz: null,
        questionTitleElement: null,
        optionsElement: null,
        nextButtonElement: null,
        prevButtonElement: null,
        passButtonElement: null,
        currentQuestionIndex: 1,
        userResult: [],
        init() {
            checkUserData();
            const url = new URL(location.href);
            const testId = url.searchParams.get("id");
            if (testId) {
                const xhr = new XMLHttpRequest();
                xhr.open("GET", 'https://testologia.ru/get-quiz?id=' + testId, false);
                xhr.send();

                if (xhr.status === 200 && xhr.responseText) {
                    try {
                        this.quiz = JSON.parse(xhr.responseText);
                    } catch (e) {
                        location.href = "index.html";
                    }
                } else {
                    location.href = "index.html";
                }
                this.startQuiz();
            } else {
                location.href = 'index.html';
            }
        },
        startQuiz() {
            console.log(this.quiz)
            this.questionTitleElement = document.getElementById('title');
            this.optionsElement = document.getElementById('options');

            this.nextButtonElement = document.getElementById('next');
            this.nextButtonElement.onclick = this.move.bind(this, 'next')

            this.prevButtonElement = document.getElementById('prev');
            this.prevButtonElement.onclick = this.move.bind(this, 'prev')

            this.passButtonElement = document.getElementById('pass');
            this.passButtonElement.onclick = this.move.bind(this, 'pass')

            this.showQuestion();
        },
        showQuestion() {
            const activeQuestion = this.quiz.questions[this.currentQuestionIndex - 1];
            this.questionTitleElement.innerHTML = `<span>Вопрос ${this.currentQuestionIndex}:</span> ${activeQuestion.question}`;

            this.optionsElement.innerHTML = '';
            const that = this;
            activeQuestion.answers.forEach(answer => {
                const optionElement = document.createElement('div');
                optionElement.className = 'test__question-option';

                const inputId = `answer-${answer.id}`
                const inputElement = document.createElement('input');
                inputElement.className = 'option-answer';
                inputElement.setAttribute('type', 'radio');
                inputElement.setAttribute('name', 'answer');
                inputElement.setAttribute('id', inputId);
                inputElement.setAttribute('value', answer.id);

                inputElement.onchange = function () {
                    that.chooseAnswer();
                }

                const labelElement = document.createElement('label');
                labelElement.setAttribute('for', inputId);
                labelElement.innerText = answer.answer;
                optionElement.appendChild(inputElement);
                optionElement.appendChild(labelElement);
                this.optionsElement.appendChild(optionElement);
            })
            this.nextButtonElement.setAttribute('disabled', 'disabled');
            if (this.currentQuestionIndex === this.quiz.questions.length) {
                this.nextButtonElement.innerText = 'Завершить';
            } else {
                this.nextButtonElement.innerText = 'Далее';
            }

            if (this.currentQuestionIndex > 1) {
               this.prevButtonElement.removeAttribute('disabled');
            } else {
                this.prevButtonElement.setAttribute('disabled', 'disabled');
            }
        },
        chooseAnswer() {
            this.nextButtonElement.removeAttribute('disabled');
        },
        move(action) {
            const activeQuestion = this.quiz.questions[this.currentQuestionIndex - 1];
            const choosenAnswer = Array.from(document.getElementsByClassName('option-answer')).find( element => {
                return element.checked;
            }) ;

            let choosenAnswerId = null
            if (choosenAnswer && choosenAnswer.value) {
                choosenAnswerId = Number(choosenAnswer.value);
            }
            console.log(choosenAnswerId);
            const existingResult = this.userResult.find(item => {
                return item.questionId === activeQuestion.id;
            });

            if (existingResult) {
                existingResult.choosenAnswerId = choosenAnswerId;
            } else {
                this.userResult.push({
                    questionId: activeQuestion.id,
                    choosenAnswerId: choosenAnswerId,
                });
            }

            console.log(this.userResult);

            if (action === 'next' || action === 'pass') {
                this.currentQuestionIndex++;
            } else {
                this.currentQuestionIndex--;
            }

            this.showQuestion();
        }
    }
    Test.init();
})()