const User = require('../models/user');
const { calculateRegime } = require('../utils/regimeLogic');

const recommendRegime = async (req, res) => {
    const { name, email, salary, capitalGains, sec80c, sec80d, homeLoan, multipleHouse } = req.body;

    const recommendation = calculateRegime({ salary, capitalGains, sec80c, sec80d, homeLoan, multipleHouse });

    // Optional: save to MongoDB
    try {
        const user = new User({
            name,
            email,
            salary,
            capitalGains,
            sec80c,
            sec80d,
            homeLoan,
            multipleHouse,
            recommendedRegime: recommendation.regime
        });
        await user.save();
    } catch (err) {
        console.log("Error saving user:", err);
    }

    res.json(recommendation);
};

module.exports = { recommendRegime };
