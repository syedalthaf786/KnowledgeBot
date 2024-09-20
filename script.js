if (window.innerWidth < 768) {
            document.body.innerHTML = '<h2 class="alert">This feature is only available on desktop screens.</h2>';
}
else{
const chatBox = document.getElementById('chat-box');
const chatForm = document.getElementById('chat-form');
const userInput = document.getElementById('user-input');
const chatHistory = document.getElementById('chat-history');
const newChatBtn = document.getElementById('new-chat-btn');
const chatBoxContainer = document.getElementById('chat-box-container');

let conversations = [];
let currentConversation = [];
let conversationId = 0;

// Function to add message to chat box
function addMessage(content, isBot = false) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message');

    const icon = document.createElement('i');
    const robot = ['fa-solid', 'fa-robot'];
    const user = ['fa-solid', 'fa-user'];

    // Add different classes based on whether it's a bot or user message
    if (isBot) {
        icon.classList.add(...robot);
    } else {
        icon.classList.add(...user);
    }

    const messageText = document.createElement('div');
    messageText.classList.add(isBot ? 'bot-message' : 'user-message');
    messageText.innerText = content;

    messageDiv.appendChild(icon);
    messageDiv.appendChild(messageText);
    chatBox.appendChild(messageDiv);
    chatBoxContainer.scrollTop = chatBoxContainer.scrollHeight; // Auto-scroll to the bottom
}

// Typing effect for bot's message
async function typeMessage(content, isBot) {
return new Promise((resolve) => {
const messageDiv = document.createElement('div');
messageDiv.classList.add('message');

const icon = document.createElement('i');
const robot = ['fa-solid', 'fa-robot'];
const user = ['fa-solid', 'fa-user'];

if (isBot) {
    icon.classList.add(...robot);
} else {
    icon.classList.add(...user);
}

const messageText = document.createElement('div');
messageText.classList.add(isBot ? 'bot-message' : 'user-message');

messageDiv.appendChild(icon);
messageDiv.appendChild(messageText);
chatBox.appendChild(messageDiv);

const words = content.split(' ');
let index = 0;

const typingInterval = setInterval(() => {
    if (index < words.length) {
        messageText.innerText += (index === 0 ? '' : ' ') + words[index++];
    } else {
        clearInterval(typingInterval);
        resolve(); // Resolve the promise when typing is done
    }
}, 300); // Adjust typing speed (in milliseconds)

chatBoxContainer.scrollTop = chatBoxContainer.scrollHeight; // Auto-scroll to the bottom
});
}

// Function to get bot response from API
async function getBotResponse(message) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=AIzaSyBzilC4AgqHE57D8SklxayhrDH5lQQtOOc`;

    const requestBody = {
        "contents": [{
            "parts": [{
                "text": message
            }]
        }]
    };

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('Error Details:', errorData);
            return `Error: ${errorData.error.message || 'Something went wrong.'}`;
        }

        const data = await response.json();
        console.log('API Response:', data);
           
        // Extract text from the API response
        if (data.candidates && data.candidates.length > 0 && data.candidates[0].content && data.candidates[0].content.parts && data.candidates[0].content.parts.length > 0) {
            return data.candidates[0].content.parts[0].text || "Sorry, I couldn't understand that.";
        } else {
            return "Sorry, I couldn't understand that.";
        }
    } catch (error) {
        console.error('Fetch Error:', error);
        return 'Oops! Something went wrong. Please try again.';
    }
}

// Handle form submission
chatForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const userMessage = userInput.value.trim();
    if (userMessage !== '') {
        // Add user message to chat
        addMessage(userMessage, false);
        currentConversation.push({ text: userMessage, isBot: false });

        // Get bot response with typing effect
        const botResponse = await getBotResponse(userMessage);
        await typeMessage(botResponse, true);

        // Save bot message in the current conversation
        currentConversation.push({ text: botResponse, isBot: true });

        // Clear input
        userInput.value = '';
    }
});

// Handle new chat
newChatBtn.addEventListener('click', () => {
    if (currentConversation.length > 0) {
        saveConversation();
    }
    currentConversation = [];
    chatBox.innerHTML = ''; // Clear the current chat box
});


// Save conversation to history
function saveConversation() {
    const conversationCopy = [...currentConversation];
    conversations.push({ id: conversationId++, messages: conversationCopy });

    // Update chat history sidebar
    const historyItem = document.createElement('div');
    historyItem.classList.add('chat-history-item');
    historyItem.innerText = `Conversation ${conversationId}`;
    historyItem.addEventListener('click', () => loadConversation(conversationId - 1));
    chatHistory.appendChild(historyItem);
}

// Load conversation from history
function loadConversation(index) {
    chatBox.innerHTML = ''; // Clear the current chat box
    currentConversation = conversations[index].messages;

    currentConversation.forEach(({ text, isBot }) => {
        addMessage(text, isBot);
    });
}
}
