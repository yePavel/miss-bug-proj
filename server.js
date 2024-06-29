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
        sortDir: req.query.sortDir === 'des' ? -1 : 1,
        userId: req.query.userId || ''
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

// EDIT BUG
app.put('/api/bug/', (req, res) => {
    const loggedInUser = userService.validateLoginToken(req.cookies.loginToken)
    if (!loggedInUser) return res.status(401).send('Cannot update bug')
    const { _id, title, severity, description, createdAt, labels, creator } = req.body

    const bugToSave = {
        _id,
        title: title || '',
        description: description || '',
        createdAt: +createdAt || 0,
        severity: +severity || 0,
        labels: labels || [],
        creator: creator || {}
    }
    bugService.save(bugToSave)
        .then(savedBug => res.send(savedBug))
        .catch(err => {
            loggerService.error(`Couldn't update bug ${bugToSave._id}`, err)
            res.status(500).send(`Couldn't update bug ${bugToSave._id}`)
        })

})

// ADD BUG

app.post('/api/bug/', (req, res) => {
    const loggedInUser = userService.validateLoginToken(req.cookies.loginToken)
    if (!loggedInUser) return res.status(401).send('Cannot update bug')
    const { title, severity, description, createdAt, labels, creator } = req.body
    console.log('loggedInUser:', loggedInUser)
    const bugToSave = {
        title: title || '',
        description: description || '',
        createdAt: +createdAt || 0,
        severity: +severity || 0,
        labels: labels || [],
        creator: loggedInUser || {}
    }
    bugService.save(bugToSave)
        .then(savedBug => res.send(savedBug))
})

// DOWNLOAD BUG LIST
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
// SHOW BUG DETAILS
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
// REMOVE BUG
app.delete('/api/bug/:bugId', (req, res) => {
    const loggedInUser = userService.validateLoginToken(req.cookies.loginToken)
    if (!loggedInUser) return res.status(401).send('Cannot update bug')

    const { bugId } = req.params

    bugService.remove(bugId, loggedInUser)
        .then(() => res.send(`Bug ${bugId} has been deleted..`))
        .catch(err => {
            loggerService.error(`Couldn't delete bug ${bugId}`, err)
            res.status(500).send(`Couldn't delete bug ${bugId}`)
        })
})

app.get('/api/:userId', (req, res) => {
    userService.query()
        .then((users) => {
            res.send(users)
        })
        .catch((err) => {
            console.log('Cannot load users', err)
            res.status(400).send('Cannot load users')
        })
})

app.get('/api/user/:userId', (req, res) => {
    const { userId } = req.params
    console.log('userId:', userId)
    userService.getById(userId)
        .then((user) => {
            console.log('user:', user)
            res.send(user)
        })
        .catch((err) => {
            console.log('Cannot load user', err)
            res.status(400).send('Cannot load user')
        })
})

// AUTH API ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

app.post('/api/auth/signup', (req, res) => {
    const credentials = req.body

    userService.signup(credentials)
        .then(user => {
            const loginToken = userService.getLoginToken(user)
            res.cookie('loginToken', loginToken)
            res.send(user)
        })
        .catch(err => res.status(401).send('Signup failed'))
})

app.post('/api/auth/login', (req, res) => {
    const credentials = req.body

    userService.checkLogin(credentials)
        .then(user => {
            const loginToken = userService.getLoginToken(user)
            res.cookie('loginToken', loginToken)
            res.send(user)
        })
        .catch(err => res.status(401).send(err))
})

app.post('/api/auth/logout', (req, res) => {
    res.clearCookie('loginToken')
    res.send('logged-out!')
})

app.listen(3030, () => console.log('Server ready at port 3030')) 