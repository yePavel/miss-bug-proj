
import { utilService } from './util.service.js'

export const bugService = {
    query,
    getById,
    save,
    remove,
    getLabels
}

var bugs = utilService.readJsonFile('./data/bug.json')

function query(filterBy) {
    console.log('filterBy:', filterBy)
    var filteredBugs = bugs
    if (!filterBy) return Promise.resolve(filteredBugs)
    const regExp = new RegExp(filterBy.txt, 'i')

    filteredBugs = bugs.filter((bug) =>
        (regExp.test(bug.description) || regExp.test(bug.title)) &&
        bug.severity >= filterBy.severity
        // bug.labels.some(label => label.includes(filterBy.labels))
    )

    if (filterBy.labels?.length) {
        filteredBugs = filteredBugs.filter(bug => filterBy.labels.every(label => bug.labels.includes(label)))
    }

    if (filterBy.sortBy.length > 0) {
        console.log('filterBy.sortBy:', filterBy.sortBy)
        switch (filterBy.sortBy) {
            case 'title':
                filteredBugs.sort((a, b) =>
                    (a.title.toLowerCase().localeCompare(b.title.toLowerCase())) * filterBy.sortDir
                )
                break;
            case 'severity':
                filteredBugs.sort((a, b) =>
                    (a.severity - b.severity) * filterBy.sortDir
                )
                break;
            case 'date':
                filteredBugs.sort((a, b) =>
                    (a.createdAt - b.createdAt) * filterBy.sortDir
                )
                break;
        }
    }
    return Promise.resolve(filteredBugs)
}

function getLabels() {
    return query().then(bugs => {
        const bugsLabels = bugs.reduce((acc, bug) => {
            return [...acc, ...bug.labels]
        }, [])
        return [...new Set(bugsLabels)]
    })
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

