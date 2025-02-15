// QuestionSelector.jsx
import React, { useEffect, useState } from 'react'

const QuestionSelector = ({ onSelect }) => {
  const [files, setFiles] = useState([])

  useEffect(() => {
    const fetchManifest = async () => {
      try {
        const response = await fetch('/xml_files/manifest.json')
        const fileList = await response.json()
        setFiles(fileList)
      } catch (error) {
        console.error('Error fetching manifest:', error)
      }
    }
    fetchManifest()
  }, [])

  const handleChange = (e) => {
    const file = e.target.value
    if (file !== "") {
      onSelect(file)
    }
  }

  return (
    <div>
      <select defaultValue="" onChange={handleChange}>
        <option value="" disabled>Select Question Pool</option>
        {files.map((file) => (
          <option key={file} value={file}>{file}</option>
        ))}
      </select>
    </div>
  )
}

export default QuestionSelector
