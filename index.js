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
            let uniqMail = [];
            for (let j = 0; j < comments.length; j++){
                let email = [comments[j].email];
                findAllUniq(email, uniqMail)
            } 
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

            let comments = data.com;
            let uniqWords = [];
            let mostUsed = [];
            
            for (let j = 1; j < comments.length; j++) {
                //преобразование body в массив слов
                let allWords = [];
                let bufferString = comments[j].body;
                //console.log(bufferString);
                let sep1 = bufferString.split('\n');
                //console.log(sep1);
                for (let i = 0; i < sep1.length; i++) {
                    let arr = sep1[i].split(' ');
                    allWords = allWords.concat(arr);
                }
                findAllUniq(allWords,uniqWords);
            }

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

    

    let timeFind = (start, end) => {
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

    let sortDescending = (a, b) => {
        if (a.counter < b.counter) {
          return 1;
        }
        if (a.counter > b.counter) {
          return -1;
        }
        // a должно быть равным b
        return 0;
    }

    let findAllUniq = (arrIn, arrOut) => {
        for (let i = 0; i < arrIn.length; i++){
            let isWord = false;
            for (let n = 0; n < arrOut.length; n++) {
                if (arrIn[i] == arrOut[n].arg) {
                    isWord = true;
                    arrOut[n].counter++
                    break;
                }
            }
            if (isWord == false) {arrOut.push({arg: arrIn[i], counter: 1})}
        }
    }

})


app.listen(3000, () => {
    console.log('App listening on port 3000!');
});