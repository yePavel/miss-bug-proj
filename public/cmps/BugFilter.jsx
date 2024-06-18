import { utilService } from "../services/util.service.js"

const { useState, useEffect } = React

export function BugFilter({ filterBy, onSetFilterBy }) {

    const [filterByToEdit, setFilterByToEdit] = useState({ ...filterBy })

    useEffect(() => {
        onSetFilterBy(filterByToEdit)
    }, [filterByToEdit])

    function handleChange({ target }) {
        const { name, type } = target
        const value = (type === 'number') ? +target.value : target.value
        setFilterByToEdit(prevFilterBy => ({ ...prevFilterBy, [name]: value }))
    }

    const { txt, severity } = filterByToEdit

    return (
        <section className="bug-filter">
            <h3>Filter</h3>
            <input onChange={handleChange}
                value={txt}
                name="txt"
                type="text"
                placeholder="Text search.." />
            <input onChange={handleChange}
                value={severity}
                name="severity"
                type="number"
                placeholder="Severity search.." />
        </section>
    )
}