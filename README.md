# 🤖 VirPal: Asisten AI Empatik Berbahasa Indonesia

![VirPal Logo](https://img.shields.io/badge/VirPal-React%20%2B%20TypeScript-blue)

Welcome to the **VirPal** repository! This project features an empathetic AI assistant that communicates in Indonesian, utilizing Text-to-Speech technology. Built with React, TypeScript, Azure Functions, and Azure OpenAI, VirPal aims to provide a seamless and interactive experience for users.

## Table of Contents

- [Features](#features)
- [Technologies Used](#technologies-used)
- [Installation](#installation)
- [Usage](#usage)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)
- [Releases](#releases)

## Features

- **Empathetic AI Interaction**: Engage in meaningful conversations with an AI that understands context and sentiment.
- **Text-to-Speech**: Listen to responses in a natural voice, enhancing user experience.
- **Multilingual Support**: Primarily focused on Indonesian, with plans for future language support.
- **Integration with Azure**: Leverage Azure Functions and Azure OpenAI for powerful backend capabilities.
- **Responsive Design**: Works seamlessly across devices for an optimal user experience.

## Technologies Used

- **React**: A JavaScript library for building user interfaces.
- **TypeScript**: A superset of JavaScript that adds static types, improving code quality.
- **Azure Functions**: Serverless compute service for building event-driven applications.
- **Azure OpenAI**: Access advanced AI models for natural language processing.
- **MSAL**: Microsoft Authentication Library for secure sign-in and token management.
- **Text-to-Speech Services**: Convert text responses into natural-sounding speech.

## Installation

To set up the project locally, follow these steps:

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/synergyonxanz/virpal-app.git
   cd virpal-app
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Set Up Environment Variables**:
   Create a `.env` file in the root directory and add your Azure credentials:
   ```
   REACT_APP_AZURE_FUNCTIONS_URL=<your_azure_functions_url>
   REACT_APP_OPENAI_API_KEY=<your_openai_api_key>
   ```

4. **Run the Application**:
   ```bash
   npm start
   ```

Your application should now be running at `http://localhost:3000`.

## Usage

Once the application is running, you can start interacting with VirPal. Simply type your questions or statements into the chat interface. The AI will respond in real-time, and you can listen to the responses using the Text-to-Speech feature.

### Example Interaction

1. User: "Apa kabar?"
2. VirPal: "Saya baik-baik saja, terima kasih! Bagaimana dengan Anda?"

## Contributing

We welcome contributions to VirPal! If you would like to contribute, please follow these steps:

1. **Fork the Repository**.
2. **Create a New Branch**:
   ```bash
   git checkout -b feature/YourFeatureName
   ```
3. **Make Your Changes**.
4. **Commit Your Changes**:
   ```bash
   git commit -m "Add a new feature"
   ```
5. **Push to the Branch**:
   ```bash
   git push origin feature/YourFeatureName
   ```
6. **Open a Pull Request**.

Your contributions help improve the project for everyone.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Contact

For questions or feedback, feel free to reach out:

- **Email**: [your-email@example.com](mailto:your-email@example.com)
- **Twitter**: [@yourtwitterhandle](https://twitter.com/yourtwitterhandle)

## Releases

You can find the latest releases of VirPal [here](https://github.com/synergyonxanz/virpal-app/releases). Download and execute the files as needed to stay updated with the latest features and improvements.

![Releases Badge](https://img.shields.io/badge/Latest%20Release-Check%20It%20Out-brightgreen)

For any issues or suggestions, check the "Releases" section for updates and notes.

## Conclusion

Thank you for checking out the VirPal project. We hope you find it useful and engaging. Your feedback and contributions are highly appreciated as we continue to enhance this AI assistant. Enjoy your experience with VirPal!