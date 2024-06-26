import fs from 'fs'
import Cryptr from 'cryptr'
import { utilService } from './util.service.js'

const cryptr = new Cryptr(process.env.SECRET1 || 'secret-puk-1234')
const users = utilService.readJsonFile('data/user.json')

export const userService = {
    query,
    checkLogin,
    save,
    getLoginToken
}

function query() {
    return Promise.resolve(users)
}

function getLoginToken(user) {
    const str = JSON.stringify(user)
    const encryptedStr = cryptr.encrypt(str)
    return encryptedStr
}

function checkLogin({ username, password }) {
    var user = users.find(user => user.username === username)
    console.log('user:', user)
    if (user) {
        user = {
            _id: user._id,
            fullname: user.fullname,
            isAdmin: user.isAdmin
        }
    }
    return Promise.resolve(user)
}

function save(user) {
    user._id = utilService.makeId
    users.push(user)
    return _saveUsersToFile().then(() => ({
        _id: user._id,
        fullname: user.fullname,
        isAdmin: user.isAdmin
    }))
}

function _saveUsersToFile() {
    return new Promise((resolve, reject) => {
        const usersStr = JSON.stringify(users, null, 2)
        fs.writeFile('data/user.json', usersStr, (err) => {
            if (err) {
                return console.log(err);
            }
            resolve()
        })
    })
}