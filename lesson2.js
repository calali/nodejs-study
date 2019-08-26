const express = require('express')
const crypto = require('crypto');
const app = express()
const port = 3000

app.get('/', (req, res) => {
    const q = req.query.q
    if(q){
        const md5 = crypto.createHash('md5')
        res.send(md5.update(q, 'utf8').digest('hex'))
    }else{
        res.send('no q')
    }
    
})

app.listen(port, () => console.log(`Example app listening on port ${port}!`))