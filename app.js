const express = require("express");
require('dotenv').config();
const app = express();
const port = 3000;
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const path = require("path");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");
const passport = require("passport");
const localStrategy = require("passport-local");
const User = require('./models/User');

const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const upload = multer({ dest: 'uploads/' });
const fs = require('fs');
const { error } = require("console");

// Configure Cloudinary
cloudinary.config({
    cloud_name:process.env.cloud_name, 
    api_key:process.env.api_key, 
    api_secret:process.env.api_secret,
});

// Connect to MongoDB
mongoose.connect(process.env.mongo_url)
.then(() => console.log('MongoDB connected successfully!'))
.catch(err => console.log('Error connecting to MongoDB: ', err));;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');
app.use(express.json());

const store = MongoStore.create({
  mongoUrl:process.env.mongo_url,
  crypto:{
    secret: process.env.secret,
  },
  touchAfter: 24*3600
})

store.on("error", ()=>{
  console.log("error in connecting mongo session store",error)
})

const sessionOptions = {
  store,
  secret: process.env.secret,
  resave:false,
  saveUninitialized:true,
  cookie:{
    expires: Date.now() + 3*24*60*60*1000,
    maxAge: 3*24*60*60*1000,
    httpOnly: true,
  }
}

const Upload = {
  uploadFile: async (filePath) => {
    try {
      const result = await cloudinary.uploader.upload(filePath);
      return result; // Return the upload result
    } catch (error) {
      throw new Error('Upload failed: ' + error.message);
    }
  },
};
const methodOverride = require('method-override');

app.use(methodOverride('_method')); 
app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.currUser = req.user;
    next();
});

const {isLoggedIn,saveRedirectUrl,isAdmin,ensureAuthenticated} = require('./middlewares/login.js');

const userrouter = require("./routes/user.js");
const otprouter = require("./routes/otp.js");

app.use("/user",userrouter);
app.use("/user",otprouter);
// app.use("/",productrouter);
// app.use("/",paymentrouter);
// app.use("/",orderrouter);
// app.use("/",cartrouter);
// app.use("/",adminrouter);
// app.use("/",reviewrouter);

app.get("/", async (req,res)=>{
    res.render("index.ejs");
})

// app.get("/aboutus",isLoggedIn, (req,res)=>{
//   res.render('aboutUs.ejs');
// })

// app.get("/services",isLoggedIn, (req,res)=>{
//   res.render('services.ejs');
// })

// // Route to render the Add Address Page
// app.get("/add-address",isLoggedIn, (req, res) => {
//   res.render("add-address", { 
//       currUser: req.user,  // Pass the logged-in user
//       isEdit: false  // Explicitly set isEdit to false
//   });
// });

// app.post('/add-address', isLoggedIn, saveRedirectUrl, async (req, res) => {
//   console.log('Redirect URL from locals:', res.locals.RedirectUrl);
//   const { street, city, state, pincode, mobile } = req.body;
//   console.log(req.body);
//   try {
//       await User.findByIdAndUpdate(req.user._id, {
//           address: { street, city, state, pincode },
//           mobile
//       });

//       // Redirect to the saved URL or the home page
//       const redirectUrl = res.locals.RedirectUrl || "/";
//       console.log('Redirecting to:', redirectUrl);
//       res.redirect(redirectUrl);
//   } catch (err) {
//       console.error('Error while adding address:', err);
//       res.redirect('/add-address');
//   }
// });


// // Route to render the Edit Address Page
// app.get("/edit-address",isLoggedIn, (req, res) => {
//   if (!req.user.address) {
//       return res.redirect("/add-address");
//   }
//   res.render("add-address", { 
//       currUser: req.user, 
//       isEdit: true  // Set isEdit to true for edit mode
//   });
// });

// // Handle Address Update
// app.post('/edit-address',isLoggedIn, async (req, res) => {
//   const { street, city, state, pincode, mobile } = req.body;
//   try {
//       await User.findByIdAndUpdate(req.user._id, {
//           address: { street, city, state, pincode },
//           mobile
//       });
//       res.redirect(`/cart/${req.user._id}`);
//   } catch (err) {
//       console.error(err);
//       res.redirect('/edit-address');
//   }
// });



app.listen(port, () => console.log(`Server running on http://localhost:${port}`));
