(function () {
    const Result = {
        init() {
            const url = new URL(location.href);
            const correctAnswerElement = document.getElementById('correct');
            document.getElementById('result_score').innerText = url.searchParams.get('score') + '/' +
                url.searchParams.get('total');

            correctAnswerElement.onclick = function () {
                location.href = 'correct.html';
            }

        }

    }


    Result.init()
})()