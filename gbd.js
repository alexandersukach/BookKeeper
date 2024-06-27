




/**
 * 
 * document.getElementById('bookForm').addEventListener('submit', async function(event) {
    event.preventDefault();
    const title = document.getElementById('title').value;
    const author = document.getElementById('author').value;
    const publisher = document.getElementById('publisher').value;
    const subject = document.getElementById('subject').value;
    
    await fetchBookData({ title, author, publisher, subject });
});

async function fetchBookData(params) {
    let query = '';
    if (params.title) query += `intitle:${encodeURIComponent(params.title)} `;
    if (params.author) query += `inauthor:${encodeURIComponent(params.author)} `;
    if (params.publisher) query += `inpublisher:${encodeURIComponent(params.publisher)} `;
    if (params.subject) query += `subject:${encodeURIComponent(params.subject)} `;

    const url = `https://www.googleapis.com/books/v1/volumes?q=${query.trim()}`;

    const headers = {
        'X-Master-Key': 'YOUR_API_KEY', // Replace with your actual API key if needed
        'Content-Type': 'application/json'
    };

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: headers
        });
        const data = await response.json();
        
        const booksContainer = document.getElementById('books');
        booksContainer.innerHTML = ''; // Clear previous results

        if (data.items) {
            data.items.forEach(book => {
                const bookDiv = document.createElement('div');
                bookDiv.classList.add('book');
                
                const title = book.volumeInfo.title || 'No title available';
                const genre = book.volumeInfo.categories ? book.volumeInfo.categories.join(', ') : 'No genre available';
                const authors = book.volumeInfo.authors ? book.volumeInfo.authors.join(', ') : 'No authors available';
                const thumbnail = book.volumeInfo.imageLinks ? book.volumeInfo.imageLinks.thumbnail : '';

                bookDiv.innerHTML = `
                    <h2>${title}</h2>
                    <p><strong>Genre:</strong> ${genre}</p>
                    <p><strong>Authors:</strong> ${authors}</p>
                    ${thumbnail ? `<img src="${thumbnail}" alt="${title} cover">` : ''}
                `;

                booksContainer.appendChild(bookDiv);
            });
        } else {
            booksContainer.innerHTML = '<p>No results found</p>';
        }
    } catch (error) {
        console.error('Error fetching book data:', error);
    }
}

 */