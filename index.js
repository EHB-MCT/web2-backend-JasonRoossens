const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors')
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
app.use(cors());


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

// dogs/:id - DONE
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

// save a dog - DONE
app.post('/dogs', async (req, res) => {

    if (!req.body.name || !req.body.breed || !req.body.generation) {
        res.status(400).send('Bad request: missing name, breed or generation');
        return;
    }

    try {
        //connect to the db
        await client.connect();

        //retrieve the dogs collection data
        const colli = client.db('courseProject').collection('dogs');


        // Validation for double dogs
        const bg = await colli.findOne({
            name: req.body.name,
            generation: req.body.generation,
            breed: req.body.breed

        });
        if (bg) {
            res.status(400).send(`Bad request: A dog with name ${req.body.name}, generation ${req.body.generation} and breed ${req.body.breed} already exists!`);
            return;
        }
        // Create the new Dog object
        let newDog = {
            name: req.body.name,
            generation: req.body.generation,
            breed: req.body.breed
        }

        /* // Add optional description field
        if (req.body.description) {
            newDog.description = req.body.description;
        } */

        // Insert into the database
        let insertResult = await colli.insertOne(newDog);

        //Send back successmessage
        res.status(201).json(newDog);
        return;
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

// update a dog - DONE
app.put('/dogs/:id', async (req, res) => {
    //Check for body data
    if (!req.body.name || !req.body.generation || !req.body.breed) {
        res.status(400).send({
            error: 'Bad Request',
            value: 'Missing name, generation or breed property'
        });
        return;
    }
    // Check for id in url
    if (!req.params.id) {
        res.status(400).send({
            error: 'Bad Request',
            value: 'Missing id in url'
        });
        return;
    }

    try {
        //connect to the db
        await client.connect();

        //retrieve the dogs collection data
        const colli = client.db('courseProject').collection('dogs');

        // Validation for existing dog
        const bg = await colli.findOne({
            _id: ObjectId(req.params.id)
        });
        if (!bg) {
            res.status(400).send({
                error: 'Bad Request',
                value: `Dog with id ${req.params.id}does not exist`
            });
            return;
        }
        // Create the new Dog object
        let newDog = {
            name: req.body.name,
            generation: req.body.generation,
            breed: req.body.breed,
        }

        /* // Add optional description field
        if (req.body.description) {
            newDog.description = req.body.description;
        } */

        // Insert into the database
        let updateResult = await colli.updateOne({
            _id: ObjectId(req.params.id)
        }, {
            $set: newDog
        });

        //Send back successmessage
        res.status(201).json(updateResult);
        return;
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

// delete a dog - DONE
app.delete('/dogs/:id', async (req, res) => {

    if (!req.params.id) {
        res.status(400).send({
            error: 'Bad Request',
            value: 'No id available in url'
        });
        return;
    }

    try {
        //connect to the db
        await client.connect();

        //retrieve the dogs collection data
        const colli = client.db('courseProject').collection('dogs');

        // Validation for double dogs
        let result = await colli.deleteOne({
            _id: ObjectId(req.params.id)
        });
        //Send back successmessage
        res.status(201).json(result);
        return;
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

/* app.post('/users', async (req, res) => {


    try {
        //connect to the db
        await client.connect();

        //retrieve the challenges collection data
        const colli = client.db('groupproject').collection('users');

        let salt = bcrypt.genSaltSync(10);
        var hash = bcrypt.hashSync(req.body.password, salt);

        // Create the new Challenge object
        let user = {
            username: req.body.username,
            password: hash
        }

        // Insert into the database
        let insertResult = await colli.insertOne(user);

        //Send back successmessage
        res.status(201).json(insertResult);
        return;
    } catch (error) {
        console.log(error);
        res.status(500).send({
            error: 'Something went wrong',
            value: error
        });
    } finally {
        await client.close();
    }
}); */


app.listen(port, () => {
    console.log(`API is running at http://localhost:${port}`);
})