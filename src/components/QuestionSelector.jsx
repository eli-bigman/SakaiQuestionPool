import React, { useEffect, useState, useRef } from 'react';

const QuestionSelector = ({ onSelect }) => {
  const [files, setFiles] = useState([]);
  const [searchTerm, setSearchTerm] = useState(localStorage.getItem('selectedFile') || '');
  const [filteredFiles, setFilteredFiles] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const containerRef = useRef(null);

  // Fetch the manifest from the xml_files folder
  useEffect(() => {
    const fetchManifest = async () => {
      try {
        const response = await fetch('/xml_files/manifest.json');
        const fileList = await response.json();
        setFiles(fileList);
      } catch (error) {
        console.error('Error fetching manifest:', error);
      }
    };
    fetchManifest();
  }, []);

  // Filter the files in real time based on the search term
  useEffect(() => {
    const filtered = files.filter(file =>
      file.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredFiles(filtered);
  }, [searchTerm, files]);

  // Close dropdown when clicking outside the container
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setDropdownOpen(true);
  };

  const handleOptionClick = (file) => {
    setSearchTerm(file);
    onSelect(file);
    setDropdownOpen(false);
  };

  // Clear the search term and reset selection
  const clearSearch = () => {
    setSearchTerm("");
    onSelect(""); // Notify parent that the selection is cleared, if needed
    setDropdownOpen(false);
  };

  return (
    <div className="question-selector" ref={containerRef}>
      <div style={{ position: "relative" }}>
        <input 
          type="text"
          placeholder="Search question pool..."
          value={searchTerm}
          onChange={handleSearchChange}
          onFocus={() => setDropdownOpen(true)}
          className="search-input"
        />
        {searchTerm && (
          <span 
            onClick={clearSearch}
            style={{
              position: "absolute",
              right: "10px",
              top: "50%",
              transform: "translateY(-50%)",
              cursor: "pointer",
              fontSize: "1rem",
              color: "#999"
            }}
            title="Clear search"
          >
            ×
          </span>
        )}
      </div>
      {dropdownOpen && filteredFiles.length > 0 && (
        <ul className="dropdown-menu">
          {filteredFiles.map((file) => (
            <li 
              key={file} 
              onClick={() => handleOptionClick(file)} 
              className="dropdown-item"
            >
              {file}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default QuestionSelector;
