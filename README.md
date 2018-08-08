# "The Classroom" Server

This server is used as an API endpoint for all connectivity things.

**Address: `https://clasroom-server.herokuapp.com/`**

## Available API endpoints

### Users

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
