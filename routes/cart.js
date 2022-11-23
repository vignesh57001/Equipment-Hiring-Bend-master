var express = require('express');
var router = express.Router();
const mongodb = require("mongodb")
const dotenv = require("dotenv").config()
// const bcrypt = require("bcryptjs")
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer')
const mongoClient = mongodb.MongoClient
const URL = process.env.DB;
const DB = "rental_database";




  // Cart items add to database
  router.post("/addToCart", async (req, res) => {

    try {
      // Step 1 : Create a Connection between Nodejs and MongoDB
      const connection = await mongoClient.connect(URL);
  console.log(req.body);
      // Step 2 : Select the DB
      const db = connection.db(DB);
  
      // Step 3 : Select the Collection
      // Step 4 : Do the operation (Create,Update,Read,Delete)
     let data =  await db.collection("carts").insertOne(req.body);
      // Step 5 : Close the connection
      await connection.close();
  
      res.json({
        statusCode: 201,
        message: "Added Successfully",
        data
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

  // payment details send in mail

  router.post("/send_mail", async (req, res) => {
 
    try {

      console.log(req.body);
      
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
        to: req.body.email, // list of receivers
        subject: "Hello ✔", // Subject line
        text:"Equipment Hiring", // plain text body
        // html: "<b>Hello world?</b>", // html body
        html: `<div className="email" style="border: 1px solid black;padding: 20px;font-family: sans-serif;line-height: 2;font-size: 20px; ">
               
                          <h2> Hello ${req.body.name} your order Amount paid......... </h2>
                          <p> Your Order Id = ${req.body.orderid}</p>
                          <p> Your Payment Id = ${req.body.paymentid}</p>
                          <p>All the best ${req.body.name} Vist for next time </p>
      
               </div>`
      }
      
          let info = await transporter.sendMail(details,(err)=>{
               if(err){
                res.json("it has some error")
               }else{
                res.json({
                  val : "Mail send successfully",
                  statusCode : 200
                  
                })
               }
          });
      
        } catch (error) {
          res.json({
            statusCode: 500,
            message: "Internal Server Error",
            error
          })
        }
  
  
  
  
  
  });









module.exports = router;
