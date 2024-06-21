import { bugService } from '../services/bug.service.js'
import { showSuccessMsg, showErrorMsg } from '../services/event-bus.service.js'
import { BugList } from '../cmps/BugList.jsx'
import { BugFilter } from '../cmps/BugFilter.jsx'
import { pdfService } from '../services/pdf.service.js'
import { utilService } from '../services/util.service.js'

const { useState, useEffect, useRef } = React

export function BugIndex() {
  const [bugs, setBugs] = useState([])
  const [labels, setLabels] = useState([])
  const [filterBy, setFilterBy] = useState(bugService.createDefaultFilter())
  const debouncedSetFilterBy = useRef(utilService.debounce(onSetFilterBy, 500))

  useEffect(() => {
    loadLabels()
  }, [])

  useEffect(() => {
    loadBugs()
  }, [filterBy])


  function loadBugs() {
    console.log('filterBy:', filterBy)
    bugService.query(filterBy)
      .then(setBugs)
      .catch(err => console.log('err:', err))
  }

  function loadLabels() {
    bugService.loadLabels()
      .then(labels => setLabels(labels))
      .catch(err => {
        showErrorMsg(`Cannot get labels`)
        console.log('err:', err)
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

  function onAddBug() {
    const bug = {
      title: prompt('Bug title?'),
      description: prompt('Insert description:'),
      severity: +prompt('Bug severity?'),
      labels: [prompt('Bug label?')]
    }
    bugService
      .save(bug)
      .then((savedBug) => {
        console.log('Added Bug', savedBug)
        setBugs(prevBugs => [...prevBugs, savedBug])
        showSuccessMsg('Bug added')
      })
      .catch((err) => {
        console.log('Error from onAddBug ->', err)
        showErrorMsg('Cannot add bug')
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

  function onCreatePdf() {
    bugService.onDownloadPdf()
  }

  function onSetFilterBy(filterBy) {
    setFilterBy(prevFilter => ({ ...prevFilter, ...filterBy }))
  }

  return (

    <main>
      <h3>Bugs App</h3>
      <main>
        <BugFilter filterBy={filterBy} onSetFilterBy={debouncedSetFilterBy.current} labels={labels} />
        <button onClick={onAddBug}>Add Bug ⛐</button>
        <button onClick={onCreatePdf}>Download PDF</button>
        {bugs && bugs.length ?
          <BugList bugs={bugs} onRemoveBug={onRemoveBug} onEditBug={onEditBug} />
          : <h1>No bugs today</h1>
        }

      </main>
    </main>
  )
}
