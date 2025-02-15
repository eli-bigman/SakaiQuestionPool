import React, { useEffect, useState, useRef } from 'react';

const QuestionSelector = ({ onSelect }) => {
  const [files, setFiles] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
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

  // Filter the files in real time
  useEffect(() => {
    const filtered = files.filter(file =>
      file.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredFiles(filtered);
  }, [searchTerm, files]);

  // Close dropdown when clicking outside
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

  return (
    <div className="question-selector" ref={containerRef}>
      <input 
        type="text"
        placeholder="Search question pool..."
        value={searchTerm}
        onChange={handleSearchChange}
        onFocus={() => setDropdownOpen(true)}
        className="search-input"
      />
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
