require('dotenv').config();
const express = require('express');
const app = express();
const db = require('./models');

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const mainRouter = require('./routes/mainRouter');

app.use('/api', mainRouter);

db.sequelize.sync().then(() => {
    app.listen(process.env.PORT, () => {
        console.log(`App is running at ${process.env.PORT}`);
    })
})