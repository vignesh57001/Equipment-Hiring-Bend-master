const express = require("express");
const cors = require("cors");
const app = express();
const morgan = require("morgan")
const cookieParser = require('cookie-parser');
const cartRouter = require('./routes/cart');
const usersRouter = require('./routes/users');
const dashboardRouter = require('./routes/dashboard');



app.use(express.json())
app.use(cors())
    


app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(morgan("dev"))



app.use('/', usersRouter);
app.use('/cart', cartRouter);
app.use('/product', dashboardRouter);


app.listen(process.env.PORT || 3001);