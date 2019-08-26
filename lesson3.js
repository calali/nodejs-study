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
            $('#topic_list .cell').map((i,el)=>{
                const topicElement = $(el).find('.topic_title')
                const authorElement = $(el).find('.user_avatar img')
                // const title = $element.parent('.cell').find('.user_avatar img').attr('title')
                // console.log(i)
                // console.log( $element.parent('.cell'))
                // console.log( $element.parent('.cell').length)
                arr.push({
                    title: topicElement.attr('title'),
                    href: url.replace(/\/$/,'') + topicElement.attr('href'),
                    author:authorElement.attr('title')
                })
            })
            res.send(arr)
        }
      });
})

app.listen(port, () => console.log(`Example app listening on port ${port}!`))