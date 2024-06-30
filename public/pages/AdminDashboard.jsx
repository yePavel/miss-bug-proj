import { userService } from "../services/user.service.js"

const { useState, useEffect } = React

export function AdminDashboard() {

    const [users, setUsers] = useState([])

    useEffect(() => {
        getUsersList()
    }, [])

    function getUsersList() {
        userService.query()
            .then(res => setUsers(res))
    }

    function removeUser(user) {
        userService.remove(user._id)
            .then(() => {
                const updatedUsers = users.filter((u) => u._id !== user._id)
                setUsers(updatedUsers)
            })
    }

    return (
        <section>
            <h1>Users List:</h1>
            <ul className="user-list">
                {users.map((user) => (
                    <li className="user-preview" key={user._id}>
                        <span>{user.username} </span>
                        <span>{user.fullname}</span>
                        <button onClick={() => removeUser(user)}>Remove user</button>
                    </li>
                ))}
            </ul>
        </section>

    )

}