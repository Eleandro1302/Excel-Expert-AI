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

This project is configured to run directly in the browser without a build step, thanks to `importmap`. However, to handle the API key securely, a local development server with environment variable support is required.

### Prerequisites

-   A modern web browser (Chrome, Firefox, Safari, Edge).
-   A Google Gemini API Key. You can get one from [Google AI Studio](https://aistudio.google.com/app/apikey).

### Local Development Setup

The Gemini API calls will fail without an API key. Follow these steps for a proper local setup:

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/excel-expert-ai.git
    cd excel-expert-ai
    ```

2.  **Create an environment file:**
    This project expects the API key to be available as a global environment variable. For local development with a tool like [Vite](https://vitejs.dev/), you can create a file named `.env.local` in the root of the project:
    ```
    VITE_API_KEY=YOUR_GEMINI_API_KEY_HERE
    ```
    *Note: You will need to adjust `services/geminiService.ts` to read the key from `import.meta.env.VITE_API_KEY` instead of `process.env.API_KEY` for this setup to work with Vite.*

3.  **Install a development server (e.g., Vite):**
    ```bash
    npm install -g vite
    ```

4.  **Run the development server:**
    ```bash
    vite
    ```
    Vite will start a local server and inject the environment variables, allowing the application to access your API key. Open the URL provided in your terminal.

## ⚙️ How It Works

-   **Frontend**: The user interface is a single-page application built with React components, managing state for conversations, loading status, and user input.
-   **Gemini Service (`services/geminiService.ts`)**: This is the core of the AI interaction.
    -   It initializes the Google Gemini AI client.
    -   It includes a detailed **system instruction** that primes the model to act as an experienced Excel expert in Portuguese, ensuring consistent and high-quality responses.
    -   It handles streaming chat responses for a real-time feel.
-   **File Handling**: When a user uploads a spreadsheet, the `xlsx` library parses it on the client-side. The content is converted to CSV format and prepended to the user's prompt, giving the AI context for the query.
-   **State & History**: The `App.tsx` component manages the application's state. All conversations are stored in the browser's `localStorage`, allowing sessions to be persisted.

## 📄 License

This project is licensed under the MIT License.

---
Made by **Eleandro**
