// src/utils/ITExamsParser.js

export function parseITExamHTML(html) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    // Use the provided XPath to locate the container of questions:
    const xpath = '/html/body/div[1]/div/article/div/div[1]/div';
    const result = doc.evaluate(xpath, doc, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
    const container = result.singleNodeValue;
    if (!container) {
      throw new Error("Could not locate the questions container.");
    }
    return extractQuestions(container);
  }
  
  function extractQuestions(container) {
    const extracted = [];
    // Example: assume each question is contained within a <div class="single_post"> block
    // (Adjust the query selectors as needed to match the actual HTML structure)
    const questionNodes = container.querySelectorAll('.single_post p');
    questionNodes.forEach((p) => {
      const strong = p.querySelector('strong');
      if (strong) {
        const questionText = strong.innerText.trim();
        // Extract any images within the question element
        const imgs = p.querySelectorAll('img');
        const images = Array.from(imgs).map(img => img.src);
        
        // Extract answer options if a <ul> follows
        let answerOptions = [];
        let correctAnswers = [];
        const nextEl = p.nextElementSibling;
        if (nextEl && nextEl.tagName.toLowerCase() === 'ul') {
          const lis = nextEl.querySelectorAll('li');
          lis.forEach(li => {
            const optionText = li.innerText.trim();
            answerOptions.push(optionText);
            // Here we assume red-colored text indicates the correct answer
            const span = li.querySelector('span');
            if (span && span.style.color === 'rgb(255, 0, 0)') {
              correctAnswers.push(optionText);
            }
          });
        }
        
        // Optionally, extract an explanation from a sibling element with a success class
        let explanation = "";
        const explanationEl = p.parentElement.querySelector('div.message_box.success');
        if (explanationEl) {
          explanation = explanationEl.innerText.trim();
        }
        
        extracted.push({
          questionText,
          answerOptions,
          correctAnswers,
          explanation,
          images
        });
      }
    });
    return extracted;
  }
  