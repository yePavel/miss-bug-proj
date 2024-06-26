import { bugService } from '../services/bug.service.js'
import { showSuccessMsg, showErrorMsg } from '../services/event-bus.service.js'
import { BugList } from '../cmps/BugList.jsx'
import { BugFilter } from '../cmps/BugFilter.jsx'
import { utilService } from '../services/util.service.js'
import { LoginSignup } from '../cmps/LoginSignup.jsx'
import { userService } from '../services/user.service.js'

const { useState, useEffect, useRef } = React

export function BugIndex() {
  const [bugs, setBugs] = useState([])
  const [labels, setLabels] = useState([])
  const [pageCount, setPageCount] = useState(0)
  const [filterBy, setFilterBy] = useState(bugService.createDefaultFilter())
  const debouncedSetFilterBy = useRef(utilService.debounce(onSetFilterBy, 500))
  const user = userService.getLoggedInUser()

  useEffect(() => {
    loadLabels()
    loadPageCount()
  }, [])

  useEffect(() => {
    loadBugs()
  }, [filterBy])


  function loadBugs() {
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

  function loadPageCount() {
    bugService.getPageCount()
      .then(pageCount =>
        setPageCount(pageCount)
      )
      .catch(err => {
        showErrorMsg(`Cannot get page count`)
        console.log('err:', err)
      })
  }

  function onRemoveBug(bugId) {
    bugService
      .remove(bugId)
      .then(() => {
        setBugs(prevBugs => prevBugs.filter((bug) => bug._id !== bugId))
        loadPageCount()
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
    bugService.save(bug)
      .then((savedBug) => {
        console.log('Added Bug', savedBug)
        setBugs(prevBugs => [...prevBugs, savedBug])
        loadPageCount()
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
    bugService.downloadPdf()
      .then(() => showSuccessMsg('PDF downloaded!'))
      .catch(error => showErrorMsg('PDF downloaded!', error))
  }

  function onSetFilterBy(filterBy) {
    setFilterBy(prevFilter => ({ ...prevFilter, ...filterBy }))
  }

  return (

    <main>
      <h3>Bugs App</h3>
      <main>
        <BugFilter pageCount={pageCount} filterBy={filterBy} onSetFilterBy={debouncedSetFilterBy.current} labels={labels} />
        {user && <button onClick={onAddBug}>Add Bug ⛐</button>}
        <button onClick={onCreatePdf}>Download PDF</button>
        {bugs && bugs.length ?
          <BugList bugs={bugs} onRemoveBug={onRemoveBug} onEditBug={onEditBug} />
          : <h1>No bugs today</h1>
        }

      </main>
    </main>
  )
}
