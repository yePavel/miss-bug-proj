import fs from 'fs'
import Cryptr from 'cryptr'
import { utilService } from './util.service.js'

const cryptr = new Cryptr(process.env.SECRET1 || 'secret-key-1234')
const users = utilService.readJsonFile('data/user.json')
export const userService = {
    query,
    checkLogin,
    signup,
    getLoginToken,
    validateLoginToken,
    getById,
    remove
}

function query() {
    return Promise.resolve(users)
}

function remove(userId) {
    console.log('users:', users)
    var idx = users.findIndex(user => user._id === userId)
    console.log('idx from user.service.js', idx)
    if (idx === -1) return Promise.reject('cant find user!')

    users.splice(idx, 1)
    return _saveUsersToFile()
}

function getById(userId) {
    var user = users.find(user => user._id === userId)
    if (!user) return Promise.reject('cant find user!')

    user = {
        _id: user._id,
        username: user.username,
        fullname: user.fullname,
    }

    return Promise.resolve(user)
}

function validateLoginToken(token) {
    try {
        const str = cryptr.decrypt(token)
        const user = JSON.parse(str)
        return user
    } catch (err) {
        console.log('Invalid login')
        return null
    }
}

function getLoginToken(user) {
    return cryptr.encrypt(JSON.stringify(user))
}

function checkLogin({ username, password }) {
    var user = users.find(user => user.username === username && user.username === password)

    if (!user) return Promise.reject('Invalid username or password')
    user = {
        _id: user._id,
        fullname: user.fullname,
        isAdmin: user.isAdmin
    }

    return Promise.resolve(user)
}

function signup(user) {
    const { fullname, username, password } = user
    if (!fullname || !username || !password) return Promise.reject('Incomplete credentials')

    user._id = utilService.makeId()
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