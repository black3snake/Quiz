(function () {
    const Test = {
        quiz: null,
        questionTitleElement: null,
        optionsElement: null,
        nextButtonElement: null,
        prevButtonElement: null,
        passButtonElement: null,
        progressBarElement: null,
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
            // console.log(this.quiz)
            document.getElementById('pre-title').innerText = this.quiz.name;

            this.progressBarElement = document.getElementById('progress-bar');

            this.questionTitleElement = document.getElementById('title');
            this.optionsElement = document.getElementById('options');

            this.nextButtonElement = document.getElementById('next');
            this.nextButtonElement.onclick = this.move.bind(this, 'next')

            this.prevButtonElement = document.getElementById('prev');
            this.prevButtonElement.onclick = this.move.bind(this, 'prev')

            this.passButtonElement = document.getElementById('pass');
            this.passButtonElement.onclick = this.move.bind(this, 'pass')

            this.prepareProgressBar();
            this.showQuestion();

            const timerElement = document.getElementById('timer');
            let seconds = 59;
            const interval = setInterval(function () {
                seconds--;
                timerElement.innerText = seconds;
                if (seconds === 0) {
                    this.complete();
                    clearInterval(interval);
                }
            }.bind(this),1000);
        },
        // работа с прогресбаром
        prepareProgressBar() {
          for (let i = 0; i < this.quiz.questions.length; i++) {
              const itemElement = document.createElement('div');
              itemElement.className = 'test__progress-bar-item ' + (i === 0 ? 'active' : '');

              const itemCircleElement = document.createElement('div');
              itemCircleElement.className = 'test__progress-bar-item-circle';

              const itemTextElement = document.createElement('div');
              itemTextElement.className = 'test__progress-bar-item-text';
              itemTextElement.innerText = `Вопрос ${i+1}`

              itemElement.appendChild(itemCircleElement);
              itemElement.appendChild(itemTextElement);
              this.progressBarElement.appendChild(itemElement);
          }

        },

        showQuestion() {
            const activeQuestion = this.quiz.questions[this.currentQuestionIndex - 1];
            this.questionTitleElement.innerHTML = `<span>Вопрос ${this.currentQuestionIndex}:</span> ${activeQuestion.question}`;

            this.optionsElement.innerHTML = '';
            const that = this;
            const chosenOption = that.userResult.find(item => item.questionId === activeQuestion.id);
            // console.log(chosenOption);

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

                if (chosenOption && chosenOption.chosenAnswerId === answer.id ) {
                    inputElement.setAttribute('checked', 'checked');
                }

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

            if (chosenOption && chosenOption.chosenAnswerId) {
                this.nextButtonElement.removeAttribute('disabled');
            } else {
                this.nextButtonElement.setAttribute('disabled', 'disabled');
            }

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

            let chosenAnswerId = null
            if (choosenAnswer && choosenAnswer.value) {
                chosenAnswerId = Number(choosenAnswer.value);
            }
            // console.log(chosenAnswerId);
            const existingResult = this.userResult.find(item => {
                return item.questionId === activeQuestion.id;
            });

            if (existingResult) {
                existingResult.chosenAnswerId = chosenAnswerId;
            } else {
                this.userResult.push({
                    questionId: activeQuestion.id,
                    chosenAnswerId: chosenAnswerId,
                });
            }

            // console.log(this.userResult);

            if (action === 'next' || action === 'pass') {
                this.currentQuestionIndex++;
            } else {
                this.currentQuestionIndex--;
            }

            if (this.currentQuestionIndex > this.quiz.questions.length) {
                this.complete();
                return;
            }

            // поменять состояние progress bar
            Array.from(this.progressBarElement.children).forEach((item,index) => {
                const currentItemIndex = index + 1;
                item.classList.remove('complete');
                item.classList.remove('active');

                if (currentItemIndex === this.currentQuestionIndex) {
                    item.classList.add('active');
                } else if (currentItemIndex < this.currentQuestionIndex) {
                    item.classList.add('complete');
                }

            })

            this.showQuestion();
        },
        complete() {
            const url = new URL(location.href);
            const id = url.searchParams.get("id");
            const name = url.searchParams.get("name");
            const lastName = url.searchParams.get("lastName");
            const email = url.searchParams.get("email");
            const xhr = new XMLHttpRequest();
            xhr.open('POST', 'https://testologia.ru/pass-quiz?id=' + id, false);
            xhr.setRequestHeader('Content-type', 'application/json; charset=UTF-8');
            xhr.send(JSON.stringify({
                name: name,
                lastName: lastName,
                email: email,
                results: this.userResult
            }))

            if (xhr.status === 200 && xhr.responseText) {
                let result = null;
                try {
                    result = JSON.parse(xhr.responseText);
                } catch (e) {
                    location.href = "index.html";
                }
                if (result) {
                    // console.log(result);
                    location.href = 'result.html?score=' + result.score + '&total=' + result.total;
                }
            } else {
                location.href = "index.html";
            }

        }
    }
    Test.init();
})()