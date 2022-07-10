const express = require('express');
const bodyParser = require('body-parser');
const {
    MongoClient,
    ObjectId
} = require('mongodb');
require('dotenv').config();

//Create the mongo client to use
const client = new MongoClient(process.env.MONGO_URL);

const app = express();
//heroku does it all
const port = process.env.PORT || 1337;

app.use(express.static('public'));
app.use(bodyParser.json());


//Root route
app.get('/', (req, res) => {
    res.status(300).redirect('/info.html');
});

// Return all dogs from the database - DONE 
app.get('/dogs', async (req, res) => {

    try {
        //connect to the db
        await client.connect();

        //retrieve the dogs collection data
        const colli = client.db('courseProject').collection('dogs');
        const dgs = await colli.find({}).toArray();

        //Send back the data with the response
        res.status(200).send(dgs);
    } catch (error) {
        console.log(error)
        res.status(500).send({
            error: 'Something went wrong',
            value: error
        });
    } finally {
        await client.close();
    }
});

// /dogs/:id
app.get('/dogs/:id', async (req, res) => {
    //id is located in the query: req.params.id
    try {
        //     //connect to the db
        await client.connect();

        //retrieve the dogs collection data
        const colli = client.db('courseProject').collection('dogs');

        //only look for a dog with this ID
        const query = {
            _id: ObjectId(req.params.id)
        };

        const dog = await colli.findOne(query);

        if (dog) {
            //Send back the file
            res.status(200).send(dog);
            return;
        } else {
            res.status(400).send('Dog could not be found with id: ' + req.params.id);
        }

    } catch (error) {
        console.log(error);
        res.status(500).send({
            error: 'Something went wrong',
            value: error
        });
    } finally {
        await client.close();
    }
});

// save a dog
app.post('/dogs', async (req, res) => {

    //  if (!req.body.bggid || !req.body.name || !req.body.genre || !req.body.mechanisms ||
    //      !req.body.description) {
    //      res.status(400).send('Bad request: missing id, name, genre, mechanisms or description');
    //      return;
    //  }

    //  try {
    //      //connect to the db
    //      await client.connect();

    //      //retrieve the boardgame collection data
    //      const colli = client.db('session5').collection('boardgames');

    //      // Validation for double boardgames
    //      const bg = await colli.findOne({
    //          bggid: req.body.bggid
    //      });
    //      if (bg) {
    //          res.status(400).send('Bad request: boardgame already exists with bggid ' + req.body.bggid);
    //          return;
    //      }
    //      // Create the new boardgame object
    //      let newBoardgame = {
    //          bggid: req.body.bggid,
    //          name: req.body.name,
    //          genre: req.body.genre,
    //          mechanisms: req.body.mechanisms,
    //          description: req.body.description
    //      }

    //      // Insert into the database
    //      let insertResult = await colli.insertOne(newBoardgame);

    //      //Send back successmessage
    res.status(201).send(`dog succesfully saved with name ${req.body.name}`);
    //      return;
    //  } catch (error) {
    //      console.log(error);
    //      res.status(500).send({
    //          error: 'Something went wrong',
    //          value: error
    //      });
    //  } finally {
    //      await client.close();
    //  }
});

// update a dog
app.put('/dogs/:id', async (req, res) => {
    res.send('UPDATE OK');
});

// delete a dog
app.delete('/dogs/:id', async (req, res) => {
    res.send('DELETE OK');
});

app.listen(port, () => {
    console.log(`API is running at http://localhost:${port}`);
})