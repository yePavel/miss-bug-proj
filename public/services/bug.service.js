const BASE_URL = '/api/bug/'

export const bugService = {
    query,
    getById,
    save,
    remove,
    createDefaultFilter,
    onDownloadPdf,
    loadLabels
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
    console.log('bug:', bug)
    if (bug._id) {
        return axios.put(BASE_URL + bug._id, bug)
            .then(res => res.data)
    } else {
        return axios.post(BASE_URL, bug)
            .then(res => res.data)
    }
}

function createDefaultFilter() {
    return { txt: '', severity: '', labels: [], sortBy: '', sortDir: '' }
}

function onDownloadPdf() {
    return axios.get(BASE_URL + `download`).then(res => res.data)
}