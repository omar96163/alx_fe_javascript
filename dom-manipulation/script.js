let quotes = [];
function showRandomQuote() {
    const localQuat = JSON.parse(localStorage.getItem('quot'))
    const quoteDisplay = document.getElementById('quoteDisplay');
    const randomIndex = Math.floor(Math.random() * localQuat.length);
    const randomQuote = localQuat[randomIndex];
    quoteDisplay.innerHTML = `
        <p>${randomQuote.text}</p>
        <p>${randomQuote.category}</p>
    `
}
function createAddQuoteForm() {
    const newQuoteText = document.getElementById('newQuoteText').value;
    const newQuoteCategory = document.getElementById('newQuoteCategory').value;
    if (newQuoteText && newQuoteCategory) {
        quotes.push({ text: newQuoteText, category: newQuoteCategory });
        localStorage.setItem('quot',JSON.stringify(quotes))
        const quoteDisplay = document.getElementById('quoteDisplay');
        quoteDisplay.innerHTML = '';
        const quoteTextElement = document.createElement('p');
        quoteTextElement.textContent = newQuoteText;
        const quoteCategoryElement = document.createElement('p');
        quoteCategoryElement.textContent = newQuoteCategory;
        quoteDisplay.appendChild(quoteTextElement);
        quoteDisplay.appendChild(quoteCategoryElement);
        document.getElementById('newQuoteText').value = '';
        document.getElementById('newQuoteCategory').value = '';
        alert('New quote added successfully!');
    } 
    else {
        alert('Please enter both the quote and category.');
    }
}
document.getElementById('newQuote').addEventListener('click', showRandomQuote);
function importFromJsonFile(event) {
    const fileReader = new FileReader();
    fileReader.onload = function(event) {
      const importedQuotes = JSON.parse(event.target.result);
      quotes.push(...importedQuotes);
      saveQuotes();
      alert('Quotes imported successfully!');
    };
    fileReader.readAsText(event.target.files[0]);
  }