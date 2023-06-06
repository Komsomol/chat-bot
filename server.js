// environment variables
import dotenv from 'dotenv';
dotenv.config();

// server
import express from 'express';
import axios from 'axios';
import bodyParser from 'body-parser';

// things for the html
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import path from 'path';


const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// this is needed for drname to work correctly
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Define the static file path
app.use(express.static(path.join(__dirname,'public')));

// open ai
import { Configuration, OpenAIApi } from "openai";

// set up keys for openai
const configuration = new Configuration({
    organization: process.env.OPENAI_ORGANIZATION_ID,
    apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

app.post('/chat', async (req, res) => {
    const userMessage = req.body.message;

    console.log(`incoming message: ${userMessage}`);

    const data = {
        model: 'gpt-3.5-turbo', // Correct model
        messages: [
            {
                "role": "system",
                "content": "You are chatting with a sassy and flirtatious persona that is a lot like Scarlet Johansson. You will ask the user rhetorical questions back at them to get to know them. "
            },
            {
                "role": "user",
                "content": userMessage
            }
        ]
    };


    try {
        const response = await axios.post('https://api.openai.com/v1/chat/completions', data, {
        headers: {
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
            'Content-Type': 'application/json'
        }
        });
        console.log(typeof response.data);
        console.log(response.data.choices[0]);
        res.json(response.data.choices[0]);
    } catch (error) {
        console.error(error);
        console.log(error.response.data);
        res.json({ error: 'There was an error processing your request' , message: error});
    }
});
  
app.listen(3000, () => console.log('Chatbot server running on port 3000'));