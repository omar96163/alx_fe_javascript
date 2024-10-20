const API_URL = 'https://jsonplaceholder.typicode.com/posts';
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
async function createAddQuoteForm() {
    const newQuoteText = document.getElementById('newQuoteText').value;
    const newQuoteCategory = document.getElementById('newQuoteCategory').value;
    if (newQuoteText && newQuoteCategory) {
        const newQuote = { text: newQuoteText, category: newQuoteCategory };
        quotes.push(newQuote);
        saveQuotes();
        populateCategories(); 
        await postQuoteToServer(newQuote);
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
async function postQuoteToServer(quote) {
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(quote)
        });
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        console.log('Quote posted to server:', data);
    } catch (error) {
        console.error('Error posting quote to server:', error);
    }
}
async function fetchQuotesFromServer() {
    try {
        const response = await fetch(API_URL);
        const data = await response.json();
        const quotesFromServer = data.map(post => ({
            text: post.title,
            category: 'general'
        }));
        syncQuotes(quotesFromServer);
    } catch (error) {
        console.error('Error fetching quotes from server:', error);
    }
}
function syncQuotes(quotesFromServer) {
    const localQuotes = JSON.parse(localStorage.getItem('quot')) || [];
    const mergedQuotes = [...new Set([...localQuotes, ...quotesFromServer])];
    let hasConflict = false;
    const updatedQuotes = mergedQuotes.map((quote, index, self) => {
        const found = self.find(q => q.text === quote.text);
        if (found && found.category !== quote.category) {
            hasConflict = true;
            return quote;
        }
        return quote; 
    });
    localStorage.setItem('quot', JSON.stringify(updatedQuotes));
    quotes = updatedQuotes;
    updateQuoteDisplay();
    notifyUser(hasConflict ? 'Quotes have been updated from the server with conflicts!' : 'Quotes synced with server!');
}
function notifyUser(message) {
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.position = 'fixed';
    notification.style.top = '10px';
    notification.style.right = '10px';
    notification.style.backgroundColor = '#ffcc00';
    notification.style.padding = '10px';
    notification.style.borderRadius = '5px';
    notification.style.zIndex = '1000';
    document.body.appendChild(notification);
    setTimeout(() => {
        document.body.removeChild(notification);
    }, 3000);
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
    setInterval(fetchQuotesFromServer, 60000);
};
