import { storageService } from './async-storage.service.js'

const STORAGE_KEY = 'bugDB'
const BASE_URL = '/api/bug'
export const bugService = {
    query,
    getById,
    save,
    remove,
}

function query() {
    return axios.get(BASE_URL).then(res => res.data)
}

function getById(bugId) {
    return axios.get(BASE_URL + `/${bugId}`).then(res => res.data)
}

function remove(bugId) {
    return axios.get(BASE_URL + `/${bugId}/remove`).then(res => res.data)
}

function save(bug) {
    const { _id, title, severity, description, createdAt } = bug
    if (bug._id) {
        return axios.get(BASE_URL + `/save?_id=${_id}&severity=${severity}&title=${title}&description=${description}&createdAt=${createdAt}`)
            .then(res => res.data)
    } else {
        return axios.get(BASE_URL + `/save?severity=${severity}&title=${title}&description=${description}&createdAt=${createdAt}`)
            .then(res => res.data)
    }
}