# "The Classroom" Server

This server is used as an API endpoint for all connectivity things.

**Address: `https://classroom-server.herokuapp.com/`**

## Available API endpoints

### Users

```
{
  name: string,
  password: string,
  type: string,
  stats: object
}
```

#### Register

**Description**: `Register a new user`<br />
**Endpoint**: `/register`<br />
**Method**: `POST`<br />

| Parameter name | Required/optional | Description          |
| -------------- | ----------------- | -------------------- |
| name           | required          | Name of the user     |
| password       | required          | Password of the user |
| type           | required          | Character Styling    |

#### Login

**Description**: `Login a user`<br />
**Endpoint**: `/login`<br />
**Method**: `POST`<br />

| Parameter name | Required/optional | Description          |
| -------------- | ----------------- | -------------------- |
| name           | required          | Name of the user     |
| password       | required          | Password of the user |

#### Send Position Update

**Description**: `Send information about a user location`<br />
**Method**: `socket.io`<br />
**EventName**: `position`<br />

| Parameter name | Required/optional | Description                     |
| -------------- | ----------------- | ------------------------------- |
| location       | required          | Object with new location values |

#### Receive Position Update

**Description**: `Receive information about a user location`<br />
**Method**: `socket.io`<br />
**EventName**: `position`<br />

| Parameter name | Required/optional | Description                       |
| -------------- | ----------------- | --------------------------------- |
| user           | required          | The name of the user              |
| action         | required          | [connect, disconnect, move]       |
| location       | required          | Object with new location or empty |

### Chat

```
{
  message: string,
  use: User (ref),
  time: time
}
```

#### Send Message

**Description**: `Send a message`<br />
**Method**: `socket.io`<br />
**EventName**: `chat`<br />

| Parameter name | Required/optional | Description  |
| -------------- | ----------------- | ------------ |
| message        | required          | Some string. |

#### Receive Message

**Description**: `Receive a message`<br />
**Method**: `socket.io`<br />
**EventName**: `chat`<br />

| Parameter name | Required/optional | Description          |
| -------------- | ----------------- | -------------------- |
| user           | required          | The name of the user |
| message        | required          | Some string.         |
| time           | required          | Time in UTC MS.      |

### Actions

Actions are not stored in the server but instantly distributed to all the connected clients.
Use this to create e.g. a piano play.

#### Send Action

**Description**: `Send information about an Event`<br />
**Method**: `socket.io`<br />
**EventName**: `action`<br />

| Parameter name | Required/optional | Description     |
| -------------- | ----------------- | --------------- |
| event          | required          | Some identifier |
| data           | required          | Some data       |

#### Receive Action

**Description**: `Receive information about an Event`<br />
**Method**: `socket.io`<br />
**EventName**: `action`<br />

| Parameter name | Required/optional | Description          |
| -------------- | ----------------- | -------------------- |
| user           | required          | The name of the user |
| event          | required          | Some identifier      |
| data           | required          | Some data            |
