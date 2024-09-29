from flask import Flask, render_template, request, jsonify
from kmeans import KMeans  # Import your KMeans implementation

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/kmeans', methods=['POST'])
def kmeans():
    # Handle KMeans clustering request
    return jsonify({})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=3000, debug=True)