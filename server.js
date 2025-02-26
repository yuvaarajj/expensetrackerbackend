const express = require('express')
const cors = require("cors");

const bcrypt = require('bcryptjs')
const mongoose = require('mongoose')

const app = express()
app.use(cors(), express.json());  

const PORT = 5000
const uri = "mongodb+srv://expensetrackeruser:999999999@cluster0.daqs8.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"

mongoose.connect(uri)
.then(() =>
    console.log('connected to mongoose')
).catch((e) => console.log(`not connected ${e}`))


app.get("/", (req, res) => {
    res.send("Server is running!");
});

// creatingg Schema
const expenseSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String,
  });
  
  // Create Model (Collection)
  const User = mongoose.model("User", expenseSchema);
  
app.post('/register', async (req, res) => {
  const {name, email, password} = req.body
  console.log(req.body)
  try{
    let user = await User.findOne({email})
    if(user) {
      return(
        res.status(400).json({msg: "User already exist"})
      )
    }
    const hashedPassword = await bcrypt.hash(password, 10)
    user = new User({name, email, password: hashedPassword})

 // Generate Token
 const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "1h" });

 // Set Cookie
 res.cookie("token", token, { 
   httpOnly: true, 
   secure: "production", // Set to `true` in production (HTTPS)
   sameSite: "strict",
   maxAge: 3600000 // 1 hour
 });

    await user.save()
    res.status(201).json({ msg: "User registered successfully" });

  } catch (error) {
    res.status(500).json({ error: "Server error" });
  
  }
})

app.post('/login', async (req, res) => {
  const {email, password} = req.body
  try{
    let user = await User.findOne({email})
    if(!user){
      return(

        res.status(400).json({msg: "invalid email"})
      )
    }
const isMatch = await bcrypt.compare(password, user.password)
if(!isMatch){
  return(

    res.status(400).json({msg: "invalid Password"})
  )
}
res.status(200).json({msg:"Login Successfull"})
  }catch(error){
    res.status(500).json({error:"server error"})
  }
})

const expenseList = new mongoose.Schema({
  title: String,
  amount: Number,
  category: String,
  date: String,
  payment: String
})

const expenseModel = mongoose.model("expensel", expenseList);

app.post('/ExpenseList' , async (req, res) => {
  const {title, amount, category, date, payment} = req.body
  const expense = new expenseModel({title, amount, category, date, payment})
  await expense.save();
res.send('data loaded successfully')
})

console.log("MongoDB connection status:", mongoose.connection.readyState);

app.get('/allItems', async (req, res) => {
  try{
    const expenses = await expenseModel.find()
    res.json(expenses)

  }catch(error){
    res.status(500).send("error fetching expense:" + error.msg)
  }
  
})

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
