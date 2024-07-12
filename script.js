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
    var resultsList = document.getElementById("results-list");
    var bookResult = document.createElement("li");
    //resultDiv.innerHTML = ''; // Clear previous results
    books.forEach(book => {
        var title = book.volumeInfo.title;
        var desc = book.volumeInfo.description;
        var img = book.volumeInfo.imageLinks.smallThumbnail;
        resultsList.innerHTML += `<li class="list-group-item">${title}</li>`;
        //bookItem.onclick = () => addBookTobooklist(book);
        //resultDiv.appendChild(bookItem);
    });
}

async function addBookTobooklist(book) {
    const username = sessionStorage.getItem('username');
    if (!username) {
        alert('You need to be logged in to add books to your reading list.');
        return;
    }

    try {
        let binData = await getBin();
        const user = binData.record.users.find(user => user.username === username);
        user.booklist.push(book);
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
            document.getElementById('result').textContent = 'Your bookshelf is empty.';
        }
    } catch (error) {
        console.error('Failed to fetch bookshelf:', error);
        document.getElementById('result').textContent = 'Failed to fetch bookshelf. See console for details.';
    }
}

function displayBookshelf(booklist) {
    const resultDiv = document.getElementById('result');
    resultDiv.innerHTML = '<h2>Your Bookshelf</h2>';
    booklist.forEach(book => {
        const bookItem = document.createElement('div');
        bookItem.textContent = book.volumeInfo.title;
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
