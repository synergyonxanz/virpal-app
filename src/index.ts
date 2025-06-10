import pkg from '@azure/functions';
const { app } = pkg;

// Import functions to register them
import './functions/chat-completion.js';
import './functions/get-secret.js';

app.setup({
    enableHttpStream: true,
});
