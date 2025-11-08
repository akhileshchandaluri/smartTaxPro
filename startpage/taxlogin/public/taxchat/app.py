from flask import Flask, request, jsonify
import requests
from flask_cors import CORS
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)

OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions"  # Endpoint may vary

@app.route("/chatbot", methods=["POST"])
def chatbot():
    user_input = request.json.get("message")

    headers = {
        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
        "Content-Type": "application/json"
    }

    payload = {
        "model": "gpt-4o-mini",  # Change if you want another model
        "messages": [{"role": "user", "content": user_input}],
    }

    response = requests.post(OPENROUTER_URL, headers=headers, json=payload)
    data = response.json()
    
    # OpenRouter returns the AI's response under choices[0].message.content
    ai_response = data["choices"][0]["message"]["content"]
    return jsonify({"response": ai_response})

if __name__ == "__main__":
    app.run(port=5000, debug=True)
