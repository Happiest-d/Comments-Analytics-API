const express = require('express')
const prs = require('body-parser')
//const request = require('request')
const fetch = require('node-fetch')

const app = express()

let reqTime = {
    last: 0,
    sumTime: 0,
    sumReq: 0,
    avgTime: 0,
    allReqTime: [],
    periodReq: 0
}

app.use(prs.json())

app.post('/api/comments', (req, res) => {
    //const dataInput = req.body;
    async function getData() {
        const start = new Date().getTime()
        const link = 'https://jsonplaceholder.typicode.com/comments'
        const response = await fetch(link)
        const comments = await response.json()
    
        //Поиск автора максимального кол-ва комментариев
        let email = comments.map(comment => comment.email)
        const uniqMail = findAllUniq(email)
        uniqMail.sort(sortDescending)
        
    
        //Поиск 5 наиболее частых слов
        let allWords = []
        comments.forEach(comment => {
            const words = findWords(comment.body)
            words.forEach(word => allWords.push(word))
        })
        let uniqWords = findAllUniq(allWords)
        uniqWords.sort(sortDescending)
    
    
        //вывод результата
        const end = new Date().getTime()
        timeFind(start, end)
        //console.log(data)
        const resData = {
            author: uniqMail[0],
            words: uniqWords.slice(0,5),
            time: reqTime
        }
        res.json(resData)
    }

    getData()
    
})


const timeFind = (start, end) => {
    reqTime.last = end - start
    reqTime.sumTime += reqTime.last
    reqTime.sumReq++
    reqTime.avgTime = reqTime.sumTime / reqTime.sumReq
    reqTime.allReqTime[reqTime.sumReq-1] = end
    //кол-во запросов за поледнюю минуту
    reqTime.periodReq = 0
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

    // let arrOut = arrIn.reduce((total, element) => {
    //     const wordIndex = total.findIndex(uniqElement => element == uniqElement.arg)
    //     if (wordIndex >= 0) {
    //         total[wordIndex].counter++
    //     } else {
    //         total.push({arg: element, counter: 1})
    //     }
    // }, new Array())

    return arrOut
}

const findWords = (string) => {
    const wordsFilter = /[^a-zA-Z_]/
    const splitString = string.split(wordsFilter)
    const words = splitString.filter(word => word != '' )
    return words
}


app.listen(3000, () => {
    console.log('App listening on port 3000!')
});