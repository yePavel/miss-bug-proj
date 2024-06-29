
import { utilService } from './util.service.js'

export const bugService = {
    query,
    getById,
    save,
    remove,
    getLabels,
    getPageCount
}

var bugs = utilService.readJsonFile('./data/bug.json')
const PAGE_SIZE = 3

function query(filterBy) {
    var filteredBugs = bugs
    if (!filterBy) return Promise.resolve(filteredBugs)
    const regExp = new RegExp(filterBy.txt, 'i')

    filteredBugs = bugs.filter((bug) =>
        (regExp.test(bug.description) || regExp.test(bug.title)) &&
        bug.severity >= filterBy.severity
    )

    if (filterBy.labels?.length) {
        filteredBugs = filteredBugs.filter(bug => filterBy.labels.every(label => bug.labels.includes(label)))
    }

    if (filterBy.sortBy.length > 0) {
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

    const startIdx = filterBy.pageIdx * PAGE_SIZE
    filteredBugs = filteredBugs.slice(startIdx, startIdx + PAGE_SIZE)
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

function getPageCount() {
    return query().then(bugs => {
        return Math.ceil(bugs.length / PAGE_SIZE)
    })
}

function getById(bugId) {
    const currBug = bugs.find(bug => bug._id === bugId)
    return Promise.resolve(currBug)
}

function remove(bugId, loggedinUser) {
    const idx = bugs.findIndex(bug => bug._id === bugId)
    if (idx === -1) return Promise.reject('No such bug')
    console.log('bugs[idx].creator:', bugs[idx].creator)
    if (bugs[idx].creator._id !== loggedinUser._id && !loggedinUser.isAdmin) {
        return Promise.reject('Not authorized delete this bug')
    }

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

