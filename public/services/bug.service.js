const BASE_URL = '/api/bug/'

export const bugService = {
    query,
    getById,
    save,
    remove,
    createDefaultFilter,
    downloadPdf,
    loadLabels,
    getPageCount
}

function query(filterBy) {
    return axios.get(BASE_URL, { params: filterBy })
        .then(res => res.data)
}

function getById(bugId) {
    return axios.get(BASE_URL + `${bugId}`)
        .then(res => res.data)
        .catch(err => {
            console.log('err:', err)
            throw err
        })
}

function loadLabels() {
    return axios.get(BASE_URL + 'labels')
        .then(res => res.data)
}

function remove(bugId) {
    return axios.delete(BASE_URL + `${bugId}`)
        .then(res => res.data)
}

function save(bug) {

    if (bug._id) {
        return axios.put(BASE_URL, bug)
            .then(res => res.data)
            .catch(err => {
                console.log('err:', err)
                throw err
            })
    } else {
        return axios.post(BASE_URL, bug)
            .then(res => res.data)
            .catch(err => {
                console.log('err:', err)
                throw err
            })
    }
}

function createDefaultFilter() {
    return { txt: '', severity: '', pageIdx: 0, labels: [], sortBy: '', sortDir: '', userId: '' }
}

function downloadPdf() {
    return axios.get(BASE_URL + `download`)
        .then(res => res.data)
}

function getPageCount() {
    return axios.get(BASE_URL + 'pageCount')
        .then(res => res.data)
}