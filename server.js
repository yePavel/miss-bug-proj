import express from 'express'
import cookieParser from 'cookie-parser'
import PDFDocument from 'pdfkit'
import fs from 'fs'

import { bugService } from './services/bug.service.js'
import { loggerService } from './services/logger.service.js'
import { userService } from './services/user.service.js'
import { error } from 'console'

const app = express()
app.use(express.static('public'))
app.use(cookieParser())
app.use(express.json())

app.get('/api/bug/', (req, res) => {
    const filterBy = {
        txt: req.query.txt || '',
        severity: +req.query.severity || 0,
        labels: req.query.labels || [],
        sortBy: req.query.sortBy || '',
        pageIdx: req.query.pageIdx || 0,
        sortDir: req.query.sortDir === 'des' ? -1 : 1
    }

    bugService.query(filterBy)
        .then(bugs => res.send(bugs))
        .catch(err => {
            loggerService.error(`Couldn't get bug ${bugId}`, err)
            res.status(500).send(`Couldn't get bugs...`)
        })
})

app.get('/api/bug/pageCount', (req, res) => {
    bugService.getPageCount()
        .then(pageCount => res.send(pageCount + ''))
        .catch(err => {
            loggerService.error(`Couldn't get page count`, err)
            res.status(500).send(`Couldn't get page count...`)
        })
})

app.get('/api/bug/labels', (req, res) => {
    bugService.getLabels()
        .then(labels => res.send(labels))
        .catch(err => {
            loggerService.error(`Couldn't get bug ${bugId}`, err)
            res.status(500).send(`Couldn't get bugs...`)
        })
})

app.put('/api/bug/', (req, res) => {
    const { _id, title, severity, description, createdAt, labels } = req.body

    const bugToSave = {
        _id,
        title: title || '',
        description: description || '',
        createdAt: +createdAt || 0,
        severity: +severity || 0,
        labels: labels || []
    }
    bugService.save(bugToSave)
        .then(savedBug => res.send(savedBug))
        .catch(err => {
            loggerService.error(`Couldn't update bug ${bugToSave._id}`, err)
            res.status(500).send(`Couldn't update bug ${bugToSave._id}`)
        })

})

app.post('/api/bug/', (req, res) => {
    const { title, severity, description, createdAt, labels } = req.body

    const bugToSave = {
        title: title || '',
        description: description || '',
        createdAt: +createdAt || 0,
        severity: +severity || 0,
        labels: labels || []
    }
    bugService.save(bugToSave)
        .then(savedBug => res.send(savedBug))
})

app.get('/api/bug/download', (req, res) => {
    const doc = new PDFDocument();
    doc.pipe(fs.createWriteStream('bugs.pdf'));
    doc.fontSize(25)
        .text('Bugs List', 100, 100);

    bugService.query().then(bugs => {
        bugs.forEach(bug => {
            var bugTxt = `${bug.title}, ${bug.description}, 
            severity:${bug.severity}`

            doc.text(bugTxt);
        })
        doc.end()
        res.end()
    })
        .catch(error => {
            loggerService.error(`Couldn't download PDF`, error)
            res.status(500).send(`Couldn't download`)
        })
})

app.get('/api/bug/:bugId', (req, res) => {
    const { bugId } = req.params

    var visitedBugs = req.cookies.visitedBugs || []
    if (visitedBugs.length >= 3) return res.status(401).send('Wait for a bit')
    if (!visitedBugs.includes(bugId)) visitedBugs.push(bugId)
    res.cookie('visitedBugs', visitedBugs, { maxAge: 10000 })
    console.log('user visited at the following bugs:', visitedBugs)

    bugService.getById(bugId)
        .then(bug => res.send(bug))
        .catch(err => {
            loggerService.error(`Couldn't get bug ${bugId}`, err)
            res.status(500).send(`Couldn't get bug ${bugId}`)
        })
})

app.delete('/api/bug/:bugId', (req, res) => {
    const { _id } = req.body
    bugService.remove(_id)
        .then(() => res.send(`Bug ${_id} has been deleted..`))
        .catch(err => {
            loggerService.error(`Couldn't delete bug ${_id}`, err)
            res.status(500).send(`Couldn't delete bug ${_id}`)
        })
})

// AUTH API ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

app.get('/api/user', (req, res) => {
    userService.query()
        .then((users) => {
            res.send(users)
        })
        .catch((err) => {
            console.log('Cannot load users', err)
            res.status(400).send('Cannot load users')
        })
})

app.post('/api/auth/signup', (req, res) => {
    const credentials = req.body

    userService.save(credentials)
        .then(user => {
            if (user) {
                const loginToken = userService.getLoginToken(user)
                res.cookie('loginToken', loginToken)
                res.send(user)
            } else {
                res.status(401).send('Invalid Credentials')
            }
        })
})

app.post('/api/auth/login', (req, res) => {
    const credentials = req.body
    userService.checkLogin(credentials)
        .then(user => {
            if (user) {
                const loginToken = userService.getLoginToken(user)
                res.cookie('loginToken', loginToken)
                res.send(user)
            } else {
                res.status(401).send('Invalid Credentials')
            }
        })
})

app.post('/api/auth/logout', (req, res) => {
    res.clearCookie('loginToken')
    res.send('logged-out!')
})



app.listen(3030, () => console.log('Server ready at port 3030')) 