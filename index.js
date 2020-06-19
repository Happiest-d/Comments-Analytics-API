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

    getCooments.then(comments => {
        console.log(comments.length);
        console.log(comments[0]);
        const end = new Date().getTime();
        const timeUdate = new Promise((resolve, reject) => {
            timeFind(start, end);
            resolve();
        })
        timeUdate.then(() => {
            const reqJson = JSON.stringify(reqTime);
            res.send(reqJson);
            console.log(reqJson);
        })
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

});

app.listen(3000, () => {
    console.log('App listening on port 3000!');
});