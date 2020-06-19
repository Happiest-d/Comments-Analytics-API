const express = require('express');
const prs = require('body-parser');
const request = require('request');

const app = express();

app.use(prs.json());

app.post('/api/comments', (req, res) => {
    const start = new Date().getTime();
    const comments = req.body;
    const link = 'https://jsonplaceholder.typicode.com/comments';

    const p = new Promise((resolve, reject) => {
        request(link, (error, response, body) => {
            console.error('error:', error); // Print the error if one occurred
            console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
            //console.log('body:', body); 
            resolve();
        });
    })

    p.then(() =>{
        const end = new Date().getTime()
        const time = end - start
        const req = {
            'time': time,
        }
        const reqJson = JSON.stringify(req);
        res.send(reqJson);
        console.log(reqJson);
    })  
});

app.listen(3000, () => {
    console.log('App listening on port 3000!');
});