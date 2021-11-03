const express = require('express')
const serverless = require('serverless-http')
const app = express()
const multer = require('multer')
const fs = require('fs');
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
const port = 4000
var cors = require("cors");
var admin = require("firebase-admin");


app.use(cors());

admin.initializeApp({
  credential: admin.credential.cert({
    "project_id": process.env.PROJECT_ID,
    "type": process.env.type,
    "private_key_id": process.env.private_key_id,
    "private_key": process.env.private_key?.replace(/\\n/g, '\n'),
    "client_email": process.env.client_email,
    "client_id": process.env.client_id,
    "auth_uri": process.env.auth_uri,
    "token_uri": process.env.token_uri,
    "auth_provider_x509_cert_url": process.env.auth_provider_x509_cert_url,
    "client_x509_cert_url": process.env.client_x509_cert_url
  }),
  databaseURL: "https://cassphotography-a0c85-default-rtdb.firebaseio.com/"
});

var firebase = admin.database();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public')
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname)
  }
})

const upload = multer({ storage: storage }).single('file')

app.get('/', (req, res) => {
  const userId = 'jC2nvVk5ndWd8Y8MJHJIQcpdrzS2';
  const additionalClaims = {
    admin: true,
  };

  admin
    .auth()
    .setCustomUserClaims(userId, { admin: true })
    .then(() => {
      // The new custom claims will propagate to the user's ID token the
      // next time a new one is issued.
      res.send('did it')
    });
})
  .get('/test', (req, res) => {
    let files = []
    fs.readdirSync('./public').forEach(file => {
      files.push({ src: `http://localhost:4000/${file}`, width: 3, height: 4 })
    });

    if (files.length > 0) {
      console.log(files)
      res.send(files)
    }

  })
  .get('/heroTest', (req, res) => {
    res.json({"wow": "WWWOOWW"})
  })


app
  .post("/createAdmin", (req, res) => {
    //console.log(req.body.userUID);
    firebase
      .ref(`/users/${req.body.userUID}`)
      .child("/admin")
      .set(true);
    res.send({ sucess: "sucess" });
  })
  .post("/checkAdmin", function (req, res) {
    //console.log(req.body.uid)
    firebase.ref(`users/${req.body.uid}`).on("value", snapshot => {
      // console.log(snapshot.val());
      if (snapshot.exists() && snapshot.val().admin == true) {
        res.send({ admin: true });
      }
      res.send({admin: false})
    });
  })
  .post('/upload', (req, res) => {
    upload(req, res, (err) => {
      if (err) {
        res.sendStatus(500);
        console.log(err)
      }
      res.send(req.file);
    });
  });

app.use(express.static('public'));

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})

app.use('/.netlify/functions',app)
module.exports.handler = serverless(app)