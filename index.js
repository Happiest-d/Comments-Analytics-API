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

    const getCooments = new Promise((resolve, reject) => {
        request(link, (error, response, body) => {
            console.error('error:', error); // Print the error if one occurred
            console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
            //console.log('body:', body); 
            const bodyArr = JSON.parse(body);
            resolve(bodyArr);
        });
    })

    const getData = new Promise ((resolve, reject) => {
        getCooments.then(comments => {
            //Поиск автора максимального кол-ва комментариев
            let uniqMail = [];
            for (let j = 0; j < comments.length; j++) {
                let isEmail = false;
                for (let i = 0; i < uniqMail.length; i++) {
                    if (comments[j].email == uniqMail[i].email) {
                        isEmail = true;
                        uniqMail[i].counter++;
                        break;
                    }
                }    
                if (isEmail == false) {uniqMail.push({email: comments[j].email, counter: 1})}
            }
            //выбор автора с макс. числом комментариев
            //uniqMail[28].counter=3;
            let maxNum = 0;
            let elemNum = 0;
            for (let i = 0; i < uniqMail.length; i++) {
                if (uniqMail[i].counter > maxNum) {
                    maxNum = uniqMail[i].counter;
                    elemNum = i;
                }
                    
            }
            //console.log(elemNum);
            //console.log(uniqMail[elemNum]);

            //--------------------------------------------------------
            //Поиск 5 наиболее частых слов

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
                    for (let n = 0; n < arr.length; n++) {
                        allWords.push(arr[n])
                    }
                }
                //console.log(allWords);
                //подсчёт количесва слов и добавлении ранее не встречавшихся
                for (let i = 0; i < allWords.length; i++){
                    let isWord = false;
                    for (let n = 0; n < uniqWords.length; n++) {
                        if (allWords[i] == uniqWords[n].word) {
                            isWord = true;
                            uniqWords[n].counter++
                            break;
                        }
                    }
                    if (isWord == false) {uniqWords.push({word: allWords[i], counter: 1})}
                }
            }
            //сортировка по убыванию массива уникальных слов
            for (let i = 0, endI = uniqWords.length - 1; i < endI; i++) {
                for (var j = 0, endJ = endI - i; j < endJ; j++) {
                    if (uniqWords[j].counter < uniqWords[j + 1].counter) {
                        let swap = uniqWords[j].counter;
                        uniqWords[j].counter = uniqWords[j+1].counter;
                        uniqWords[j+1].counter = swap;
                    }
                }
            }
            //выбор 5 наиболее используемых слов
            for (let i = 0; i < 5; i++){
                mostUsed.push(uniqWords[i])
            }


            //------------------------------------------------------
            //console.log(uniqWords);
            //console.log(mostUsed);
            const data = {
                author: uniqMail[elemNum],
                words: mostUsed
            };
            resolve(data)
        })
    })

    getData.then(data => {
            const end = new Date().getTime();
            timeFind(start, end);
            console.log(data);
            const reqData = {
                author: data.author,
                words: data.words,
                time: reqTime
            }
            const reqJson = JSON.stringify(reqData);
            res.send(reqJson);
            console.log(reqJson);
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
})


app.listen(3000, () => {
    console.log('App listening on port 3000!');
});