// generate-manifest.cjs
const fs = require('fs')
const path = require('path')

// Define the directory that holds your XML files
const xmlDir = path.join(__dirname, 'public', 'xml_files')

// Read the directory
fs.readdir(xmlDir, (err, files) => {
  if (err) {
    console.error('Error reading xml_files directory:', err)
    process.exit(1)
  }

  // Filter for only .xml files (adjust filter if needed)
  const xmlFiles = files.filter((file) => path.extname(file).toLowerCase() === '.xml')

  // Define the path for the manifest file
  const manifestPath = path.join(xmlDir, 'manifest.json')

  // Write the manifest file with pretty formatting
  fs.writeFile(manifestPath, JSON.stringify(xmlFiles, null, 2), (err) => {
    if (err) {
      console.error('Error writing manifest file:', err)
      process.exit(1)
    }
    console.log('Manifest generated successfully at', manifestPath)
  })
})
