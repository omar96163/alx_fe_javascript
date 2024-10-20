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
        populateCategories();
        updateQuoteDisplay();
        alert('New quote added successfully!');
    } else {
        alert('Please enter both the quote and category.');
    }
}
function saveQuotes() {
    localStorage.setItem('quot', JSON.stringify(quotes));
}
function updateQuoteDisplay() {
    const quoteDisplay = document.getElementById('quoteDisplay');
    quoteDisplay.innerHTML = '';
    quotes.forEach(quote => {
        const quoteTextElement = document.createElement('p');
        quoteTextElement.textContent = quote.text;
        const quoteCategoryElement = document.createElement('p');
        quoteCategoryElement.textContent = quote.category;
        quoteDisplay.appendChild(quoteTextElement);
        quoteDisplay.appendChild(quoteCategoryElement);
    });
}
function populateCategories() {
    const categoryFilter = document.getElementById('categoryFilter');
    const uniqueCategories = [...new Set(quotes.map(quote => quote.category))];
    categoryFilter.innerHTML = '<option value="all">All Categories</option>';
    uniqueCategories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        categoryFilter.appendChild(option);
    });
}
function filterQuotes() {
    const selectedCategory = document.getElementById('categoryFilter').value;
    const filteredQuotes = selectedCategory === 'all' ? quotes : quotes.filter(quote => quote.category === selectedCategory);
    const quoteDisplay = document.getElementById('quoteDisplay');
    quoteDisplay.innerHTML = '';

    filteredQuotes.forEach(quote => {
        const quoteTextElement = document.createElement('p');
        quoteTextElement.textContent = quote.text;

        const quoteCategoryElement = document.createElement('p');
        quoteCategoryElement.textContent = quote.category;

        quoteDisplay.appendChild(quoteTextElement);
        quoteDisplay.appendChild(quoteCategoryElement);
    });
    localStorage.setItem('lastSelectedCategory', selectedCategory);
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
        populateCategories();
        alert('Quotes imported successfully!');
        filterQuotes();
    };
    fileReader.readAsText(event.target.files[0]);
}
document.getElementById('newQuote').addEventListener('click', showRandomQuote);
document.getElementById('exportQuotes').addEventListener('click', exportToJsonFile);
window.onload = function() {
    const localQuotes = JSON.parse(localStorage.getItem('quot')) || [];
    quotes = localQuotes;
    populateCategories();
    const lastSelectedCategory = localStorage.getItem('lastSelectedCategory') || 'all';
    document.getElementById('categoryFilter').value = lastSelectedCategory;
    filterQuotes();
};
