const express = require('express')
const app = express();
const cors = require('cors');
// jwt -------------
const jwt = require('jsonwebtoken')

require('dotenv').config()
const port = process.env.PORT || 5000;

// middleware 
app.use(cors());
app.use(express.json())

const verifyJWT = (req,res,next)=>{
  const authorization = req.headers.authorization;
  if(!authorization){
    return res.status(401).send({error : true, message: 'unauthorized access'});
  }
// bearer token
  const token = authorization.splite(' ')[1];
  
  jwt.verify(token,process.env.ACCESS_TOKEN_SECRET,(err,decoded)=>{
    if(err){
    return res.status(401).send({error : true, message: 'unauthorized access'});
  
    }
    req.decoded = decoded;
    next();
  })
}


const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.24od2ec.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    // users ar datar jonno collection 
    const usersCollection = client.db("bistroDb").collection("users");

// menu ar datar jonno collection 
    const menuCollection = client.db("bistroDb").collection("menu");
    
// reviews ar datar jonno collection 
    const reviewCollection = client.db("bistroDb").collection("reviews");

// cart collection ar datar jonno collection 
    const cartCollection = client.db("bistroDb").collection("carts"); 



    // JWT CREATE ------
    app.post('/jwt', (req,res)=>{
      const user = req.body;
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET,{expiresIn:'1h'})
      res.send({token});

    })

// all user get kora ------
app.get('/users',async (req,res)=>{
  const result = await usersCollection.find().toArray();
  res.send(result);
})



// users related api ------
app.post('/users',async(req,res)=>{
  const user = req.body;
  // console.log(user)

  // --------- Google unlimited user in email ------------
  // google ar datar jonno ------ user akber login korte parbe but avaba korle user 
// joto khusi login korte parbe ----
const query = {email: user.email}
const existingUser = await usersCollection.findOne(query);
// console.log("existingUser",existingUser);
if(existingUser){
  return res.send({message :'user already exists'})
} 
// ------------------------------

  const result = await usersCollection.insertOne(user);
  res.send(result);
}) 


// admin korenor jonno ------------

app.patch('/users/admin/:id',async(req,res)=>{
  const id = req.params.id;
  const filter = {_id: new ObjectId (id)};
  const updateDoc = {
    $set:{
      role: 'admin'
    },
  };
  const result = await usersCollection.updateOne(filter,updateDoc);
  res.send(result);
})


// all users delete ----
app.delete('/users/:id',async(req,res)=>{
  const id = req.params.id;
  const query = {_id: new ObjectId(id)};
  const result = await cartCollection .deleteOne(query)
  res.send(result);
})



// menu json ar data    
// data mongodb theka nia aste hole get korte hba ---sobgulo data ante hole find kore toArray dite hba
    app.get('/menu',async(req,res)=>{
               const result = await menuCollection.find().toArray()
               res.send(result);
    })

// add an item ar data post kore client side a pathano ======
app.post('/menu',async (req,res)=>{
  const newItem = req.body
  const result =await menuCollection.insertOne(newItem)
  res.send(result);
})








//     -----------------------------------
// reviews json data 
//    data mongodb theka nia aste hole get korte hba ---sobgulo data ante hole find kore toArray dite hba
    app.get('/reviews',async(req,res)=>{
               const result = await reviewCollection.find().toArray()
               res.send(result);
    })
//     -----------------------------------

// cart collection ar jonno api -----
app.post('/carts', async(req,res)=>{
  const item = req.body;
  const result = await cartCollection.insertOne(item);
  res.send(result);
})

// email ar jonno 
// app.get('/carts',verifyJWT, async(req,res)=>{
app.get('/carts', async(req,res)=>{
  const email = req.query.email;
  // console.log(email);
  // jodi email na pai tahole empty array hisabe pathaba
  if(!email){
    res.send([]);
  }


// jwt 
// const decodedEmail = req.decoded.email;
// if(email !== decodedEmail){
//     return res.status(403).send({error : true, message: 'pobidden access'});
  
// }


  const query = {email: email};
  const result = await cartCollection.find(query).toArray();
  res.send(result)
})

// delete button ar jonno --------------

app.delete('/carts/:id',async(req,res)=>{
  const id = req.params.id;
  const query = {_id: new ObjectId(id)};
  const result = await cartCollection .deleteOne(query)
  res.send(result);
})


    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
//     await client.close();
  }
}
run().catch(console.dir);




app.get('/', (req, res) => {
  res.send('food is come')
})

app.listen(port, () => {
  console.log(`Food is come  on fire  ${port}`)
})


/**
 * ---------------
 *     NAMING CONVENTION
 * --------------------------
 * 
 * users : userCollection
 * app.get('/users') ----sob gulo users k get korchi
 *app.get('/users/:id') ---------particular id k get kora
 * app.post('/users') ---------------notun users create korer jonno and client side data pathano
 * app.patch('/users/:id') -------------update koranor jonno
 * app.put('/users/:id')
 * app.delete ('/users/:id') -----------delete korer jonno
 */