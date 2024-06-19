import { utilService } from "../services/util.service.js"

const { useState, useEffect } = React

export function BugFilter({ filterBy, onSetFilterBy }) {

    const [filterByToEdit, setFilterByToEdit] = useState({ ...filterBy })

    useEffect(() => {
        onSetFilterBy(filterByToEdit)
    }, [filterByToEdit])

    function handleChange({ target }) {
        console.log('target.value:', target.value)
        const { name, type } = target
        const value = (type === 'number') ? +target.value : target.value
        setFilterByToEdit(prevFilterBy => ({ ...prevFilterBy, [name]: value }))
    }

    const { txt, severity, labels, sortBy } = filterByToEdit

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
            <input onChange={handleChange}
                value={labels}
                name="labels"
                type="text"
                placeholder="Labels search.." />

            <label htmlFor="sortBy-select">Sort by:</label>
            <select onChange={handleChange} name="sortBy" id="sortBy-select" >
                <option value="">--Please choose an option--</option>
                <option value="title">Title</option>
                <option value="severity">Severity</option>
                <option value="date">Date</option>
            </select>
            <div className="sortBy-container">
                <label htmlFor="sortBy-dir-des">Descending</label>
                <input id='sortBy-dir-des' onChange={handleChange}
                    name='sortDir'
                    type="radio"
                    value='des' />
                <label htmlFor="sortBy-dir-asc">Ascending</label>
                <input id='sortBy-dir-asc' onChange={handleChange}
                    name='sortDir'
                    type="radio"
                    value="asc" />
            </div>

        </section>
    )
}