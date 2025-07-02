const companyButtonsContainer = $('#company-buttons');
const errorMessageContainer = $('#error-message');


// Setup form validations
setupFormValidations();

/**
 * Setup form validations using jQuery Validate
 */
function setupFormValidations() {

    $('#addCompanyForm').validate({
        rules: {
            companyName: { required: true },
            customerWebsite: { required: true }
        },
        messages: {
            companyName: "Please enter a company name",
            customerWebsite: "Please enter a company website"
        }
    });

    
    $('#addCustomerForm').validate({
        rules: {
            customerName: { required: true },
            customerEmail: { required: true },
            customerAddress: { required: true }
        },
        messages: {
            customerName: "Please enter a name",
            customerEmail: "Please enter an email",
            customerAddress: "Please enter an address"
        }
    });
}


// Function to fetch and display companies
async function fetchAndDisplayCompanies() {
    try {
        // Clear any previous error messages
        errorMessageContainer.empty();
        // Show a loading indicator (optional, but good for UX)
        companyButtonsContainer.html('<div class="col-12 text-center text-muted">Loading companies...</div>');

        const response = await fetch('/api/companies');

        if (!response.ok) {
            // If response is not OK (e.g., 404, 500), throw an error
            const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
            throw new Error(`HTTP error! Status: ${response.status}, Message: ${errorData.message || 'Failed to fetch companies'}`);
        }

        const companies = await response.json();

        // Clear loading message/previous buttons
        companyButtonsContainer.empty();

        if (companies.length === 0) {
            companyButtonsContainer.html('<div class="col-12 text-center text-muted">No companies found (0 exist in database).</div>');
            return;
        }

        // Iterate over the fetched companies and create buttons
        companies.forEach(company => {
            // Ensure company._id and company.company_name exist
            if (company._id && company.company_name) {
                const button = $(`
                        <div class="col-12 mb-2">
                            <a href="/list/${company._id}" class="btn btn-primary btn-block w-100">
                                ${company.company_name}
                            </a>
                            <span>
                                Website: ${company.company_website}
                            </span>
                        </div>
                        <br />
                    `);
                companyButtonsContainer.append(button);
            } else {
                console.warn('Skipping company due to missing _id or company_name:', company);
            }
        });

    } catch (error) {
        console.error('Error fetching companies:', error);
        errorMessageContainer.html(`<div class="alert alert-danger" role="alert">
                                            Failed to load companies: ${error.message}. Please try again later.
                                        </div>`);
        companyButtonsContainer.empty(); // Clear any loading message
    }
}


/**
 * Show add company modal
 */
function showAddCompanyModal() {
    $('#addCompanyModal').modal('show');
}


/**
 * Add new company
 */
function addCompany() {

    // JQuery Validate
    if (!$('#addCompanyForm').valid()) {
        return;
    }

    const formData = {
        company_name: $('#companyName').val(),
        company_website: $('#companyWebsite').val()
    };

    $.ajax({
        url: '/api/companies',
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(formData),
        success: function (response) {
            $('#addCompanyModal').modal('hide');
            $('#addCompanyForm')[0].reset();
            alert('Company created successfully!');

            fetchAndDisplayCompanies();
        },
        error: function (xhr, status, error) {
            console.error('Error creating company:', error);
            const errorMsg = xhr.responseJSON ? xhr.responseJSON.error : 'Error creating company';
            alert('Error: ' + errorMsg);
        }
    });
}


/**
 * Show add customer modal
 */
function showAddCustomerModal() {
    $('#addCustomerModal').modal('show');
}


/**
 * Add new customer
 */
function addCustomer() {
    
    // JQuery Validate
    if (!$('#addCustomerForm').valid()) {
        return;
    }

    const formData = {
        customer_name: $('#customerName').val(),
        customer_email: $('#customerEmail').val(),
        customer_address: $('#customerAddress').val()
    };

    $.ajax({
        url: '/api/customers',
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(formData),
        success: function (response) {

            $('#addCustomerModal').modal('hide');
            $('#addCustomerForm')[0].reset();
            alert('Customer created successfully!');
        },
        error: function (xhr, status, error) {
            
            console.error('Error creating customer:', error);
            const errorMsg = xhr.responseJSON ? xhr.responseJSON.error : 'Error creating company';
            alert('Error: ' + errorMsg);
        }
    });
}


// Call the function when the document is loaded
fetchAndDisplayCompanies();
