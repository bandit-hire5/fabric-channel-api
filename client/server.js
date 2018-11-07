const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

mongoose.Promise = Promise;
mongoose.connect('mongodb://127.0.0.1:27017/zfortdb', {
    useNewUrlParser: true,
});

app.use(bodyParser.urlencoded({
    extended: true,
}));
app.use(bodyParser.json());

const routes = require('./api/routes/ChannelRoutes');
routes(app);

app.listen(port);

console.log('Zfort RESTful API server started on: ' + port);