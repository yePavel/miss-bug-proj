import { utilService } from "../services/util.service.js"

const { useState, useEffect } = React

export function BugFilter({ filterBy, onSetFilterBy, labels: availableLabels }) {

    const [filterByToEdit, setFilterByToEdit] = useState({ ...filterBy })

    useEffect(() => {
        onSetFilterBy(filterByToEdit)
    }, [filterByToEdit])

    function handleChange({ target }) {
        const { name, type } = target
        let value = target.value

        switch (type) {
            case 'number':
                value = +value || ''
                break;

            case 'checkbox':
                value = value.checked ? 1 : -1
                break;

            default:
                break;
        }

        setFilterByToEdit(prevFilterBy => ({ ...prevFilterBy, [name]: value }))
    }

    function handleLabelChange({ target }) {
        const { name: label, checked: isChecked } = target

        setFilterByToEdit(prevFilter => ({
            ...prevFilter,
            labels: isChecked ? [...prevFilter.labels, label]
                : prevFilter.labels.filter(lbl => lbl !== label)
        }))
    }

    function onGetPage(dir) {
        let pageIdx = filterByToEdit.pageIdx + dir
        if (pageIdx < 0) return
        setFilterByToEdit(prev => ({ ...prev, pageIdx }))
    }
    const { txt, severity, labels, sortBy, pageIdx } = filterByToEdit

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


            <div className="labels-container">
                <h3>Labels:</h3>
                {availableLabels.map(label => (
                    <label key={label}>
                        <input
                            type="checkbox"
                            name={label}
                            checked={labels.includes(label)}
                            onChange={handleLabelChange}
                        />
                        {label}
                    </label>
                ))}
            </div>

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

            <div>
                <button onClick={() => onGetPage(-1)}>Prev page</button>
                <span>-{pageIdx}-</span>
                <button onClick={() => onGetPage(1)}>Next page</button>
            </div>

        </section>
    )
}