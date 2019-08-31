const express = require('express')
const superagent = require('superagent')
const cheerio = require('cheerio')
const url = require('url')
const EventProxy = require('eventproxy')
const mapLimit =  require('async/mapLimit')

const app = express()
const port = 3000
const requestUrl = 'https://cnodejs.org/'
const len = 0 //最多抓取的数据个数，为0则当页全部抓取
const limit = 5 //最大请求并发数
const getNewsUrl = ($)=>{
    let urls = []
    $('#topic_list .topic_title').map((i,el)=>{
        if(i < len || $('#topic_list .topic_title').length){
            const topicElement = $(el)
            const commentUrl = url.resolve(requestUrl,topicElement.attr('href'))
            urls.push(commentUrl)
        }
    })
    return urls
}

const getCommentInfo = (urls,res)=>{
    var ep = new EventProxy()
    mapLimit(urls, 5, function (url, callback) {
        fetchUrl(url, callback)
    }, function (err, result) {
        console.log('final:')
        console.log(result)
        res.end(JSON.stringify(result))
    })
    function fetchUrl(url,callback){
        superagent.get(url).end((err,response)=>{
            const $ = cheerio.load(response.text)
            const title = $('.topic_full_title').text().trim()
            const href = url
            const comment1 = $('.panel .reply_content p').eq(0).text().trim()
            callback(null,  {title,href,comment1})
        })
    }
    return
      
    ep.after('got_file', len || urls.length, function (list) {
        // 在所有文件的异步执行结束后将被执行
        // 所有文件的内容都存在list数组中
        let resultArr = []
        list.map((item,i)=>{
            const $ = cheerio.load(item.text)
            const title = $('.topic_full_title').text().trim()
            const href = item.url
            const comment1 = $('.panel .reply_content p').eq(0).text().trim()
           resultArr.push({
                title,
                href,
                comment1
           })
        })
        res.send(resultArr)
    })

    urls.map(item=>{
        superagent.get(item).end((err,response)=>{
            ep.emit('got_file', {text:response.text,url: item})
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