// --- Helper Function: Format Currency ---
const currencyFormatter = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
});

// --- CORE FUNCTION 1: CALCULATE TAX BASED ON SLABS (Old Regime) ---
function calculateSlabTax(income, age) {
    // Apply Rebate under section 87A: Taxable income up to ₹5,00,000 has zero tax.
    if (income <= 500000) {
        return 0;
    }

    let tax = 0;

    // Slab 1: 2.5L to 5L @ 5% (Tax on 2.5L is ₹12,500)
    tax += 12500;

    // Slab 2: 5L to 10L @ 20%
    if (income > 500000) {
        let taxableAt20 = Math.min(income, 1000000) - 500000;
        tax += taxableAt20 * 0.20;
    }

    // Slab 3: Above 10L @ 30%
    if (income > 1000000) {
        let taxableAt30 = income - 1000000;
        tax += taxableAt30 * 0.30;
    }

    // Health and Education Cess @ 4%
    let finalTax = tax * 1.04;

    return Math.round(finalTax);
}


// --- CORE FUNCTION 2: MAIN TAX & SUGGESTIONS LOGIC ---
function calculateTaxAndSuggestions(data) {
    // --- Parse Inputs (Equivalent of Python's request.form parsing) ---
    // Ensure all parsing handles potentially non-numeric input gracefully
    const salary = parseFloat(data.salary) || 0;
    const capitalGains = parseFloat(data.capital_gains) || 0;
    const deductions80c = parseFloat(data.deductions_80c) || 0;
    const deductions80d = parseFloat(data.deductions_80d) || 0;
    const homeLoanInterest = parseFloat(data.home_loan_interest) || 0;
    const age = parseInt(data.age) || 0;
    const multipleProperties = data.multiple_properties === 'yes';
    const regime = data.tax_regime; // 'old' or 'new'

    if (regime === 'new') {
        return { error: true, message: "The New Tax Regime has been selected. It offers lower slab rates but generally disallows 80C/80D/24b deductions, so no further tax-saving suggestions on investment are applicable." };
    }


    // --- 1. Calculate Gross Total Income (GTI) ---
    const GTI = salary + capitalGains;

    // --- 2. Calculate Deductions Applied (as per Old Regime) ---
    const standardDeduction = 50000;

    // 80C
    const max80c = 150000;
    const applied80c = Math.min(deductions80c, max80c);
    const gap80c = Math.max(0, max80c - deductions80c);

    // 80D
    let max80d = 50000; // Simplified
    if (age >= 60) {
        max80d = 75000; // Simplified limit for senior citizen
    }
    const applied80d = Math.min(deductions80d, max80d);
    const gap80d = Math.max(0, max80d - deductions80d);

    // 24(b) Home Loan Interest
    let applied24b = 0;
    const maxHomeLoanInterest = 200000;
    
    if (multipleProperties) {
        applied24b = homeLoanInterest; // Full interest is deductible for rented/deemed let-out
    } else {
        applied24b = Math.min(homeLoanInterest, maxHomeLoanInterest); // Max 2L for self-occupied
    }
    const gap24b = Math.max(0, maxHomeLoanInterest - homeLoanInterest);


    // 80CCD(1B)
    const max80ccd1b = 50000;

    // Total Deductions (Pre-Suggestion)
    const totalDeductions = standardDeduction + applied80c + applied80d + applied24b;

    // --- 3. Calculate Net Taxable Income (NTI) ---
    const NTI = Math.max(0, GTI - totalDeductions);

    // --- 4. Calculate Tax Payable (Pre-Suggestion) ---
    const taxPayable = calculateSlabTax(NTI, age);


    // --- 5. AI Advisor Suggestions ---
    const suggestions = [];

    // Suggest 80C Investment
    if (gap80c > 0) {
        let riskType, investment;
        if (age < 35) {
            riskType = 'High-Risk/Growth';
            investment = 'Equity Linked Savings Schemes (ELSS) - for market-linked growth';
        } else {
            riskType = 'Low-Risk/Safety';
            investment = 'Public Provident Fund (PPF) or Tax-Saving Fixed Deposits (FDs)';
        }

        suggestions.push({
            section: 'Section 80C',
            amount: gap80c,
            message: `You can save up to ${currencyFormatter.format(gap80c)} by fully utilizing your 80C limit. Recommended ${riskType} investment: **${investment}**.`
        });
    }

    // Suggest 80CCD(1B) Investment
    suggestions.push({
        section: 'Section 80CCD(1B)',
        amount: max80ccd1b,
        message: `You can claim an **additional deduction of ${currencyFormatter.format(max80ccd1b)}** outside of the 80C limit by contributing to the **National Pension System (NPS)**.`
    });

    // Suggest 80D Investment
    if (gap80d > 0) {
        suggestions.push({
            section: 'Section 80D',
            amount: gap80d,
            message: `Your Section 80D limit for health insurance is under-utilized. You can claim an additional deduction of up to ${currencyFormatter.format(gap80d)} by buying a new or increasing coverage on your **Medical/Health Insurance** policy.`
        });
    }

    // Suggest 24(b) Action (Only if self-occupied and under-utilized)
    if (!multipleProperties && gap24b > 0 && homeLoanInterest < maxHomeLoanInterest) {
        suggestions.push({
            section: 'Section 24(b)',
            amount: gap24b,
            message: `You can claim up to ${currencyFormatter.format(maxHomeLoanInterest)} on home loan interest. Ensure you fully utilize this deduction.`
        });
    }


    // --- 6. Calculate Max Possible Tax Savings (Post-Suggestion) ---
    
    // **FIXED LOGIC**: Must include the Home Loan Interest gap (gap24b) in the potential savings calculation.
    const maxPossibleDeductions = totalDeductions + gap80c + gap80d + max80ccd1b + gap24b; 
    
    const maxNTI = Math.max(0, GTI - maxPossibleDeductions);
    const maxSavedTaxPayable = calculateSlabTax(maxNTI, age);
    
    const taxSavedPotential = taxPayable - maxSavedTaxPayable;

    return {
        GTI: GTI,
        NTI_pre_suggestion: NTI,
        tax_payable_pre_suggestion: taxPayable,
        suggestions: suggestions,
        tax_saved_potential: taxSavedPotential,
        NTI_post_suggestion: maxNTI,
        tax_payable_post_suggestion: maxSavedTaxPayable
    };
}


// --- EVENT LISTENER (The Entry Point) ---

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('tax-form');
    const resultsContainer = document.getElementById('results-container');

    if (form) {
        form.addEventListener('submit', function(event) {
            event.preventDefault(); // Stop the default form submission

            // Convert form data to a simple object
            const formData = {
                // Ensure these names match the 'name' attributes in index.html
                name: form.querySelector('[name="name"]').value,
                age: form.querySelector('[name="age"]').value,
                salary: form.querySelector('[name="salary"]').value,
                capital_gains: form.querySelector('[name="capital_gains"]').value,
                deductions_80c: form.querySelector('[name="deductions_80c"]').value,
                deductions_80d: form.querySelector('[name="deductions_80d"]').value,
                home_loan_interest: form.querySelector('[name="home_loan_interest"]').value,
                // Get value of the checked radio button
                multiple_properties: form.querySelector('[name="multiple_properties"]:checked').value, 
                tax_regime: form.querySelector('[name="tax_regime"]:checked').value
            };

            const results = calculateTaxAndSuggestions(formData);
            displayResults(results, resultsContainer);
        });
    }
});


// --- DISPLAY RESULTS FUNCTION ---

function displayResults(results, container) {
    if (results.error) {
        container.innerHTML = `
            <div style="border: 2px solid #dc3545; padding: 15px; background-color: #f8e9e9; border-radius: 8px; margin-top: 20px;">
                <h3>Error / Notice</h3>
                <p>${results.message}</p>
            </div>
        `;
        return;
    }
    
    // Create the results HTML structure
    let suggestionsHtml = '';
    results.suggestions.forEach(s => {
        // Simple replacement for bolding since this is client-side
        const message = s.message.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>'); 

        suggestionsHtml += `
            <li class="suggestion-item">
                <strong>${s.section} Gap (${currencyFormatter.format(s.amount)}):</strong> 
                ${message}
            </li>
        `;
    });

    container.innerHTML = `
        <div style="border: 2px solid #28a745; padding: 20px; border-radius: 8px; background-color: #e9f8e9; margin-top: 20px;">
            <h2>Tax Summary & Savings Potential</h2>
            <div class="summary-flex" style="display: flex; justify-content: space-around; margin-bottom: 20px;">
                <div class="summary-tile" style="text-align: center; padding: 10px; border: 1px solid #ccc; border-radius: 5px;">
                    <h3>Pre-Suggestion Tax Payable</h3>
                    <p class="tax-amount" style="font-size: 1.5em; color: #dc3545;">${currencyFormatter.format(results.tax_payable_pre_suggestion)}</p>
                    <small>Before applying suggested investments</small>
                </div>
                <div class="summary-tile" style="text-align: center; padding: 10px; border: 1px solid #ccc; border-radius: 5px;">
                    <h3>Max Possible Tax Payable</h3>
                    <p class="tax-amount" style="font-size: 1.5em; color: #007bff;">${currencyFormatter.format(results.tax_payable_post_suggestion)}</p>
                    <small>If all suggestions are implemented</small>
                </div>
                <div class="summary-tile" style="text-align: center; padding: 10px; border: 1px solid #ccc; border-radius: 5px;">
                    <h3>Potential Savings</h3>
                    <p class="tax-amount" style="font-size: 1.5em; color: #28a745;">${currencyFormatter.format(results.tax_saved_potential)}</p>
                    <small>The tax you could save!</small>
                </div>
            </div>

            <p>Your Gross Total Income: <strong>${currencyFormatter.format(results.GTI)}</strong></p>
            <p>Your Net Taxable Income (Pre-Suggestion): <strong>${currencyFormatter.format(results.NTI_pre_suggestion)}</strong></p>

            <h3>Personalized Investment Suggestions 💡</h3>
            <ul class="suggestion-list" style="list-style-type: disc; padding-left: 20px;">
                ${suggestionsHtml}
            </ul>
        </div>
    `;
}