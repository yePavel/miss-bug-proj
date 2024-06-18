import express from 'express'
import cookieParser from 'cookie-parser'
import PDFDocument from 'pdfkit'
import fs from 'fs'

import { bugService } from './services/bug.service.js'

const app = express()
app.use(express.static('public'))
app.use(cookieParser())

app.get('/api/bug', (req, res) => {
    const { txt, severity = +severity } = req.query

    bugService.query({ txt, severity })
        .then(bugs => res.send(bugs))
        .catch(err => {
            res.status(500).send(`Couldn't get bugs...`)
        })
})

app.get('/api/bug/save', (req, res) => {
    const { _id, title, severity, description, createdAt } = req.query
    const bugToSave = {
        _id,
        title,
        description,
        createdAt: +createdAt,
        severity: +severity
    }

    bugService.save(bugToSave)
        .then(savedBug => res.send(savedBug))

})

app.get('/api/bug/download', (req, res) => {
    const doc = new PDFDocument();
    doc.pipe(fs.createWriteStream('bugs.pdf'));
    doc.fontSize(25)
        .text('Bugs List', 100, 100);

    // bugService.query().then(bugs => {
    //     bugs.forEach(bug => {
    //         var bugTxt = `${bug.title}, ${bug.description}, severity:${bug.severity}`
    //         doc.text(bugTxt);
    //     })
    //     doc.end()
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

app.get('/api/bug/:bugId/remove', (req, res) => {
    const { bugId } = req.params
    bugService.remove(bugId)
        .then(() => res.send(`Bug ${bugId} has been deleted..`))

})

app.listen(3030, () => console.log('Server ready at port 3030')) 