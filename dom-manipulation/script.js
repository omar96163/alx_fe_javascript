let quotes = [];
function showRandomQuote() {
    const localQuotes = JSON.parse(localStorage.getItem('quot')) || [];
    const quoteDisplay = document.getElementById('quoteDisplay');
    if (localQuotes.length > 0) {
        const randomIndex = Math.floor(Math.random() * localQuotes.length);
        const randomQuote = localQuotes[randomIndex];
        quoteDisplay.innerHTML = `<p>${randomQuote.text}</p><p>${randomQuote.category}</p>`;
    } else {
        quoteDisplay.innerHTML = "<p>No quotes available</p>";
    }
}
function createAddQuoteForm() {
    const newQuoteText = document.getElementById('newQuoteText').value;
    const newQuoteCategory = document.getElementById('newQuoteCategory').value;
    if (newQuoteText && newQuoteCategory) {
        quotes.push({ text: newQuoteText, category: newQuoteCategory });
        saveQuotes();
        const quoteDisplay = document.getElementById('quoteDisplay');
        quoteDisplay.innerHTML = `<p>${newQuoteText}</p><p>${newQuoteCategory}</p>`;
        document.getElementById('newQuoteText').value = '';
        document.getElementById('newQuoteCategory').value = '';
        alert('New quote added successfully!');
    } else {
        alert('Please enter both the quote and category.');
    }
}
function saveQuotes() {
    localStorage.setItem('quot', JSON.stringify(quotes));
}
function exportToJsonFile() {
    const dataStr = JSON.stringify(quotes, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'quotes.json';
    a.click();
    URL.revokeObjectURL(url);
}
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
document.getElementById('newQuote').addEventListener('click', showRandomQuote);
document.getElementById('exportQuotes').addEventListener('click', exportToJsonFile);
