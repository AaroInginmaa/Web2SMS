const express = require('express');
const fs = require('fs');
const bodyParser = require('body-parser');

const app = express();
const config = JSON.parse(fs.readFileSync(__dirname + '/config.json', 'utf8'));

const host = config.server.host;
const port = config.server.port;


app.use(bodyParser.json());
app.use(express.static('public'));

app.get('/', (req, res) => {
	// Handle the root path (send your HTML file or whatever is appropriate)
	res.sendFile(__dirname + '/public/index.html');
});

app.post('/', (req, res) => {
	const receivedData = req.body;
	console.log(receivedData);
	const { phone, msg } = req.body;

	sendsms(phone, msg)
		.then(result => {
            res.json({result});
            console.log(result);
        })
		.catch((error) => {
			res.status(500).json({ error: `Error sending message` });
			console.error('Error sending message:', error);
		});
});

app.listen(port, () => {
		console.log(`Server listening at http://${host}:${port}`);
});

// Generate a random string with custom length
function makeid(length) {
	let result = '';
	const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	const charactersLength = characters.length;
	let counter = 0;
	while (counter < length) {
		result += characters.charAt(Math.floor(Math.random() * charactersLength));
		counter += 1;
	}
	return result;
}

function sendsms(phone, msg) {
    return new Promise((resolve, reject) => {
        const outdir = config.message.out;
        const sentdir = config.message.sent;
        const filename = makeid(config.message.nameLength);
        const filepath = outdir + filename;
        const filecontents = `To: ${phone}\nAlphabet: ${config.message.alphabet}\n\n ${msg}`;
        
        console.log(`File directory: ${outdir}`);
        console.log(`File name: ${filename}`);
        console.log(`Path: ${filepath}`);
        
        if (!fs.existsSync(outdir)) {
            reject(`Directory ${outdir} does not exist`);
            return;
        }

        if (phone == '' || msg == '') { reject("Empty phone number or message"); return; }

        try {
            fs.writeFileSync(filepath, filecontents);
            console.log('File written successfully.');

            // Watch the checked directory for changes
	    	const watcher = fs.watch(sentdir, (event, watchedFilename) => {
                console.log(`Watching for changes in ${sentdir}`);
                if (event === 'rename' && watchedFilename === filename) {
                    console.log(`File: ${filename}\nEvent: ${event}\nPath: ${sentdir}`);	
                    resolve(`Message ${filename} sent`);
                    watcher.close(); // Close the watcher
	    		}
	    	})
        }
        catch {
            reject("Error sending message");
            return;
        }
    });
}