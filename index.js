const express = require('express')
const bodyParser = require('body-parser');
const cors = require('cors')
const admin = require('firebase-admin');
const MongoClient = require('mongodb').MongoClient;
require('dotenv').config()
console.log(process.env.DB_PASS)

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.f3vnz.mongodb.net/burjAlArab?retryWrites=true&w=majority`;

const port = 5000;

app.get('/', (req, res) => {
    res.send("hello from db.Its working")
})



const app = express()
app.use(cors());
app.use(bodyParser.json());
var serviceAccount = require("./configs/burj-al-arab-2ada1-firebase-adminsdk-atccl-a9f1fc78ef.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: process.env.FIRE_DB
});

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
    const bookings = client.db("burjAlArab").collection("bookings");
    app.post('/addBooking', (req, res) => {
        const newBooking = req.body;
        bookings.insertOne(newBooking)
            .then(result => {
                res.send(result.insertedCount > 0);
            })

    })

    app.get('/bookings', (req, res) => {
        const bearer = req.headers.authorization;
        if (bearer && bearer.startsWith('Bearer ')) {
            const idToken = bearer.split(' ')[1];

            admin.auth().verifyIdToken(idToken)
                .then((decodedToken) => {
                    const tokenEmail = decodedToken.email;
                    const queryEmail = req.query.email;

                    if (tokenEmail == queryEmail) {
                        bookings.find({ email: queryEmail })
                            .toArray((err, documents) => {
                                res.status(200).send(documents)
                            })
                    } else {
                        res.status(401).send('Unauthorized Access')
                    }
                })
                .catch((error) => {
                    res.status(401).send('Unauthorized Access')
                });
        } else {
            res.status(401).send('Unauthorized Access')
        }
    })
});
app.listen(process.env.PORT || port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})