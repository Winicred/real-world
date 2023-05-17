require('dotenv').config();

const express = require('express');
const cors = require('cors');
const {connect} = require("./database/connect");

const corsOptions = require('./config/corsOptions');
const PORT = process.env.PORT || 3000;

const app = express();

app.use(cors(corsOptions));
app.use(express.json());

app.use('/test', require('./routes/testRoutes'));
app.use("/api", require('./routes'));

connect().then(() => {
    app.listen(PORT);
});
