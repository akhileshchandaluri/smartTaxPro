const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { calculateRegime } = require('./utils/regimeLogic'); // correct path

const app = express();
app.use(cors());
app.use(bodyParser.json());

// API endpoint
app.post('/api/regime', (req, res) => {
    try {
        const { salary, capitalGains, sec80c, sec80d, homeLoan, multipleHouse } = req.body;

        const recommendation = calculateRegime({ salary, capitalGains, sec80c, sec80d, homeLoan, multipleHouse });

        res.json(recommendation);
    } catch (err) {
        console.error("Error:", err);
        res.status(500).send({ error: "Something went wrong" });
    }
});

const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
