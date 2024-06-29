import os
import requests
from flask import Flask, request, jsonify, session, render_template
from werkzeug.security import generate_password_hash, check_password_hash

app = Flask(__name__)
app.secret_key = os.urandom(24)

jsonbin_master_key = 'sslSXL61DXW4U0Mohwh9ouHV16e5gdsF5fVnKPMXHP4mm8anoabmC'
bin_id = '667d865facd3cb34a85e2bc3'
gbooks_api_key = 'AIzaSyDhWoiBUGvd-bYEZ6RnZKmb9a6G6dxw5ZA'

def get_bin():
    url = f"https://api.jsonbin.io/v3/b/{bin_id}/latest"
    headers = {
        'X-Master-Key': jsonbin_master_key
    }
    response = requests.get(url, headers=headers)
    
    if response.status_code == 200:
        return response.json()
    else:
        return {"error": f"Failed to fetch bin data. Status code: {response.status_code}, Response: {response.text}"}

def update_bin(data):
    url = f"https://api.jsonbin.io/v3/b/{bin_id}"
    headers = {
        'Content-Type': 'application/json',
        'X-Master-Key': jsonbin_master_key
    }
    response = requests.put(url, json=data, headers=headers)
    return response.json()

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/search_books', methods=['GET'])
def search_books_route():
    query = request.args.get('query')
    if not query:
        return jsonify({"message": "Query parameter is required"}), 400

    try:
        search_results = search_books(query, gbooks_api_key)
        if search_results:
            return jsonify(search_results)
        else:
            return jsonify({"message": "Error searching books"}), 500
    except Exception as e:
        return jsonify({"error": str(e)}), 500

def search_books(query, api_key, max_results=10):
    url = "https://www.googleapis.com/books/v1/volumes"
    params = {
        'q': query,
        'maxResults': max_results,
        'key': api_key
    }
    response = requests.get(url, params=params)
    if response.status_code == 200:
        return response.json()
    else:
        raise Exception(f"Failed to fetch data from Google Books API. Status code: {response.status_code}, Response: {response.text}")

if __name__ == '__main__':
    app.run(debug=True)
