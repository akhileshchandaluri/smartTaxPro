function calculateTaxOldRegime(income, deductions = 0) {
    const taxableIncome = Math.max(income - deductions - 50000, 0); // 50k standard deduction
    let tax = 0;

    if (taxableIncome <= 250000) tax = 0;
    else if (taxableIncome <= 500000) tax = (taxableIncome - 250000) * 0.05;
    else if (taxableIncome <= 1000000) tax = 12500 + (taxableIncome - 500000) * 0.20;
    else tax = 112500 + (taxableIncome - 1000000) * 0.30;

    return tax * 1.04; // add 4% cess
}

function calculateTaxNewRegime(income) {
    const taxableIncome = Math.max(income - 50000, 0); // 50k standard deduction
    let tax = 0;

    if (taxableIncome <= 300000) tax = 0;
    else if (taxableIncome <= 600000) tax = (taxableIncome - 300000) * 0.05;
    else if (taxableIncome <= 900000) tax = 15000 + (taxableIncome - 600000) * 0.10;
    else if (taxableIncome <= 1200000) tax = 45000 + (taxableIncome - 900000) * 0.15;
    else if (taxableIncome <= 1500000) tax = 90000 + (taxableIncome - 1200000) * 0.20;
    else tax = 150000 + (taxableIncome - 1500000) * 0.30;

    return tax * 1.04; // add 4% cess
}

function calculateRegime({ salary, capitalGains, sec80c, sec80d, homeLoan, multipleHouse }) {
    salary = Number(salary || 0);
    capitalGains = Number(capitalGains || 0);
    sec80c = Number(sec80c || 0);
    sec80d = Number(sec80d || 0);
    homeLoan = Number(homeLoan || 0);

    const totalIncome = salary + capitalGains;
    const totalDeductions = sec80c + sec80d + homeLoan;

    const oldTax = calculateTaxOldRegime(totalIncome, totalDeductions);
    const newTax = calculateTaxNewRegime(totalIncome);

    let regime = '';
    let reason = '';

    if (oldTax < newTax) {
        regime = 'Old Regime';
        reason = 'Old Regime saves you more tax based on your deductions.';
    } else {
        regime = 'New Regime';
        reason = 'New Regime saves you more tax or you have few deductions.';
    }

    return { regime, reason, oldTax: oldTax.toFixed(0), newTax: newTax.toFixed(0) };
}

module.exports = { calculateRegime };
