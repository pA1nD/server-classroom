const bodyParser = require('body-parser')
const session = require('express-session')
const app = require('express')()
const http = require('http').Server(app)
const io = require('socket.io')(http)

const mongo = require('mongodb').MongoClient

const port = process.env.PORT || 3000
const mongoUrl = process.env.MONGODB_URI || 'mongodb://localhost:27017/dev'
const sessionMiddleware = session({ secret: 'Shh, its a secret! Unicorn.' })

app.set('view engine', 'pug')
app.set('views', './views')

app.use(bodyParser.json())
app.use(sessionMiddleware)
io.use((socket, next) => {
  sessionMiddleware(socket.request, {}, next)
})

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
      res.render('index', { users: users })
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
        app.locals.db.collection('User').insertOne(user, (err, obj) => {
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
          return res.send(200)
        } else {
          console.log('No user found: ', user)
          res.sendStatus(403)
        }
      })
  } else {
    console.log('Error: ', user)
    res.sendStatus(400)
  }
})

io.on('connection', socket => {
  let authUser

  socket.on('login', data => {
    console.log('User tries to login: ', data)
    if (!data.name || !data.password) socket.disconnect(true)
    app.locals.db
      .collection('User')
      .findOne({ name: data.name, password: data.password })
      .then(user => {
        if (user) {
          authUser = user
          authenticatedUser()
        } else {
          socket.disconnect(true)
        }
      })
  })

  function authenticatedUser() {
    console.log('Authenitcated User connected')

    position('connect')
    socket.on('position', data => position('move', data))
    socket.on('disconnect', data => position('disconnect'))

    socket.on('chat', data => chat(data))

    socket.on('action', data => action(data))
  }
  // /////////////////
  // Functions for Socket
  // /////////////////

  function position(action, data = {}) {
    // FIXME: broadcast here.
    const position = {
      user: authUser.name,
      action: action,
      location: data.location
    }
    io.emit('position', position)
  }

  function chat(data) {
    const chat = {
      user: authUser.name,
      message: data.message,
      time: new Date().getTime()
    }
    console.log(JSON.stringify(chat))

    app.locals.db.collection('Chat').insertOne(chat, (err, obj) => {
      if (err) throw err
      // FIXME: broadcast here.
      io.emit('chat', chat)
    })
  }

  function action(data) {
    // FIXME: broadcast here.
    const action = {
      user: authUser.name,
      event: data.event,
      data: data.data
    }
    io.emit('action', action)
  }
})

// /////////////////
// Connect DB and Start Server
// /////////////////

mongo.connect(
  mongoUrl,
  { useNewUrlParser: true },
  (err, client) => {
    if (err) throw err
    const db = client.db()

    // CLEAN THE DB ON RESTART...

    // db.dropDatabase()
    app.locals.db = db
    db.collection('User').createIndex({ name: 1 }, { unique: true })

    app.locals.db
      .collection('User')
      .insertOne(
        { name: 'name', password: 'password', type: 1 },
        (err, obj) => {}
      )
    http.listen(port, () => {
      console.log('Listening on *:' + port)
    })
  }
)
