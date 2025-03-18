(function () {
    const Result = {
        logoElement: null,
        init() {
            const url = new URL(location.href);
            const correctAnswerElement = document.getElementById('correct');
            document.getElementById('result_score').innerText = url.searchParams.get('score') + '/' +
                url.searchParams.get('total');

            correctAnswerElement.onclick = function () {
                location.href = 'correct.html';
            }

            this.logoElement = document.getElementById("logo");
            this.logoElement.style.cursor = "pointer";
            this.logoElement.onclick = () => location.href = "index.html"

        }

    }


    Result.init()
})()