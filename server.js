// environment variables
import dotenv from 'dotenv';
dotenv.config();

// server
import express from 'express';
import axios from 'axios';
import bodyParser from 'body-parser';

//save to file
import multer from 'multer';
import ffmpeg from 'fluent-ffmpeg';
import fs from 'fs';

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

//upload path
const upload = multer({ dest: 'uploads/' });

// open ai
import { Configuration, OpenAIApi } from "openai";

// set up keys for openai
const configuration = new Configuration({
    // eslint-disable-next-line no-undef
    organization: process.env.OPENAI_ORGANIZATION_ID,
    // eslint-disable-next-line no-undef
    apiKey: process.env.OPENAI_API_KEY,
});

// eslint-disable-next-line no-undef, no-unused-vars
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
            // eslint-disable-next-line no-undef
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

app.post('/upload', upload.single('audio'), (req, res) => {
    console.log('uploading file');
    console.log(req.file);

    // get uploaded file path
    const filePath = req.file.path;

    // create write stream for output file
    const outputPath = 'uploads/output.mp3';
    const output = fs.createWriteStream(outputPath);

    // convert wav to mp3
    ffmpeg(filePath)
    .toFormat('mp3')
    .output(output)
    .on('end', () => {

        // Delete the original file
        fs.unlink(filePath, (err) => {
            if (err) {
                console.error('Error while deleting the original file', err);
                res.status(500).json({ message: 'File conversion successful, but failed to delete original file', error: err });
            } else {
                res.json({ message: 'File uploaded, converted and original file deleted successfully' });
            }
        });

    })
    .on('error', (error) => {
        console.error(error);
        res.status(500).json({ message: 'Error during conversion', error });
    })
    .run();
});


app.listen(3000, () => console.log('Chatbot server running on port 3000'));