
import { utilService } from './util.service.js'

export const bugService = {
    query,
    getById,
    save,
    remove,
}

var bugs = utilService.readJsonFile('./data/bug.json')

function query(filterBy = { txt: '', severity: 0, labels: '', sortBy }) {
    const regExp = new RegExp(filterBy.txt, 'i')

    var filteredBugs = bugs.filter((bug) =>
        (regExp.test(bug.description) || regExp.test(bug.title)) &&
        bug.severity >= filterBy.severity &&
        bug.labels.some(label => label.includes(filterBy.labels)
        )
    )

    if (filterBy.sortBy.length > 0) {
        console.log('filterBy.sortBy:', filterBy.sortBy)
        switch (filterBy.sortBy) {
            case 'title':
                filteredBugs.sort((a, b) =>
                    a.title.toLowerCase().localeCompare(b.title.toLowerCase())
                )
                break;
            case 'severity':
                filteredBugs.sort((a, b) =>
                    a.severity - b.severity
                )
                break;
            case 'date':
                filteredBugs.sort((a, b) =>
                    a.createdAt - b.createdAt
                )
                break;
        }
    }
    console.log('filteredBugs!~!~!', filteredBugs)
    return Promise.resolve(filteredBugs)
}

function getById(bugId) {
    const currBug = bugs.find(bug => bug._id === bugId)
    return Promise.resolve(currBug)
}

function remove(bugId) {
    const idx = bugs.findIndex(bug => bug._id === bugId)
    bugs.splice(idx, 1)
    return _saveBugsToFile()
}

function save(bugToSave) {
    if (bugToSave._id) {
        const idx = bugs.findIndex(bug => bug._id === bugToSave._id)
        bugs.splice(idx, 1, bugToSave)
    } else {
        bugToSave._id = utilService.makeId()
        bugToSave.createdAt = new Date()
        bugs.push(bugToSave)
    }
    return _saveBugsToFile()
        .then(() => bugToSave)
}

function _saveBugsToFile() {
    return utilService.writeJsonFile('./data/bug.json', bugs)
}

