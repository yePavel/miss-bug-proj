import { userService } from "../services/user.service.js"
import { bugService } from "../services/bug.service.js"
import { showSuccessMsg, showErrorMsg } from '../services/event-bus.service.js'
import { BugList } from '../cmps/BugList.jsx'

const { useParams, useNavigate, Link } = ReactRouterDOM
const { useEffect, useState } = React

export function UserDetails() {
    const navigate = useNavigate()
    const [user, setUser] = useState(userService.getLoggedInUser())
    const [bugs, setBugs] = useState([])

    useEffect(() => {
        if (!user) {
            navigate('/')
            return
        }
        loadUserBugs()
    }, [user])

    function loadUserBugs() {
        bugService.query({ userId: user._id })
            .then(res => {
                setBugs(res)
            })
    }

    function onRemoveBug(bugId) {
        bugService
            .remove(bugId)
            .then(() => {
                setBugs(prevBugs => prevBugs.filter((bug) => bug._id !== bugId))
                console.log('Deleted Succesfully!')
                showSuccessMsg('Bug removed')
            })
            .catch((err) => {
                console.log('Error from onRemoveBug ->', err)
                showErrorMsg('Cannot remove bug')
            })
    }

    function onEditBug(bug) {
        const severity = +prompt('New severity?')
        const bugToSave = { ...bug, severity }
        bugService
            .save(bugToSave)
            .then((savedBug) => {
                console.log('Updated Bug:', savedBug)
                setBugs(prevBugs => prevBugs.map((currBug) =>
                    currBug._id === savedBug._id ? savedBug : currBug
                ))
                showSuccessMsg('Bug updated')
            })
            .catch((err) => {
                console.log('Error from onEditBug ->', err)
                showErrorMsg('Cannot update bug')
            })
    }


    if (!user) return <div>Loading...</div>
    return (
        <section>
            <h1>{user.fullname}</h1>
            <h3>Bugs List:</h3>
            {bugs && bugs.length ?
                <BugList bugs={bugs} onRemoveBug={onRemoveBug} onEditBug={onEditBug} />
                : <h1>No bugs today</h1>
            }
        </section>
    )

}