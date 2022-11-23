var express = require('express');
var router = express.Router();
const mongodb = require("mongodb")
const dotenv = require("dotenv").config()
const bcrypt = require("bcryptjs")
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer')
const mongoClient = mongodb.MongoClient
const URL = process.env.DB;
const DB = "rental_database";

/* GET users listing. */

// user register
router.post("/register", async (req, res) => {

  try {
    // Step 1 : Create a Connection between Nodejs and MongoDB
    const connection = await mongoClient.connect(URL);

    // Step 2 : Select the DB
    const db = connection.db(DB);

    // salt generation

    let salt = await bcrypt.genSalt(10);
    let hash = await bcrypt.hash(req.body.password, salt);

    req.body.password = hash

    // Step 3 : Select the Collection
    // Step 4 : Do the operation (Create,Update,Read,Delete)
    await db.collection("users").insertOne(req.body);

    // Step 5 : Close the connection
    await connection.close();

    res.json({
      statusCode: 201,
      message: " user Register Successfully"
    })
  } catch (error) {
    console.log(error);
    // If any error throw error
    res.json({
      statusCode: 500,
      message: "Internal Server Error",
      error
    })
  }
});


// user login 
router.post("/login", async (req, res) => {

  try {
    // Step 1 : Create a Connection between Nodejs and MongoDB
    const connection = await mongoClient.connect(URL);

    // Step 2 : Select the DB
    const db = connection.db(DB);

    // first to check the email in database
    let user = await db.collection("users").findOne({ email: req.body.email })

    if (user) {
      // compare the two password
      let compare = await bcrypt.compare(req.body.password, user.password)
      if (compare) {
        let token = jwt.sign({ id: user._id },process.env.SECRETKEY, { expiresIn: "1h" });
        res.json({
          statusCode:201,
          message: "login successfully",
          token,
          user,
        })
      } else {
        res.json({
          statusCode: 401,
          message: "Invaild Email / Password"
        })
      }
    } else {
      res.json({
        statusCode: 401,
        message: "Invaild Email / Password"
      })
    }
    // Step 5 : Close the connection
    await connection.close();
  } catch (error) {
    console.log(error);
    // If any error throw error
    res.json({
      statusCode: 500,
      message: "Internal Server Error",
      error
    })
  }
});

// Forget password send in mail

router.post("/reset-sendmail", async (req, res) => {



  try {


// Step 1 : Create a Connection between Nodejs and MongoDB
const connection = await mongoClient.connect(URL);

// Step 2 : Select the DB
const db = connection.db(DB);

// first to check the email in database
let user = await db.collection("users").findOne({ email: req.body.email })


if(user){
  let token = jwt.sign({ id: user._id },process.env.SECRETKEY, { expiresIn: "10m" });
  // console.log(process.env.BASE_URL);
  let url = `${process.env.BASE_URL}/password/${user._id}/${token}`

  let transporter = nodemailer.createTransport({
      service: 'gmail',
      host: 'smtp.gmail.com',
      port: 993,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.EMAILUSE, // generated ethereal user
        pass: process.env.EMAILPASS, // generated ethereal password
      },
    }); 
  let details = {
  from: "sivanathanv36@gmail.com", // sender address
  to: user.email, // list of receivers
  subject: "Hello ✔", // Subject line
  text: `Reset link`, // plain text body
  // html: "<b>Hello world?</b>", // html body
  html: `<a href=${url}>Password Reset Link Click here !!!</a>`
  }
  
    await transporter.sendMail(details,(err)=>{
         if(err){
          res.json({
              statusCode: 200,
              message:"it has some error for send a mail",
            })
         
         }else{
          res.json({
              statusCode: 200,
              message:"Password Reset link send in your mail",
            })
         }
    });


}else{
  res.json({
      statusCode: 401,
      message: "Invaild Email",
      
    })
}


//   console.log(req.body);
// Step 5 : Close the connection
await connection.close();
   
  } catch (error) {
    res.json({
      statusCode: 500,
      message: "Internal Server Error",
      error
    })
  }
});




// authenticate for for got password 
const authenticate = (req, res, next) => {
  // check the token in body
  if (req.body.token) {
    try {
      // check the token is valid or not
      let decode = jwt.verify(req.body.token, process.env.SECRETKEY)
      if (decode) {
        next();
      }

    } catch (error) {
      res.json({
        statusCode: 401,
        message: "Your token is expiry",
        error,
      })
    }

  } else {
    res.json({
      message: 401,
      statusbar: "unauthorized"
    })
  }

}



// Password Reset Form

router.post("/password-reset",authenticate, async(req,res)=>{
try {


 const connection = await mongoClient.connect(URL);


 const db = connection.db(DB);
// hash the password
 let salt = await bcrypt.genSalt(10);
 let hash = await bcrypt.hash(req.body.password, salt);

 req.body.password = hash

 // update the password in database
 await db.collection("users").updateOne({ _id: mongodb.ObjectId(req.body.id)},{$set:{ password: req.body.password }})
res.json({
  statusCode: 201,
  message:"Password Reset successfully",
})
  
} catch (error) {
  
}

})




module.exports = router;
