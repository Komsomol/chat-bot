import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import axios from 'axios';
import bodyParser from 'body-parser';

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


console.log(process.env.OPENAI_API_KEY, process.env.OPENAI_ORGANIZATION_ID);

import { Configuration, OpenAIApi } from "openai";

const configuration = new Configuration({
    organization: "org-GnDuM0r65kWLEh71D0RNntcx",
    apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);
// const response = await openai.listEngines();
// console.log(response.data)

app.post('/chat', async (req, res) => {
    const userMessage = req.body.message;

    console.log(`incoming message: ${userMessage}`);

    const data = {
        model: 'gpt-3.5-turbo', // Correct model
        messages: [
            {
                "role": "system",
                "content": "You are chatting with an AI assistant."
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
        console.log(response.data);
        console.log(response.data.choices[0]);
        // res.json(response.data.choices[0].text);
    } catch (error) {
        console.error(error);
        console.log(error.response.data);
        // res.json({ error: 'There was an error processing your request' , message: error});
    }
});
  
app.listen(3000, () => console.log('Chatbot server running on port 3000'));