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
let searchParameter = 'intitle';

function searchSelect(element, parameter) {
    searchParameter = parameter;
    const searchInput = document.getElementById('searchInput');
    searchInput.placeholder = `Search by ${element.textContent}`;
}

async function searchBooks() {
    const apiKey = 'AIzaSyDEEzOr0fGC0CycWr0oZ_LkzYL62ZPzu9o';
    const searchInput = document.getElementById('searchInput').value;

    if (searchInput.trim() !== '') {
        const query = `${searchParameter}:${searchInput.trim()}`;
        const apiURL = `https://www.googleapis.com/books/v1/volumes?q=${query}&key=${apiKey}`;
        
        try {
            const response = await fetch(apiURL);
            const data = await response.json();
            const filteredBooks = data.items.filter(book => {
                if (searchParameter === 'inauthor') {
                    return book.volumeInfo.authors && book.volumeInfo.authors.some(author => author.toLowerCase().includes(searchInput.toLowerCase()));
                }
                return true;
            });
            displayBooks(filteredBooks);
        } catch (error) {
            console.error('Failed to fetch books:', error);
        }
    } else {
        alert('Please enter a search keyword.');
    }
}

function displayBooks(books) {
    const resultDiv = document.getElementById('search-results');
    resultDiv.innerHTML = ''; // Clear previous results
    resultDiv.style.overflowY = "auto";
    resultDiv.style.overflowX = "hidden";
    resultDiv.style.position = "fixed";
    resultDiv.style.top = "22.5vh";
    resultDiv.style.left = "20vw";
    resultDiv.style.width = "65vw";
    resultDiv.style.height = "70vh";

    if (!books || books.length === 0) {
        resultDiv.textContent = 'No books found.';
        return;
    }

    const bookGrid = document.createElement('div');
    bookGrid.classList.add('row', 'row-cols-1', 'row-cols-md-3', 'g-4');
    bookGrid.style.position = "relative";
    bookGrid.style.zIndex = "0";

    books.forEach(book => {
        const bookCard = document.createElement('div');
        bookCard.classList.add('col');
        bookCard.style.position = "relative";
        bookCard.style.zIndex = "0";

        const card = document.createElement('div');
        card.style.backdropFilter = "blur(5px)";
        card.style.backgroundColor = "rgba(46, 37, 83, 0.267)";
        card.classList.add('card', 'h-100');

        const coverImage = book.volumeInfo.imageLinks ? book.volumeInfo.imageLinks.thumbnail : 'placeholder.jpg';
        const img = document.createElement('img');
        img.src = coverImage;
        img.style.height = "594.75px";
        img.classList.add('card-img-top');
        img.alt = book.volumeInfo.title;
        img.onclick = () => showBookDetails(book);

        const cardBody = document.createElement('div');
        cardBody.classList.add('card-body');
        cardBody.style.textAlign = "center";

        const cardTitle = document.createElement('h5');
        cardTitle.classList.add('card-title');
        cardTitle.textContent = book.volumeInfo.title;

        cardBody.appendChild(cardTitle);
        card.appendChild(img);
        card.appendChild(cardBody);
        bookCard.appendChild(card);
        bookGrid.appendChild(bookCard);
    });

    resultDiv.appendChild(bookGrid);
}

function showBookDetails(book) {
    const bookDetailsBody = document.getElementById('bookDetailsBody');
    bookDetailsBody.innerHTML = ''; // Clear previous details

    const bookInfo = book.volumeInfo;

    const title = document.createElement('h3');
    title.textContent = bookInfo.title || 'No Title Available';
    bookDetailsBody.appendChild(title);

    const authors = document.createElement('p');
    authors.textContent = `Authors: ${bookInfo.authors ? bookInfo.authors.join(', ') : 'No Authors Available'}`;
    bookDetailsBody.appendChild(authors);

    const description = document.createElement('p');
    description.textContent = `Description: ${bookInfo.description || 'No Description Available'}`;
    bookDetailsBody.appendChild(description);

    const publishedDate = document.createElement('p');
    publishedDate.textContent = `Published Date: ${bookInfo.publishedDate || 'No Published Date Available'}`;
    bookDetailsBody.appendChild(publishedDate);

    if (bookInfo.industryIdentifiers) {
        const isbnList = document.createElement('p');
        isbnList.textContent = 'ISBNs: ';
        bookInfo.industryIdentifiers.forEach(identifier => {
            isbnList.textContent += `${identifier.type}: ${identifier.identifier} `;
        });
        bookDetailsBody.appendChild(isbnList);
    }

    const pageCount = document.createElement('p');
    pageCount.textContent = `Page Count: ${bookInfo.pageCount || 'No Page Count Available'}`;
    bookDetailsBody.appendChild(pageCount);

    const addToList = document.createElement('button');
    addToList.textContent = 'Add to your reading list';
    addToList.className = 'btn btn-primary'; 
    addToList.onclick = () => addBookToBooklist(book);
    bookDetailsBody.appendChild(addToList);

    const modal = new bootstrap.Modal(document.getElementById('bookDetailsModal'));
    modal.show();
}

function signOut() {
    sessionStorage.removeItem('username');
    window.location.href = 'index.html'; // Redirect to login page or homepage
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

// Search activation

// Get the input field
var input = document.getElementById("searchInput");

// Execute a function when the user releases a key on the keyboard
input.addEventListener("keyup", function(event) {
  // Number 13 is the "Enter" key on the keyboard
  if (event.keyCode === 13) {
    // Cancel the default action, if needed
    event.preventDefault();
    // Trigger the button element with a click
    document.getElementById("searchButton").click();
  }
});

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
