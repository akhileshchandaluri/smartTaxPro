function submitForm() {
    const data = {
        name: document.getElementById('name').value,
        email: document.getElementById('email').value,
        salary: document.getElementById('salary').value,
        capitalGains: document.getElementById('capitalGains').value,
        sec80c: document.getElementById('sec80c').value,
        sec80d: document.getElementById('sec80d').value,
        homeLoan: document.getElementById('homeLoan').value,
        multipleHouse: document.getElementById('multipleHouse').value
    };

   fetch('http://localhost:3000/api/regime', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
})

    .then(res => res.json())
    .then(resData => {
        document.getElementById('result').innerHTML = `
            <h3>Recommended Regime: ${resData.regime}</h3>
            <p>${resData.reason}</p>
            <p>Old Regime Tax: ₹${resData.oldTax}</p>
            <p>New Regime Tax: ₹${resData.newTax}</p>
        `;
    })
    .catch(err => console.error("Error:", err));
}
