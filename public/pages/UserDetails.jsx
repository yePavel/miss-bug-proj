import { userService } from "../services/user.service.js"
const { useParams, useNavigate, Link } = ReactRouterDOM
const { useEffect, useState } = React

export function UserDetails() {

    const navigate = useNavigate()
    const params = useParams()
    const [user, setUser] = useState(null)

    useEffect(() => {
        loadUser()
    }, [params.userId])

    function loadUser() {
        userService.get(params.userId)
            .then(setUser)
            .catch(err => {
                console.log('err:', err)
                navigate('/')
            })
    }
    if (!user) return <div>Loading...</div>
    return (
        <section>
            <h1>{user.fullname}</h1>
            <pre>
                {JSON.stringify(user, null, 2)}
            </pre>
            <p>Lorem ipsum dolor sit amet consectetur.</p>
        </section>
    )

}