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

        console.log(data);
        displayData(data);
        return data;
    } catch (error) {
        console.error('Failed to fetch bin data:', error);
        document.getElementById('result').textContent = 'Failed to fetch bin data. See console for details.';
        throw error;  // rethrow the error to handle it in calling function
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
        console.log('Bin updated successfully', updatedData);
        return updatedData;
    } catch (error) {
        console.error('Failed to update bin data:', error);
        document.getElementById('result').textContent = 'Failed to update bin data. See console for details.';
        throw error;  // rethrow the error to handle it in calling function
    }
}
function displayData(data) {
    const resultDiv = document.getElementById('result');
	delete data.metadata;
	delete data.records;
    resultDiv.textContent = `${JSON.stringify(data, null, 2)}`;
}

// USER REGISTRATION/LOGIN FUNCTIONS
async function register(username, password) {
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
        document.getElementById('result').textContent = 'User logged in successfully';
        window.location.href='homepage.html';
    } catch (error) {
        console.error('Failed to login:', error);
        document.getElementById('result').textContent = 'Failed to login. See console for details.';
    }
}

// HANDLER FUNCTIONS
function handleRegister() {
    const username = document.getElementById('reg-username').value;
    const password = document.getElementById('reg-password').value;
    register(username, password);
}
function handleLogin() {
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;
    login(username, password);
}

getBin(); // fetching bin for testing purposes

async function searchBooks() {
    const apiKey = 'AIzaSyDEEzOr0fGC0CycWr0oZ_LkzYL62ZPzu9o';
    const searchInput = document.getElementById('searchInput').value;
    var apiURL = `https://www.googleapis.com/books/v1/volumes?q=${searchInput}&key=${apiKey}`;
    
    if (searchInput.trim() !== '') {
        try {
        fetch(apiURL)
            .then((response) => response.json())
            .then((json) => console.log(json));
        // const response = await fetch()
        //const data = await response.json();
        //displayRecipes(data.results);
        } catch (error) {
        console.error(error);
        }
    } else {
    alert('Please enter a search keyword.');
    }
}

function searchSelect(item) {
    document.getElementById("search-select").innerHTML = item.innerHTML;
  }