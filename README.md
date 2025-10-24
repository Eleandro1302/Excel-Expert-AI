[Leia em Português (pt-BR)](./README.pt-BR.md)

# Excel Expert AI

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

An AI-powered assistant that provides expert answers to your Excel questions. Get clear, practical, and complete solutions, from simple formulas to advanced VBA macros, powered by the Google Gemini API.

<!-- Add a screenshot or GIF of the application here -->


## ✨ Key Features

-   **Intelligent Excel Help**: Ask any question about Excel and receive expert-level answers.
-   **VBA & Formula Generation**: Get custom VBA macros and complex formulas tailored to your needs.
-   **Spreadsheet Analysis**: Upload your `.xlsx`, `.xls`, or `.csv` files for the AI to analyze and provide insights.
-   **Voice-to-Text**: Use your microphone to ask questions directly (available in Brazilian Portuguese).
-   **Syntax Highlighting**: Code blocks for both Excel formulas and VBA are beautifully highlighted for readability.
-   **CSV Data Export**: Generate data based on your prompts and download it as a `.csv` file.
-   **Persistent Chat History**: Your conversations are automatically saved in your browser and can be revisited or deleted.
-   **Responsive Design**: A clean, modern, and fully responsive interface that works on any device.

## 🛠️ Technology Stack

-   **Frontend**: [React](https://reactjs.org/) & [TypeScript](https://www.typescriptlang.org/)
-   **Styling**: [Tailwind CSS](https://tailwindcss.com/)
-   **AI Model**: [Google Gemini API](https://ai.google.dev/) (`gemini-flash-lite-latest`)
-   **Spreadsheet Parsing**: [SheetJS (xlsx)](https://sheetjs.com/)
-   **Dependencies**: Served via CDN with `importmap` for a build-less setup.

## 🚀 Getting Started

This project is designed to run directly in any modern web browser without any installation or build steps.

### Prerequisites

-   A modern web browser (Chrome, Firefox, Safari, Edge).
-   A Google Gemini API Key. You can get one for free from [Google AI Studio](https://aistudio.google.com/app/apikey).

### How to Use

1.  Open the `index.html` file in your browser, or visit the deployed application link.
2.  When you first launch the app, a pop-up will ask you to enter your Gemini API key.
3.  Paste your key into the input field and click "Save and Continue".
4.  That's it! You can now start asking questions. Your key is saved in your browser's local storage for future visits. You can change it at any time using the "Manage API Key" button in the sidebar.

## ⚙️ How It Works

-   **Frontend**: The user interface is a single-page application built with React components, managing state for conversations, loading status, and user input.
-   **API Key Management**: The app prompts the user for a Gemini API key on first use and stores it securely in the browser's `localStorage`. This allows the app to be fully client-side and hosted on any static platform.
-   **Gemini Service (`services/geminiService.ts`)**: This is the core of the AI interaction.
    -   It initializes the Google Gemini AI client using the stored API key.
    -   It includes a detailed **system instruction** that primes the model to act as an experienced Excel expert in Portuguese, ensuring consistent and high-quality responses.
    -   It handles streaming chat responses for a real-time feel.
-   **File Handling**: When a user uploads a spreadsheet, the `xlsx` library parses it on the client-side. The content is converted to CSV format and prepended to the user's prompt, giving the AI context for the query.
-   **State & History**: The `App.tsx` component manages the application's state. All conversations are also stored in the browser's `localStorage`, allowing sessions to be persisted.

## 📄 License

This project is licensed under the MIT License.

---
Made by **Eleandro**
