const express = require('express');
const bodyParser = require('body-parser');
const fetch = require('node-fetch');

const app = express();
const link = 'https://jsonplaceholder.typicode.com/comments';
const reqTime = {
    last: 0,
    sumTime: 0,
    sumReq: 0,
    avgTime: 0,
    allReqTime: [],
    periodReq: 0
};

app.use(bodyParser.json());

app.post('/api/comments', async(req, res) => {
    //const dataInput = req.body;
    const startTime = new Date().getTime();
    const response = await fetch(link);
    const comments = await response.json();

    //Search for the author of the maximum number of comments
    const emails = comments.map(comment => comment.email);
    const uniqMails = findAllUniq(emails).sort((a, b) => b.counter - a.counter);
    

    //Search for the most used words
    const allWords = comments.map(comment => findWords(comment.body)).flat()
    const uniqWords = findAllUniq(allWords).sort((a, b) => b.counter - a.counter);


    //result output
    const endTime = new Date().getTime();
    timeFind(startTime, endTime);
    const resData = {
        author: uniqMails[0],
        words: uniqWords.slice(0,5),
        time: reqTime
    };

    res.json(resData);
});


const timeFind = (start, end) => {
    reqTime.last = end - start;
    reqTime.sumTime += reqTime.last;
    reqTime.sumReq++;
    reqTime.avgTime = reqTime.sumTime / reqTime.sumReq;
    reqTime.allReqTime[reqTime.sumReq - 1] = end;
    reqTime.periodReq = 0;
    for (let i = 0; i < (reqTime.sumReq); i++) {
        if (0 <= end - reqTime.allReqTime[i] && end - reqTime.allReqTime[i] <= 60000) reqTime.periodReq++;
    }
};


const findAllUniq = (arrayInput) => {
    const arrayOutput = arrayInput.reduce((uniqArgs, input) => {
        const wordIndex = uniqArgs.findIndex(uniqElement => input === uniqElement.arg);
        if (wordIndex >= 0) {
            uniqArgs[wordIndex].counter++;
        } else {
            uniqArgs.push( {arg: input, counter: 1} );
        }
        return uniqArgs
    }, [])

    return arrayOutput;
};

const findWords = (string) => {
    const wordsFilter = /[^a-zA-Z_']/;
    const splitString = string.split(wordsFilter);
    const wordsArray = splitString.filter(word => word !== '');
    const wordsLowerCase = wordsArray.map(word => word.toLowerCase()).flat();

    return wordsLowerCase;
};


app.listen(3000, () => {
    console.log('App listening on port 3000!');
});