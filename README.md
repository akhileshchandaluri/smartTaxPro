To start go to startpage/taxlogin/public/index.html

Purpose:
To help users calculate and file taxes intelligently by comparing old vs new tax regimes, guiding them on the best options, and assisting with tax-related queries via a chatbot interface.

Frontend:

HTML/CSS pages for login, navigation, tax input, and results.

Login redirects to the main navigation page.

Tax input forms allow users to enter income, deductions, etc.

Output shows tax calculated for old and new regimes and recommends the better option.

Backend:

Node.js/Express (or Flask if using Python) handles requests.

API endpoints for tax calculations and chatbot queries.

Chatbot integrated using OpenRouter API or similar for tax guidance.

Features:

User login/authentication.

Tax regime comparison: calculates tax under both old and new regimes.

Chatbot assistant for answering tax-related questions.

Navigation system: easy movement between sections (Know Your Regime → Tax Calculator → Suggestions).

Optional: Session management to save user data temporarily.

Tech Stack:

Frontend: HTML, CSS, JS

Backend: Node.js + Express / Flask (Python)

Database: Optional (SQLite, JSON, or file-based storage for user sessions)

APIs: OpenRouter for chatbot

User Flow:

Login → Navigation Page

Enter tax details → Calculate tax under both regimes

Get suggestion → Optionally ask the chatbot for guidance
