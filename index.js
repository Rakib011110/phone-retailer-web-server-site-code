const express = require('express');
const app = express();
const cors = require('cors');
const port = process.env.PORT || 5000;
require('dotenv').config();
const jwt = require('jsonwebtoken');

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');


app.use(cors());
app.use(express.json())


app.get('/', (req, res) => {
    res.send('Running');
});





const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster1.zm1lzl1.mongodb.net/?retryWrites=true&w=majority`;
console.log(uri)
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });







function verifyJWT(req, res, next) {

    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).send('unauthorized access');
    }

    const token = authHeader.split(' ')[1];

    jwt.verify(token, process.env.ACCESS_TOKEN, function (err, decoded) {
        if (err) {
            return res.status(403).send({ message: 'forbidden access' })
        }
        req.decoded = decoded;
        next();
    })

}





async function run() {
    try {

        const phoneOptionCollection = client.db('creativeProducts').collection('phoneOption')
        const phoneOptionCollectionCategory = client.db('creativeProducts').collection('categoryId')
        const bookingCollection = client.db('creativeProducts').collection('booking')
        const usersCollection = client.db('creativeProducts').collection('users')



        app.get("/phone", async (req, res) => {
            const query = {}
            const options = await phoneOptionCollection.find(query).toArray()
            res.send(options)

        })

        app.get('/phone/:id', async (req, res) => {
            const id = req.params.id
            const query = { category_id: id }
            const result = await phoneOptionCollection.find(query).toArray()
            res.send(result)
        })


        app.get("/phone-category", async (req, res) => {
            const query = {}
            const options = await phoneOptionCollectionCategory.find(query).toArray()
            res.send(options)

        }),

            app.get('/phone-category/:id', async (req, res) => {
                const id = req.params.id;
                const query = { _id: ObjectId(id) };
                const select = await phoneOptionCollectionCategory.findOne(query);
                res.send(select);
            })


        // * -------------BookingCollection-------------

        app.get('/bookings', verifyJWT, async (req, res) => {

            const email = req.query.email;
            const decodedEmail = req.decoded.email;
            if (email !== decodedEmail) {

                return res.status(403).send(({ message: 'forbidden' }))
            }
            const query = { email: email }
            const booking = await bookingCollection.find(query).toArray()
            res.send(booking)

        })


        app.post('/bookings', async (req, res) => {
            const booking = req.body
            console.log(booking);
            const result = await bookingCollection.insertOne(booking)
            res.send(result)
        })
        app.get



        // *------------------ user jWT Token----------------
        app.get('/jwt', async (req, res) => {
            const email = req.query.email;
            const query = { email: email };
            const user = await usersCollection.findOne(query);
            console.log(user)

            if (user) {
                const token = jwt.sign({ email }, process.env.ACCESS_TOKEN, { expiresIn: '72h' })
                return res.send({ accessToken: token });
            }
            res.status(403).send({ accessToken: 'invalid Token' })
        });




        //*---------------usersCollection----------------------------

        app.get("/users", async (req, res) => {
            const query = req.body
            const user = await usersCollection.find(query).toArray()
            res.send(user)
        })


        app.post("/users", async (req, res) => {
            const user = req.body
            const result = await usersCollection.insertOne(user)
            res.send(result)

        })


        // *------------- Adadmin--------------




        //*  -------------get admin------------

        app.get('/users/admin/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email }
            console.log(email);
            const user = await usersCollection.findOne(query);
            res.send({ isAdmin: user?.role === 'admin' });
        })

        //*   ---PUT Admin ---

        app.put('/users/admin/:id', verifyJWT, async (req, res) => {

            const decodedEmail = req.decoded.email;
            const query = { email: decodedEmail }
            const user = await usersCollection.findOne(query)
            if (user?.role !== 'admin') {
                return res.status(403).send({ message: 'forbidden' })
            }

            const id = req.params.id;
            const filter = { _id: ObjectId(id) }
            const options = { upsert: true };
            const updatedDoc = {
                $set: {
                    role: 'admin',

                }
            }
            const result = await usersCollection.updateOne(filter, updatedDoc, options);
            res.send(result);
        });


        // *-------------------------------------


    }



    finally {

    }

}
run().catch(console.log)



















// const categories = require('./fakeData/phone.json');
// const phone = require('./fakeData/category.json');



// app.get('/phone-categories', (req, res) => {
//     res.send(categories)
// });

// app.get('/category/:id', (req, res) => {
//     const id = req.params.id;
//     if (id === '04') {
//         res.send(phone);
//     }
//     else {
//         const category_news = phone.filter(n => n.category_id === id);
//         res.send(category_news);
//     }
// })

// app.get('/phone', (req, res) => {
//     res.send(phone);
// });

// app.get('/phone/:id', (req, res) => {
//     const id = req.params.id;
//     const selectphone = phone.find(n => n._id === id);
//     res.send(selectphone);
// });




app.listen(port, () => {
    console.log('Server running on port', port);
})