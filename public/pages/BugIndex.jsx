import { bugService } from '../services/bug.service.js'
import { showSuccessMsg, showErrorMsg } from '../services/event-bus.service.js'
import { BugList } from '../cmps/BugList.jsx'
import { BugFilter } from '../cmps/BugFilter.jsx'
import { pdfService } from '../services/pdf.service.js'

const { useState, useEffect } = React

export function BugIndex() {
  const [bugs, setBugs] = useState([])
  const [filterBy, setFilterBy] = useState(bugService.createDefaultFilter())

  useEffect(() => {
    console.log('filterBy:', filterBy)
    loadBugs()
  }, [filterBy])

  function loadBugs() {
    bugService.query(filterBy).then(setBugs)
  }

  function onRemoveBug(bugId) {
    bugService
      .remove(bugId)
      .then(() => {
        console.log('Deleted Succesfully!')
        setBugs(prevBugs => prevBugs.filter((bug) => bug._id !== bugId))
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

  if (!bugs || !bugs.length) return <h1>No bugs today</h1>

  return (

    <main>
      <h3>Bugs App</h3>
      <main>
        <BugFilter filterBy={filterBy} onFilter={setFilterBy} />
        <button onClick={onAddBug}>Add Bug ⛐</button>
        <button onClick={onCreatePdf}>Download PDF</button>
        <BugList bugs={bugs} onRemoveBug={onRemoveBug} onEditBug={onEditBug} />
      </main>
    </main>
  )
}
