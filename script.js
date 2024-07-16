const jsonbinMasterKey = '$2a$10$sslSXL61DXW4U0Mohwh9ouHV16e5gdsF5fVnKPMXHP4mm8anoabmC';
const jsonbinID = '667d865facd3cb34a85e2bc3';

// JSONBIN.IO RELEVANT FUNCTIONS
async function getBin() {
    try {
        const response = await fetch(`https://api.jsonbin.io/v3/b/${jsonbinID}/latest`, {
            headers: {
                'X-Master-Key': jsonbinMasterKey
            }
        });
        if (!response.ok) {
            throw new Error(`Error: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Failed to fetch bin data:', error);
        throw error;
    }
}

async function updateBin(data) {
    try {
        const response = await fetch(`https://api.jsonbin.io/v3/b/${jsonbinID}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-Master-Key': jsonbinMasterKey
            },
            body: JSON.stringify(data)
        });
        if (!response.ok) {
            throw new Error(`Error: ${response.status} ${response.statusText}`);
        }
        const updatedData = await response.json();
        return updatedData;
    } catch (error) {
        console.error('Failed to update bin data:', error);
        throw error;
    }
}

function displayData(data) {
    const resultDiv = document.getElementById('result');
    delete data.metadata;
    delete data.records;
    resultDiv.textContent = `${JSON.stringify(data, null, 2)}`;
}

// USER REGISTRATION/LOGIN FUNCTIONS
async function register() {
    const username = document.getElementById('reg-username').value;
    const password = document.getElementById('reg-password').value;

    try {
        let binData = await getBin();
        if (binData.record.users.some(user => user.username === username)) {
            console.log('User already exists');
            document.getElementById('result').textContent = 'User already exists';
            return;
        }

        const newUser = {
            username,
            password,
            booklist: [],
            groups: [],
        };
        binData.record.users.push(newUser);
        await updateBin(binData.record);
        console.log('User registered successfully');
        alert('User registered successfully');
        document.getElementById('result').textContent = 'User registered successfully';
        getBin();  // Fetch and display updated data
    } catch (error) {
        console.error('Failed to register user:', error);
        document.getElementById('result').textContent = 'Failed to register user. See console for details.';
    }
}
async function login() {
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;

    try {
        const binData = await getBin();
        const user = binData.record.users.find(user => user.username === username && user.password === password);

        if (!user) {
            alert('Invalid credentials');
            return;
        }

        // User authenticated successfully
        sessionStorage.setItem('username', username);
        alert('Successfully logged in');
        window.location.href = 'homepage.html';
    } catch (error) {
        console.error('Failed to login:', error);
        document.getElementById('result').textContent = 'Failed to login. See console for details.';
    }
}

// FETCHING BOOK FUNCTIONS
async function searchBooks() {
    const apiKey = 'AIzaSyDEEzOr0fGC0CycWr0oZ_LkzYL62ZPzu9o';
    const searchInput = document.getElementById('searchInput').value;
    const apiURL = `https://www.googleapis.com/books/v1/volumes?q=${searchInput}&key=${apiKey}`;

    if (searchInput.trim() !== '') {
        try {
            const response = await fetch(apiURL);
            const data = await response.json();
            displayBooks(data.items);
        } catch (error) {
            console.error('Failed to fetch books:', error);
        }
    } else {
        alert('Please enter a search keyword.');
    }
}

function displayBooks(books) {
    const resultDiv = document.createElement('div');
    resultDiv.setAttribute('id', 'book-results');
    const existingResultDiv = document.getElementById('book-results');
    if (existingResultDiv) {
        existingResultDiv.parentNode.replaceChild(resultDiv, existingResultDiv);
    } else {
        document.body.appendChild(resultDiv);
    }

    resultDiv.innerHTML = ''; // Clear previous results
    books.forEach(book => {
        const bookInfo = book.volumeInfo;

        const bookItem = document.createElement('div');
        bookItem.classList.add('list-group-item', 'list-group-item-action');

        // Displaying the title
        const title = document.createElement('h3');
        title.textContent = bookInfo.title || 'No Title Available';
        bookItem.appendChild(title);

        // Displaying the authors
        const authors = document.createElement('p');
        authors.textContent = `Authors: ${bookInfo.authors ? bookInfo.authors.join(', ') : 'No Authors Available'}`;
        bookItem.appendChild(authors);

        // Displaying the description
        const description = document.createElement('p');
        description.textContent = `Description: ${bookInfo.description || 'No Description Available'}`;
        bookItem.appendChild(description);

        // Displaying the published date
        const publishedDate = document.createElement('p');
        publishedDate.textContent = `Published Date: ${bookInfo.publishedDate || 'No Published Date Available'}`;
        bookItem.appendChild(publishedDate);

        // Displaying the ISBNs
        if (bookInfo.industryIdentifiers) {
            const isbnList = document.createElement('p');
            isbnList.textContent = 'ISBNs: ';
            bookInfo.industryIdentifiers.forEach(identifier => {
                isbnList.textContent += `${identifier.type}: ${identifier.identifier} `;
            });
            bookItem.appendChild(isbnList);
        }

        // Displaying the page count
        const pageCount = document.createElement('p');
        pageCount.textContent = `Page Count: ${bookInfo.pageCount || 'No Page Count Available'}`;
        bookItem.appendChild(pageCount);

        // Add to booklist button
        const addButton = document.createElement('button');
        addButton.textContent = 'Add to Booklist';
        addButton.onclick = () => addBookToBooklist(book);
        bookItem.appendChild(addButton);

        resultDiv.appendChild(bookItem);
    });
}

function searchSelect(element) {
    const searchInput = document.getElementById('searchInput');
    searchInput.placeholder = `Search by ${element.textContent}`;
}

async function addBookToBooklist(book) {
    const username = sessionStorage.getItem('username');
    if (!username) {
        alert('You need to be logged in to add books to your reading list.');
        return;
    }

    try {
        let binData = await getBin();
        const user = binData.record.users.find(user => user.username === username);

        const bookInfo = {
            title: book.volumeInfo.title || 'No Title Available',
            authors: book.volumeInfo.authors || ['No Authors Available'],
            description: book.volumeInfo.description || 'No Description Available',
            publishedDate: book.volumeInfo.publishedDate || 'No Published Date Available',
            industryIdentifiers: book.volumeInfo.industryIdentifiers || [],
            pageCount: book.volumeInfo.pageCount || 'No Page Count Available'
        };

        user.booklist.push(bookInfo);
        await updateBin(binData.record);
        console.log('Book added to reading list');
        document.getElementById('result').textContent = 'Book added to reading list';
    } catch (error) {
        console.error('Failed to add book to reading list:', error);
        document.getElementById('result').textContent = 'Failed to add book to reading list. See console for details.';
    }
}

async function viewBookshelf() {
    const username = sessionStorage.getItem('username');
    if (!username) {
        alert('You need to be logged in to view your bookshelf.');
        return;
    }

    try {
        const binData = await getBin();
        const user = binData.record.users.find(user => user.username === username);
        if (user && user.booklist.length > 0) {
            displayBookshelf(user.booklist);
        } else {
            const resultDiv = document.getElementById('result');
            if (resultDiv) {
                resultDiv.textContent = 'Your bookshelf is empty.';
            } else {
                console.error('Result element not found in the DOM.');
            }
        }
    } catch (error) {
        console.error('Failed to fetch bookshelf:', error);
        const resultDiv = document.getElementById('result');
        if (resultDiv) {
            resultDiv.textContent = 'Failed to fetch bookshelf. See console for details.';
        } else {
            console.error('Result element not found in the DOM.');
        }
    }
}

function displayBookshelf(booklist) {
    const resultDiv = document.getElementById('result');
    if (!resultDiv) {
        console.error('Result element not found in the DOM.');
        return;
    }

    resultDiv.innerHTML = '<h2>Your Bookshelf</h2>';
    booklist.forEach(book => {
        const bookItem = document.createElement('div');
        bookItem.textContent = book.title; // Assuming book has a title property
        resultDiv.appendChild(bookItem);
    });
}

function signOut() {
    sessionStorage.removeItem('username');
    window.location.href = 'index.html'; // Redirect to login page or homepage
}

function handleRegister() {
    register();
}

function handleLogin() {
    login();
}

function handleSearchBooks() {
    searchBooks();
}
