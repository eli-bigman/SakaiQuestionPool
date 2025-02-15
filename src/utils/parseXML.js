const parseXML = (xmlString) => {
    const parser = new DOMParser()
    const xmlDoc = parser.parseFromString(xmlString, "application/xml")
    const items = xmlDoc.getElementsByTagName("item")
    const questions = []
  
    for (let i = 0; i < items.length; i++) {
      const item = items[i]
      const ident = item.getAttribute("ident")
      const title = item.getAttribute("title")
  
      // Determine question type based on the cc_profile field
      let type = ""
      const metadataFields = item.getElementsByTagName("qtimetadatafield")
      for (let j = 0; j < metadataFields.length; j++) {
        const field = metadataFields[j]
        const label = field.getElementsByTagName("fieldlabel")[0]?.textContent
        if (label === "cc_profile") {
          const entry = field.getElementsByTagName("fieldentry")[0]?.textContent
          if (entry.includes("essay")) {
            type = "essay"
          } else if (entry.includes("multiple_choice")) {
            type = "multiple_choice"
          } else if (entry.includes("fib")) {
            type = "fill_in"
          } else if (entry.includes("true_false")) {
            type = "true_false"
          }
        }
      }
  
      // Get the prompt from the <presentation> element
      let prompt = ""
      const presentation = item.getElementsByTagName("presentation")[0]
      if (presentation) {
        const material = presentation.getElementsByTagName("material")[0]
        if (material) {
          const mattext = material.getElementsByTagName("mattext")[0]
          if (mattext) {
            prompt = mattext.textContent
          }
        }
      }
  
      // Initialize options and correctAnswer
      let options = []
      let correctAnswer = ""
  
      // For multiple_choice and true_false questions, extract the options
      if (type === "multiple_choice" || type === "true_false") {
        const responseLid = item.getElementsByTagName("response_lid")[0]
        if (responseLid) {
          const renderChoice = responseLid.getElementsByTagName("render_choice")[0]
          if (renderChoice) {
            const responseLabels = renderChoice.getElementsByTagName("response_label")
            for (let k = 0; k < responseLabels.length; k++) {
              const label = responseLabels[k]
              const optionIdent = label.getAttribute("ident")
              const optionText = label.getElementsByTagName("mattext")[0]?.textContent
              options.push({ ident: optionIdent, text: optionText })
            }
          }
        }
      }
  
      // For non-essay questions, try to determine the correct answer
      const respconditions = item.getElementsByTagName("respcondition")
      for (let j = 0; j < respconditions.length; j++) {
        const condition = respconditions[j]
        // A common pattern: use the respcondition with continue="No"
        if (condition.getAttribute("continue") === "No") {
          const varequal = condition.getElementsByTagName("varequal")[0]
          if (varequal) {
            correctAnswer = varequal.textContent.trim()
            break
          }
        }
      }
  
      questions.push({
        id: ident,
        title,
        type,
        prompt,
        options,
        correctAnswer,
      })
    }
  
    return questions
  }
  
  export default parseXML
  