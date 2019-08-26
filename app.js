const express = require('express')
const superagent = require('superagent')
const cheerio = require('cheerio')
const app = express()
const port = 3000
const url = 'https://cnodejs.org/'

app.get('/', (req, res,next) => {
    //SuperAgent发送请求
    superagent.get(url).end((err, html) => {
        // Calling the end function will send the request
        if(err){
            return next(err);
        }else{
            let arr = []
            const $ = cheerio.load(html.text)
            $('#topic_list .topic_title').map((i,el)=>{
                const $element = $(el)
                const title = $element.parent('.topic_title_wrapper').nextAll('.user_avatar').children('img').attr('title')
                console.log($element.parent('.topic_title_wrapper').nextAll('.user_avatar'))
                arr.push({
                    title: $element.attr('title'),
                    href: url.replace(/\/$/,'') + $element.attr('href'),
                    // author:123
                })
            })
            res.send(arr)
        }
      });
})

app.listen(port, () => console.log(`Example app listening on port ${port}!`))