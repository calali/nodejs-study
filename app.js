const express = require('express')
const superagent = require('superagent')
const cheerio = require('cheerio')
const url = require('url')
const EventProxy = require('eventproxy')

const app = express()
const port = 3000
const requestUrl = 'https://cnodejs.org/'
const len = 4
const getNewsUrl = ($)=>{
    let urls = []
    $('#topic_list .topic_title').map((i,el)=>{
        if(i < len){
            const topicElement = $(el)
            const commentUrl = url.resolve(requestUrl,topicElement.attr('href'))
            urls.push(commentUrl)
        }
    })
    return urls
}

const getCommentInfo = (urls,res)=>{
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
                author1:  $('.panel .reply_author').eq(0).text().trim(),
                author1Url:url.resolve(requestUrl,$('.panel .user_avatar').eq(0).attr('href')),
            })
            res.send(items)
            //查询作者积分
            return
            items.map(item=>{
                superagent.get(item.author1Url).end((err,response)=>{
                    const $ = cheerio.load(response.text)
                    const score = $('.user_profile .big').text()
                    item.score1 = score
                    ep.emit('get_score', {item: item});
                })
            })
            ep.after('get_score',len,function(scoreList){
                //和items进行合并返回
                res.send(scoreList)
            })
        })
    })

    urls.map(item=>{
        superagent.get(item).end((err,response)=>{
            ep.emit('got_file', {text:response.text,url: item});
        })
    })
}
app.get('/', (req, res,next) => {
    superagent.get(requestUrl).end((err, html) => {
        if(err){
            return next(err)
        }else{
            const $ = cheerio.load(html.text)
            //获取每条新闻的连接
            const urls = getNewsUrl($)
            //获取每个连接打开后的标题、评论及作者名字和作者个人页链接
            getCommentInfo(urls,res)
            
        }
    })
})

app.listen(port, () => console.log(`Example app listening on port ${port}!`))