const express = require('express')
const superagent = require('superagent')
const cheerio = require('cheerio')
const url = require('url')
const EventProxy = require('eventproxy')

const app = express()
const port = 3000
const requestUrl = 'https://cnodejs.org/'
const len = 4

app.get('/', (req, res,next) => {
    superagent.get(requestUrl).end((err, html) => {
        if(err){
            return next(err)
        }else{
            let urls = []
            const $ = cheerio.load(html.text)
            $('#topic_list .topic_title').map((i,el)=>{
                if(i < len){
                    const topicElement = $(el)
                    const commentUrl = url.resolve(requestUrl,topicElement.attr('href'))
                    urls.push(commentUrl)
                }
            })
            var ep = new EventProxy()
            ep.after('got_file', len, function (list) {
                // 在所有文件的异步执行结束后将被执行
                // 所有文件的内容都存在list数组中
                let items = []
                list.map((item,i)=>{
                    const $ = cheerio.load(item.text)
                    console.log(item.url)
                    items.push({
                        title: $('.topic_full_title').text().trim(),
                        href: item.url,
                        comment1:  $('.panel .reply_content p').eq(0).text().trim(),
                    })
                })
                res.send(items)
            })

            urls.forEach(item=>{
                superagent.get(item).end((err,response)=>{
                    ep.emit('got_file', {text:response.text,url: item});
                })
            })
        }
    })
})

app.listen(port, () => console.log(`Example app listening on port ${port}!`))