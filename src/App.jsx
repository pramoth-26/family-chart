import './App.css'
import Flow from './components/Flow'

function App() {
  return (
    <div className="app-container" style={{ padding: 0, justifyContent: 'flex-start' }}>
      <div className="header-overlay">
        {/* <h1>Family Tree Generator</h1> */}
      </div>
      <Flow />
    </div>
  )
}

export default App
