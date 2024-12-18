# Chat App

## Introduction

This is a simple chat application built using Node.js and Socket.IO. The app allows users to log in, view a chat page, and send messages in real time. Additionally, the app provides RESTful API endpoints for creating, reading, updating, and deleting users.

## Installation

To install the app, follow these steps:

1. Clone the repository: `git clone <repository url>`
2. Install dependencies: `npm install`
3. Run the app: `npm start`

By default, the app will run on port 3000. You can change this by setting the `PORT` environment variable.

## Usage

### API Endpoints

The following API endpoints are available:

* `POST /signup`: create a new user
* `POST /login`: log in with an existing user
* `GET /`: get all users
* `GET /:id`: get a specific user by ID
* `PUT /:id`: update a specific user by ID
* `DELETE /:id`: delete a specific user by ID

### Web Pages

The following web pages are available:

* `/`: the login page
* `/chat-page`: the chat page

To access the chat page, you must first log in with a valid email and password.

### Socket.IO

The app uses Socket.IO to provide real-time communication between clients and the server. Socket.IO allows clients to send and receive messages in real time, and provides a number of built-in features for handling events, rooms, and namespaces.

## Documentation

API documentation is available in the `docs` directory. To generate the documentation, run `npm run docs`. The documentation is generated using JSDoc.

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

Please make sure to update tests as appropriate.

## Additional Details

This is a jwt secret key and mongodb uri.


## License

[MIT](https://choosealicense.com/licenses/mit/)
