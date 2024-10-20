const API_URL = 'https://jsonplaceholder.typicode.com/posts'; // محاكاة API وهمية
let quotes = [];

// دالة لعرض الاقتباس العشوائي
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

// دالة لإضافة اقتباس جديد
async function createAddQuoteForm() {
    const newQuoteText = document.getElementById('newQuoteText').value;
    const newQuoteCategory = document.getElementById('newQuoteCategory').value;

    if (newQuoteText && newQuoteCategory) {
        const newQuote = { text: newQuoteText, category: newQuoteCategory }; // إنشاء كائن الاقتباس
        quotes.push(newQuote);
        saveQuotes(); // تخزين الاقتباسات في localStorage
        populateCategories(); // تحديث قائمة الفئات

        // نشر الاقتباس إلى الخادم
        await postQuoteToServer(newQuote);

        // تحديث الـ DOM باستخدام appendChild
        updateQuoteDisplay();
        alert('New quote added successfully!');
    } else {
        alert('Please enter both the quote and category.');
    }
}

// دالة لتخزين الاقتباسات في localStorage
function saveQuotes() {
    localStorage.setItem('quot', JSON.stringify(quotes));
}

// دالة لتحديث واجهة المستخدم
function updateQuoteDisplay() {
    const quoteDisplay = document.getElementById('quoteDisplay');
    quoteDisplay.innerHTML = ''; // مسح المحتوى السابق

    quotes.forEach(quote => {
        const quoteTextElement = document.createElement('p');
        quoteTextElement.textContent = quote.text;
        
        const quoteCategoryElement = document.createElement('p');
        quoteCategoryElement.textContent = quote.category;

        quoteDisplay.appendChild(quoteTextElement);
        quoteDisplay.appendChild(quoteCategoryElement);
    });
}

// دالة لتعبئة الفئات ديناميكيًا
function populateCategories() {
    const categoryFilter = document.getElementById('categoryFilter');
    const uniqueCategories = [...new Set(quotes.map(quote => quote.category))];

    // مسح الخيارات السابقة
    categoryFilter.innerHTML = '<option value="all">All Categories</option>';

    uniqueCategories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        categoryFilter.appendChild(option);
    });
}

// دالة لتصفية الاقتباسات حسب الفئة المحددة
function filterQuotes() {
    const selectedCategory = document.getElementById('categoryFilter').value;
    const filteredQuotes = selectedCategory === 'all' ? quotes : quotes.filter(quote => quote.category === selectedCategory);

    const quoteDisplay = document.getElementById('quoteDisplay');
    quoteDisplay.innerHTML = ''; // مسح المحتوى السابق

    filteredQuotes.forEach(quote => {
        const quoteTextElement = document.createElement('p');
        quoteTextElement.textContent = quote.text;

        const quoteCategoryElement = document.createElement('p');
        quoteCategoryElement.textContent = quote.category;

        quoteDisplay.appendChild(quoteTextElement);
        quoteDisplay.appendChild(quoteCategoryElement);
    });

    // حفظ الفئة المحددة في localStorage
    localStorage.setItem('lastSelectedCategory', selectedCategory);
}

// دالة لتصدير الاقتباسات كملف JSON
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

// دالة لاستيراد الاقتباسات من ملف JSON
function importFromJsonFile(event) {
    const fileReader = new FileReader();
    fileReader.onload = function(event) {
        const importedQuotes = JSON.parse(event.target.result);
        quotes.push(...importedQuotes);
        saveQuotes();
        populateCategories(); // تحديث قائمة الفئات
        alert('Quotes imported successfully!');
        filterQuotes(); // تحديث العرض بعد الاستيراد
    };
    fileReader.readAsText(event.target.files[0]);
}

// دالة لنشر اقتباس إلى الخادم
async function postQuoteToServer(quote) {
    try {
        const response = await fetch(API_URL, {
            method: 'POST', // استخدام POST لإرسال البيانات
            headers: {
                'Content-Type': 'application/json' // تعيين نوع المحتوى إلى JSON
            },
            body: JSON.stringify(quote) // تحويل الاقتباس إلى JSON
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

// دالة لجلب الاقتباسات من الخادم
async function fetchQuotesFromServer() {
    try {
        const response = await fetch(API_URL);
        const data = await response.json();
        // استخدم البيانات التي تم استرجاعها من الخادم
        // هنا نقوم بتحويل البيانات لتناسب هيكل الاقتباس
        const quotesFromServer = data.map(post => ({
            text: post.title,
            category: 'general' // تعيين فئة افتراضية
        }));
        // مزامنة الاقتباسات
        syncQuotes(quotesFromServer);
    } catch (error) {
        console.error('Error fetching quotes from server:', error);
    }
}

// دالة لمزامنة الاقتباسات
function syncQuotes(quotesFromServer) {
    const localQuotes = JSON.parse(localStorage.getItem('quot')) || [];

    // دمج الاقتباسات مع بيانات الخادم
    const mergedQuotes = [...new Set([...localQuotes, ...quotesFromServer])];

    // التحقق من التعارضات
    let hasConflict = false;
    const updatedQuotes = mergedQuotes.map((quote, index, self) => {
        const found = self.find(q => q.text === quote.text);
        if (found && found.category !== quote.category) {
            hasConflict = true; // تعيين وجود تعارض
            return quote; // يتم استخدام اقتباس الخادم
        }
        return quote; // استخدام الاقتباس المحلي
    });

    localStorage.setItem('quot', JSON.stringify(updatedQuotes));
    quotes = updatedQuotes; // تحديث المصفوفة المحلية
    updateQuoteDisplay(); // تحديث العرض

    // إعلام المستخدم بالتحديث
    notifyUser(hasConflict ? 'Quotes have been updated from the server with conflicts!' : 'Quotes synced with server!');
}

// دالة لإعلام المستخدم بالتحديثات
function notifyUser(message) {
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.position = 'fixed';
    notification.style.top = '10px';
    notification.style.right = '10px';
    notification.style.backgroundColor = '#ffcc00';
    notification.style.padding = '10px';
    notification.style.borderRadius = '5px';
    notification.style.zIndex = '1000'; // تأكد من أن الرسالة تكون فوق العناصر الأخرى
    document.body.appendChild(notification);

    setTimeout(() => {
        document.body.removeChild(notification);
    }, 3000);
}

// إضافة حدث لزر عرض اقتباس جديد
document.getElementById('newQuote').addEventListener('click', showRandomQuote);

// إضافة حدث لزر تصدير الاقتباسات
document.getElementById('exportQuotes').addEventListener('click', exportToJsonFile);

// تحميل الاقتباسات من localStorage عند تحميل الصفحة
window.onload = function() {
    const localQuotes = JSON.parse(localStorage.getItem('quot')) || [];
    quotes = localQuotes; // تعيين الاقتباسات من localStorage
    populateCategories(); // ملء الفئات
    const lastSelectedCategory = localStorage.getItem('lastSelectedCategory') || 'all';
    document.getElementById('categoryFilter').value = lastSelectedCategory; // استعادة الفئة المحددة الأخيرة
    filterQuotes(); // تحديث العرض بناءً على الفئة المحددة
    setInterval(fetchQuotesFromServer, 60000); // تحديث كل دقيقة
};
