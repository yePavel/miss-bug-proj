import express from 'express'
import cookieParser from 'cookie-parser'
import PDFDocument from 'pdfkit'
import fs from 'fs'

import { bugService } from './services/bug.service.js'

const app = express()
app.use(express.static('public'))
app.use(cookieParser())
app.use(express.json())

app.get('/api/bug/', (req, res) => {
    const { txt, severity = +severity } = req.query

    bugService.query({ txt, severity })
        .then(bugs => res.send(bugs))
        .catch(err => {
            res.status(500).send(`Couldn't get bugs...`)
        })
})

app.put('/api/bug/:bugId', (req, res) => {
    const { _id, title, severity, description, createdAt } = req.body

    const bugToSave = {
        _id,
        title: title || '',
        description: description || '',
        createdAt: +createdAt || 0,
        severity: +severity || 0
    }
    bugService.save(bugToSave)
        .then(savedBug => res.send(savedBug))

})

app.post('/api/bug/', (req, res) => {
    const { title, severity, description, createdAt } = req.body

    const bugToSave = {
        title: title || '',
        description: description || '',
        createdAt: +createdAt || 0,
        severity: +severity || 0
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
    })
})

app.get('/api/bug/:bugId', (req, res) => {
    const { bugId } = req.params
    var visitedBugs = req.cookies.visitedBugs || []

    if (visitedBugs.length >= 3) res.status(401).send('Wait for a bit')
    if (!visitedBugs.includes(bugId)) visitedBugs.push(bugId)

    res.cookie('visitedBugs', visitedBugs, { maxAge: 7000 })
    console.log('user visited at the following bugs:', visitedBugs)

    bugService.getById(bugId)
        .then(bug => res.send(bug))
})

app.delete('/api/bug/:bugId/remove', (req, res) => {
    const { _id } = req.body
    bugService.remove(_id)
        .then(() => res.send(`Bug ${_id} has been deleted..`))
})

app.listen(3030, () => console.log('Server ready at port 3030')) 