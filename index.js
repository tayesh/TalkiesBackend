const express = require('express');
const cors = require('cors');
const { ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;


app.use(cors());
app.use(express.json());

const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = "mongodb+srv://Talkies:3hHrN4gS02eaL7fC@cluster0.1xhb2as.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

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
        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });

        const database = client.db('Talkies');
        const usersCollection = database.collection('UserData');
        const postsCollection = database.collection('PostData');

        app.post('/user', async (req, res) => {
            const user = req.body;
            const email =user.email;

            try {
                const existingUser = await usersCollection.findOne({ email });

                if (existingUser) {
                    return res.status(409).json({ error: 'User with this email already exists' });
                }
                const result = await usersCollection.insertOne(user);

                res.send(result);
            } catch (err) {
                console.error('Error inserting user:', err);
                res.status(500).json({ error: 'Internal server error' });
            }
        });
        app.post('/posts', async (req, res) => {
            const post = req.body;

            try {
                const result = await postsCollection.insertOne(post);
                res.send(result);
            } catch (err) {
                console.error('Error inserting user:', err);
                res.status(500).json({ error: 'Internal server error' });
            }
        });
        app.get('/posts', async (req, res) => {
            try {
              // Find all posts in the PostData collection
              const posts = await postsCollection.find().toArray();
              
              // Send the retrieved posts as a response
              res.status(200).json(posts);
            } catch (err) {
              console.error('Error retrieving posts:', err);
              res.status(500).json({ error: 'Internal server error' });
            }
          });
          

        app.get('/user', async (req, res) => {
            const email = req.query.email; // Retrieve email from query parameters
      
            if (!email) {
              return res.status(400).json({ error: 'Email is required' });
            }
      
            try {
              // Find the user with the specified email
              const user = await usersCollection.findOne({ email });
      
              if (!user) {
                return res.status(404).json({ error: 'User not found' });
              }
      
              // Return the user data, excluding the password for security
              res.send(user);
            } catch (err) {
              console.error('Error retrieving user:', err);
              res.status(500).json({ error: 'Internal server error' });
            }
          });
          app.patch('/user', async (req, res) => {
            const {email,userInfo} = req.body; // Email, property name, and value from request body
            const newProperty ="userInfo"
            try {
              // Update the user with the specified email by adding or updating the property
              const result = await usersCollection.updateOne(
                { email },
                { $set: { [newProperty]:userInfo  } }
              );
      
              if (result.matchedCount === 0) {
                return res.status(404).json({ error: 'User not found' });
              }
      
              res.status(200).json({ message: 'User updated successfully', modifiedCount: result.modifiedCount });
            } catch (err) {
              console.error('Error updating user:', err);
              res.status(500).json({ error: 'Internal server error' });
            }
          });
          app.delete('/posts/:id', async (req, res) => {
            const postId = req.params.id; // Get the post ID from the request parameters
          
            try {
              // Delete the post with the specified ID
              const result = await postsCollection.deleteOne({ _id: new ObjectId(postId) });
          
              if (result.deletedCount === 0) {
                // If no document was deleted, the post was not found
                return res.status(404).json({ error: 'Post not found' });
              }
          
              // Send a success response if the post was deleted
              res.status(200).json({ message: 'Post deleted successfully' });
            } catch (err) {
              console.error('Error deleting post:', err);
              res.status(500).json({ error: 'Internal server error' });
            }
          });





        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error

    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send("talkies is online");
})

app.listen(port, () => {
    console.log(`talkies is running on port ${port}`);
})