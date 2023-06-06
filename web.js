import express from 'express'
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import path from 'path';

const app = express();

// this is needed for drname to work correctly
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Define the static file path
app.use(express.static(path.join(__dirname,'public')));

const port = 3500;


app.listen(port, function () {
    console.log(`Web Server running on port ${port}`);
});