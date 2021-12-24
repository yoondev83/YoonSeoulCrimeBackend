const express   =   require("express");
const app       =   express();
const port      =   process.env.PORT || 5000;
const mongoose  =   require("mongoose");
const config    =   require("./config/key");
const session   =   require("express-session");
const passport  =   require("./config/passport");
const cors      =   require("cors");

mongoose.connect(config.MONGODB_URI)
.then(() => {console.log("DB is connected")})
.catch(err => console.log(err));

app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers,X-Access-Token,XKey,Authorization');
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept"
    );
    next();
  });

app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.set("trust proxy", 1);
app.use(session({
    secret: config.PASS_SECRET,
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
app.use("/", require("./routes/main"));

app.listen(port, () => console.log(`Server has started on ${port}`));

