const bodyParser = require('body-parser')
const session = require('express-session')
const app = require('express')()
const http = require('http').Server(app)
const io = require('socket.io')(http)

const mongo = require('mongodb').MongoClient

const port = process.env.PORT || 3000
const mongoUrl = process.env.MONGODB_URI || 'mongodb://localhost:27017/dev'

app.use(bodyParser.json())
app.use(session({ secret: 'Shh, its a secret! Unicorn.' }))

app.use((req, res, next) => {
  const publicURLs = ['/login', '/register', '/']
  if (publicURLs.indexOf(req.url) != -1) {
    return next()
  }
  if (!req.session.user) {
    res.send(403)
  }
  app.locals.db
    .collection('User')
    .findOne({ name: req.session.user })
    .then(user => {
      if (user) {
        req.authUser = user
        next()
      } else {
        res.send(403)
      }
    })
})

app.get('/', (req, res) => {
  app.locals.db
    .collection('User')
    .find({})
    .toArray()
    .then(users => {
      const userlist = users.reduce(
        (html, user) =>
          html +
          `<li>${user.name}, DEBUG INFORMATION: ${JSON.stringify(user)}</li>`,
        []
      )
      res.send(
        `<html><body style='font-family: sans-serif;'><h2>Users:</h2><ul>${userlist}</ul></html></body>`
      )
    })
})

app.post('/register', (req, res) => {
  const user = req.body
  if (user.name && user.password && user.type) {
    app.locals.db
      .collection('User')
      .countDocuments({ name: user.name })
      .then(count => {
        if (count != 0) {
          return res.sendStatus(400)
        }
        app.locals.db.collection('User').insertOne(user, function(err, obj) {
          if (err) throw err
          console.log(user)
          req.session.user = user.name
          res.sendStatus(200)
        })
      })
  } else {
    console.log('Error: ', user)
    res.sendStatus(400)
  }
})

app.post('/login', (req, res) => {
  const user = req.body
  if (user.name && user.password) {
    app.locals.db
      .collection('User')
      .findOne({ name: user.name, password: user.password })
      .then(matchingUser => {
        if (matchingUser) {
          req.session.user = matchingUser.name
          return res.send(200, matchingUser)
        } else {
          console.log('No user found: ', user)
          res.sendStatus(400)
        }
      })
  } else {
    console.log('Error: ', user)
    res.sendStatus(400)
  }
})

io.on('connection', socket => {
  socket.on('position', positionJandler)
})

mongo.connect(
  mongoUrl,
  { useNewUrlParser: true },
  (err, client) => {
    if (err) throw err
    const db = client.db()

    // CLEAN THE DB ON RESTART...

    db.dropDatabase()
    app.locals.db = db
    db.collection('User').createIndex({ name: 1 }, { unique: true })
    http.listen(port, () => {
      console.log('Listening on *:' + port)
    })
  }
)

// /////////////////
// Functions
// /////////////////

function positionHandler(msg) {
  io.emit('position', msg)
}
