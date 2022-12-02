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

        // -----------------------------------------------------
        // const addProductCollection = client.db('creativeProducts').collection('addProduct');
        const paymentCollection = client.db('creativeProducts').collection('payments');
        const ourCollection = client.db('creativeProducts').collection('collections');
        //-------------------------------------------------------------



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

            // ----------------------------------//

            app.post('/phone', async (req, res) => {
                const product = req.body
                console.log(product)
                const query = {
                    productsName: product.name,
                    price: product.price,
                    condition: product.condition,
                    phone: product.phone,
                    location: product.location,
                    image_url: product.image,
                    email: product.email,
                    category_id: product.category_id,
                    role: product.role,
                    use: product.use,
                    details: product.details,
                }
                const result = await phoneOptionCollection.insertOne(query)
                res.send(result)


            })

        app.get('/add-products/:email', async (req, res) => {
            const email = req.params.email
            const query = { email: email }
            console.log(query);
            const result = await phoneOptionCollection.findOne(query)
            res.send(result)
        })


        //--------------------------------------------
        // app.get('/addproduct', async (req, res) => {
        //     const query = {}
        //     const products = await addProductCollection.find(query).toArray();
        //     res.send(products);
        // })

        // app.post('/addproduct', verifyJWT, async (req, res) => {
        //     const product = req.body;
        //     const result = await addProductCollection.insertOne(product);
        //     res.send(result);
        // });
        // app.delete('/addproduct/:id', verifyJWT, async (req, res) => {
        //     const id = req.params.id;
        //     const filter = { _id: ObjectId(id) };
        //     const result = await addProductCollection.deleteOne(filter);
        //     res.send(result);
        // });

        //-----------------------------------------------------



        app.get('/bookings/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const booking = await bookingsCollection.findOne(query);
            res.send(booking);
        });

        app.get('/ourcollections', async (req, res) => {
            const query = {}
            const ourCollectionss = await ourCollection.find(query).toArray()
            res.send(ourCollectionss)
        });


        //-------------------------------------------------------------








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





        //  * ----------addProducts-------------- 
        app.get('/AddProducts', async (req, res) => {
            const query = {}
            const result = await appointmentOptionCollection.find(query).project({ name: 1 }).toArray();
            res.send(result);
        })


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


        app.get('/users/buyer/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email };
            const user = await usersCollection.findOne(query);
            res.send({ isBuyer: user?.role === 'Buyer' });
        });
        app.get('/users/seller/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email };
            const user = await usersCollection.findOne(query);
            res.send({ isSeller: user?.role === 'Seller' });
        });






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






        //--------------------------------


        app.post('/create-payment-intent', async (req, res) => {
            const booking = req.body;
            const price = booking.price;
            const amount = price;

            const paymentIntent = await stripe.paymentIntents.create({
                currency: 'usd',
                amount: amount,
                "payment_method_types": ["card"]

            });
            res.send({
                clientSecret: paymentIntent.client_secret,
            });
        });

        app.post('/payments', async (req, res) => {
            const payment = req.body;
            const result = await paymentCollection.insertOne(payment);
            const id = payment.bookingId;
            const filter = { _id: ObjectId(id) };
            const updatedDoc = {
                $set: {
                    paid: true,
                    transactionId: payment.transactionId
                }
            }
            const updatedResult = await bookingsCollection.updateOne(filter, updatedDoc)
            res.send(result);
        })
        //-----------------------------------------------

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