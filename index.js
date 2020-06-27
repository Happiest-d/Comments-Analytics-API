const express = require('express');
const prs = require('body-parser');
const request = require('request');

const app = express();

let reqTime = {
    last: 0,
    sumTime: 0,
    sumReq: 0,
    avgTime: 0,
    allReqTime: [],
    periodReq: 0
};

app.use(prs.json());

app.post('/api/comments', (req, res) => {
    const start = new Date().getTime();
    //const dataInput = req.body;
    const link = 'https://jsonplaceholder.typicode.com/comments';

    const getComments = new Promise((resolve, reject) => {
        request(link, (error, response, body) => {
            console.error('error:', error); // Print the error if one occurred
            console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
            //console.log('body:', body); 
            const bodyArr = JSON.parse(body);
            resolve(bodyArr);
        });
    })

    
    getComments.then(comments => {
        return new Promise ((resolve, reject) => {
            //Поиск автора максимального кол-ва комментариев
            let email = []
            comments.forEach(comment => {
                email.push(comment.email);
            })
            const uniqMail = findAllUniq(email);
            //выбор автора с макс. числом комментариев
            uniqMail.sort(sortDescending);
            
            const authorComments = {
                author: uniqMail[0],
                com: comments
            };
            resolve(authorComments)
        }) 
    })
    .then(data => {
        return new Promise ((resolve, reject) => {
            //Поиск 5 наиболее частых слов
            const comments = data.com;
            let mostUsed = [];
            let allWords = []
            
            //преобразование в массив слов и подсчёт слов
            comments.forEach(comment => {
                const Words = findWords(comment.body);
                Words.forEach(word => allWords.push(word))
            })
            let uniqWords = findAllUniq(allWords);
            //сортировка по убыванию массива уникальных слов
            uniqWords.sort(sortDescending);

            //выбор 5 наиболее используемых слов
            mostUsed = uniqWords.slice(0,5);

            const authorWords = {
                author: data.author,
                words: mostUsed
            };
            resolve(authorWords)
        })
    })
    .then(data => {
        const end = new Date().getTime();
        timeFind(start, end);
        //console.log(data);
        const resData = {
            author: data.author,
            words: data.words,
            time: reqTime
        }
        res.json(resData);
    })

    

    const timeFind = (start, end) => {
        reqTime.last = end - start;
        reqTime.sumTime += reqTime.last;
        reqTime.sumReq++;
        reqTime.avgTime = reqTime.sumTime / reqTime.sumReq;
        reqTime.allReqTime[reqTime.sumReq-1] = end;
        //кол-во запросов за поледнюю минуту
        reqTime.periodReq = 0;
        for (let i = 0; i < (reqTime.sumReq); i++) {
            if (0 <= end - reqTime.allReqTime[i] && end - reqTime.allReqTime[i] <= 60000) reqTime.periodReq++
        }
    }

    const sortDescending = (a, b) => {
        if (a.counter < b.counter) {
          return 1;
        }
        if (a.counter > b.counter) {
          return -1;
        }
        return 0;
    }

    const findAllUniq = (arrIn) => {
        let arrOut = []
        arrIn.forEach(element => {
            const wordIndex = arrOut.findIndex(uniqElement => element == uniqElement.arg)
            if (wordIndex >= 0) {
                arrOut[wordIndex].counter++
            } else {
                arrOut.push({arg: element, counter: 1})
            }
        })
        return arrOut;
    }

    let findWords = (string) => {
        const wordsFilter = /[^a-zA-Z_]/
        const splitString = string.split(wordsFilter);
        const words = splitString.filter(word => word != '' )
        return words
    }

})


app.listen(3000, () => {
    console.log('App listening on port 3000!');
});