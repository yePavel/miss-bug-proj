import express from 'express'

import { bugService } from './services/bug.service.js'

const app = express()
app.use(express.static('public'))

app.get('/api/bug', (req, res) => {
    bugService.query()
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

app.get('/api/bug/:bugId', (req, res) => {
    const { bugId } = req.params

    bugService.getById(bugId)
        .then(bug => res.send(bug))

})

app.get('/api/bug/:bugId/remove', (req, res) => {
    const { bugId } = req.params
    bugService.remove(bugId)
        .then(() => res.send(`Bug ${bugId} has been deleted..`))

})

app.listen(3030, () => console.log('Server ready at port 3030')) 