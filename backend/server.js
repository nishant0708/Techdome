const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./Config/Database');
const userRoutes = require('./Routes/UserRoutes');
const AdminRoutes = require('./Routes/AdminRoutes');
const bodyParser = require('body-parser');

dotenv.config();
connectDB();

const app = express();

app.use(cors());
app.use(bodyParser.json());

app.use('/user', userRoutes);
app.use('/admin',AdminRoutes );

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
