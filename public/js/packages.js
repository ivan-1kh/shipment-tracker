
let currentCompanyId;

$(document).ready(function () {
    
    // Get company ID from URL
    const pathParts = window.location.pathname.split('/');
    currentCompanyId = pathParts[pathParts.length - 1];

    // Update page title
    $('#company-id').text(currentCompanyId);

    // Load packages for this company
    loadPackages();

    // Setup form validations
    setupFormValidations();
});

/**
 * Setup form validations using jQuery Validate
 */
function setupFormValidations() {
    $('#addPackageForm').validate({
        rules: {
            companyId: { required: true },
            customerId: { required: true },
            sku: { required: true },
            packageName: { required: true },
            eta: { required: true },
            status: { required: true }
        },
        messages: {
            companyId: "Please enter a company ID",
            customerId: "Please select a customer ID",
            sku: "Please enter product SKU code",
            packageName: "Please enter package name",
            eta: "Invalid ETA",
            status: "Please select package status"
        }
    });


    $('#editPackageForm').validate({
        rules: {
            editEta: { required: true },
            editStatus: { required: true }
        },
        messages: {
            editEta: "Please enter a valid ETA",
            editStatus: "Please select a status"
        }
    });
}

/**
 * Load packages from server for the current company
 */
function loadPackages() {

    $.ajax({
        url: `/api/packages?company_id=${currentCompanyId}`,
        method: 'GET',
        success: function (packages) {
            displayPackages(packages.packages);
        },
        error: function (xhr, status, error) {
            console.error('Error loading packages:', error);
            $('#packages-container').html('<div class="alert alert-danger">Error loading packages</div>');
        }
    });
}

/**
 * Display packages in the UI
 * @param {Array} packages - Array of package objects
 */
function displayPackages(packages) {

    const container = $('#packages-container');

    if (packages.length === 0) {
        container.html('<div class="alert alert-info">0 packages found for this company.</div>');
        return;
    }

    let html = '<div class="table-responsive"><table class="table table-striped table-hover">';
    html += '<thead class="table-dark"><tr>';
    html += '<th>Package ID</th><th>SKU</th><th>Package Name</th>';
    html += '<th>Customer ID</th><th>Creation Date</th><th>ETA</th><th>Status</th><th></th>';
    html += '</tr></thead><tbody>';

    packages.forEach(pkg => {

        const creation_date = new Date(pkg.creation_date).toLocaleString();
        const eta_date = new Date(pkg.eta).toLocaleString();

        html += `<tr>
            <td>
                <button class="btn btn-link" onclick="showPackageRoute('${pkg._id}')">
                    ${pkg._id}
                </button>
            </td>
            <td>${pkg.sku}</td>
            <td>${pkg.package_name}</td>
            <td>
                <button class="btn btn-link" onclick="showCustomerDetails('${pkg.customer_id._id}', '${pkg.customer_id.customer_name}', '${pkg.customer_id.customer_email}', '${pkg.customer_id.customer_address}')">
                    ${pkg.customer_id._id}
                </button>
            </td>
            <td>${creation_date}</td>
            <td>${eta_date}</td>
            <td>${pkg.status}</td>
            <td>
                <button class="btn btn-sm btn-success" onclick="showAddLocationModal('${pkg._id}')">Add Location</button>
                <button class="btn btn-sm btn-primary" onclick="showPackageRoute('${pkg._id}')">Show Route</button>
                <button class="btn btn-sm btn-primary me-1" onclick="showEditPackageModal('${pkg._id}', '${pkg.eta}', '${pkg.status}')">Edit Status</button>
            </td>
        </tr>`;
    });

    html += '</tbody></table></div>';
    container.html(html);
}


/**
 * Get Bootstrap color class for package status
 * @param {string} status - Package status
 * @returns {string} Bootstrap color class
 */
function getStatusColor(status) {
    switch (status.toLowerCase().trim()) {
        case 'packed': return 'secondary';
        case 'shipped': return 'info';
        case 'intransit': return 'warning';
        case 'delivered': return 'success';
        default: return 'light';
    }
}

/**
 * Show add package modal
 */
async function showAddPackageModal() {
    $('#addPackageModal').modal('show');

    $('#companyId').val(currentCompanyId);


    const response = await fetch('/api/customers');

    if (!response.ok) {
        // If response is not OK (e.g., 404, 500), throw an error
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        throw new Error(`HTTP error! Status: ${response.status}, Message: ${errorData.message || 'Failed to fetch customers'}`);
    }

    const customers = await response.json();

    $('#customerId').attr("disabled", false);
    $('#customerId').children().first().remove();

    $('#customerId').append(`<option value="">Select Customer</option>`);

    customers.forEach((customer) => {

        $('#customerId').append(`<option value="${customer._id}">${customer.customer_name} [${customer.customer_email}]</option>`);
    });
}


/**
 * Add new package
 */
function addPackage() {

    // JQuery Validate
    if (!$('#addPackageForm').valid()) {
        return;
    }

    const formData = {
        sku: $('#sku').val(),
        package_name: $('#packageName').val(),
        eta: new Date($('#eta').val()),
        company_id: $('#companyId').val(),
        customer_id: $('#customerId').val(),
        status: $('#status').val()
    };

    $.ajax({
        url: '/api/packages',
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(formData),
        success: function (response) {
            $('#addPackageModal').modal('hide');
            $('#addPackageForm')[0].reset();
            alert('Package created successfully!');
            loadPackages(); // Reload packages
        },
        error: function (xhr, status, error) {
            console.error('Error creating package:', error);
            const errorMsg = xhr.responseJSON ? xhr.responseJSON.error : 'Error creating package';
            alert('Error: ' + errorMsg);
        }
    });
}


/**
 * Show edit package modal
 * @param {string} packageId - Package ID to edit
 */
function showEditPackageModal(packageId, eta, status) {

    $('#editPackageId').val(packageId);
    var etaDate = new Date(eta);
    $('#editEta').val(etaDate.toISOString().substring(0, 23));
    $('#editStatus').val(status);
    $('#editPackageModal').modal('show');
}


/**
 * Update package
 */
function updatePackage() {

    // JQuery Validate
    if (!$('#editPackageForm').valid()) {
        return;
    }

    const packageId = $('#editPackageId').val();
    const updateData = {
        eta: new Date($('#editEta').val()),
        status: $('#editStatus').val()
    };

    $.ajax({
        url: `/api/packages/${packageId}`,
        method: 'PUT',
        contentType: 'application/json',
        data: JSON.stringify(updateData),
        success: function (response) {
            $('#editPackageModal').modal('hide');
            alert('Package updated successfully!');
            loadPackages(); // Reload packages
        },
        error: function (xhr, status, error) {
            console.error('Error updating package:', error);
            const errorMsg = xhr.responseJSON ? xhr.responseJSON.error : 'Error updating package';
            alert('Error: ' + errorMsg);
        }
    });
}


/**
 * Show add location modal
 * @param {string} packageId - Package ID to add location to
 */
function showAddLocationModal(packageId) {
    $('#locationPackageId').val(packageId);
    $('#locationQuery').val('');
    $('#searchResults').html('');
    $('#addLocationModal').modal('show');
}


/**
 * Search for location using LocationIQ
 */
function searchLocation() {
    const query = $('#locationQuery').val().trim();
    if (!query) {
        alert('Please enter a location to search');
        return;
    }

    $.ajax({
        url: `/api/search-location?q=${encodeURIComponent(query)}`,
        method: 'GET',
        success: function (results) {
            displaySearchResults(results);
        },
        error: function (xhr, status, error) {
            console.error('Error searching location:', error);
            $('#searchResults').html('<div class="alert alert-danger">Error searching location</div>');
        }
    });
}


/**
 * Display location search results
 * @param {Array} results - Search results from LocationIQ
 */
function displaySearchResults(results) {
    const container = $('#searchResults');

    if (results.length === 0) {
        container.html('<div class="alert alert-warning">No locations found. Please try a different search.</div>');
        return;
    }

    let html = '<div class="list-group">';
    results.forEach((result, index) => {
        html += `<button type="button" class="list-group-item list-group-item-action" 
                 onclick="addLocationToPackage(${result.lat}, ${result.lon})">
                 ${result.display_name}
                 </button>`;
    });
    html += '</div>';

    container.html(html);
}


/**
 * Add selected location to package
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 */
function addLocationToPackage(lat, lon) {
    const packageId = $('#locationPackageId').val();

    $.ajax({
        url: `/api/packages/${packageId}/location`,
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({ lat: lat, lon: lon }),
        success: function (response) {
            $('#addLocationModal').modal('hide');
            alert(`Location added to package route successfully!`);
        },
        error: function (xhr, status, error) {
            console.error('Error adding location:', error);
            const errorMsg = xhr.responseJSON ? xhr.responseJSON.error : 'Error adding location';
            alert('Error: ' + errorMsg);
        }
    });
}


/**
 * Show customer details modal
 * @param {string} packageId - Package ID to show customer for
 */
function showCustomerDetails(id, name, email, address) {

    $('#customerDetails').html(`
        <div class="customer-details">
            <p><strong>Customer ID:</strong> ${id}</p>
            <p><strong>Customer Name:</strong> ${name}</p>
            <p><strong>Customer Email:</strong> ${email}</p>
            <p><strong>Customer Address:</strong> ${address}</p>
        </div>
    `);

    $('#customerModal').modal('show');
}


/**
 * Show package route on map
 * @param {string} packageId - Package ID to show route for
 */
function showPackageRoute(packageId) {

    // Display loading
    $('#mapContainer').html(`<img src="../loading.gif" alt="Package Route Map" class="img-fluid" style="object-fit: cover;">`);
    $('#mapModal').modal('show');

    $.ajax({
        url: `/api/get-route?package_id=${packageId}`,
        method: 'GET',
        xhrFields: {
            responseType: 'arraybuffer'
        },
        success: function (data) {
            // Convert the ArrayBuffer to a Blob
            const blob = new Blob([data], { type: 'image/jpeg' });

            // Create a URL for the Blob
            const imageUrl = URL.createObjectURL(blob);

            // Display map
            $('#mapContainer').html(`<img src="${imageUrl}" alt="Package Route Map" class="img-fluid" style="object-fit: cover;">`);
        },
        error: function (xhr, status, error) {

            console.error('Error loading package route:', error);
            $('#mapContainer').html(`<div class="text-danger"><h1>No route exists yet for this package</h1></div>`);
        }
    });
}
