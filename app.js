const express = require('express')
const mongoose = require('mongoose')

//app routes
const authRoutes = require('./routes/authentication')
const tripsRoutes = require('./routes/trips')
const questionsRoutes = require('./routes/questions')
const storyRoutes = require('./routes/Story')
const replyRoutes = require('./routes/reply')
const reviewsRoutes = require('./routes/reviews')
const reactionRoutes = require('./routes/reactions')
/*const discussRoutes = require('./routes/questions')
const followRoutes = require('./routes/follow')
const tripsRoutes = require('./routes/trips')
const userprofilRoutes = require('./routes/Userprofil')
const agencyprofilRoutes = require('./routes/Agencyprofil')
const FilterRoutes = require('./routes/Filter')
const tripReplyRoutes = require('./routes/tripReply')
const favorieRoutes = require('./routes/favorie')
const story = require('./routes/Story');
const forgetpasswordRoutes = require('./routes/forgetpassword')*/

require('dotenv').config();

const cookieParser = require('cookie-parser')
const { requireAuth } = require('./middleware/authMiddleware')
const app = express()

//middelware 
app.use(express.json())
app.use(express.static('public'))
app.use(cookieParser())

app.use(
  /*
  tripReplyRoutes,
  favorieRoutes,
  userprofilRoutes,
  agencyprofilRoutes,
  FilterRoutes,
  followRoutes,
  discussRoutes,
  story,
  forgetpasswordRoutes*/
  authRoutes,
  tripsRoutes,
  questionsRoutes,
  storyRoutes,
  reviewsRoutes,
  replyRoutes,
  reactionRoutes,
)







// database connection

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true, useUnifiedTopology: true,
})
  .then((result) => {
    app.listen(5000)
    console.log("server is listening on port 5000")
  })
  .catch((err) => console.log(err));
