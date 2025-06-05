
// Simulated blockchain storage
let products = [];
let productCounter = 0;

// Utility functions
function generateProductId() {
    productCounter++;
    return `SCT-${Date.now()}-${productCounter.toString().padStart(4, '0')}`;
}

function generateHash(data) {
    // Simplified hash function for demo
    let hash = 0;
    const str = JSON.stringify(data);
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return Math.abs(hash).toString(16);
}

function showAlert(elementId, message, isError = false) {
    const alert = document.getElementById(elementId);
    if (!alert) {
        console.error('Alert element not found:', elementId);
        return;
    }
    alert.textContent = message;
    alert.className = isError ? 'alert error' : 'alert';
    alert.style.display = 'block';

    // Auto-hide after 5 seconds
    setTimeout(() => {
        alert.style.display = 'none';
    }, 5000);
}

function updateStats() {
    const totalProducts = products.length;
    const activeShipments = products.filter(p =>
        p.currentStatus === 'shipped' || p.currentStatus === 'in-transit'
    ).length;
    const manufacturers = new Set(products.map(p => p.manufacturer)).size;
    const completedDeliveries = products.filter(p =>
        p.currentStatus === 'delivered'
    ).length;

    document.getElementById('totalProducts').textContent = totalProducts;
    document.getElementById('activeShipments').textContent = activeShipments;
    document.getElementById('totalManufacturers').textContent = manufacturers;
    document.getElementById('completedDeliveries').textContent = completedDeliveries;
}

// Product registration
document.getElementById('productForm').addEventListener('submit', function (e) {
    e.preventDefault();

    try {
        // Get form values
        const name = document.getElementById('productName').value.trim();
        const manufacturer = document.getElementById('manufacturer').value.trim();
        const type = document.getElementById('productType').value;
        const origin = document.getElementById('origin').value.trim();
        const description = document.getElementById('description').value.trim();

        // Validate required fields
        if (!name || !manufacturer || !type || !origin) {
            showAlert('registerAlert', 'Please fill in all required fields!', true);
            return;
        }

        const productData = {
            id: generateProductId(),
            name: name,
            manufacturer: manufacturer,
            type: type,
            origin: origin,
            description: description,
            registrationTime: new Date().toISOString(),
            currentStatus: 'manufactured',
            currentLocation: origin,
            timeline: [{
                status: 'manufactured',
                location: origin,
                handler: manufacturer,
                timestamp: new Date().toISOString(),
                notes: 'Product manufactured and registered'
            }]
        };

        // Generate blockchain hash
        productData.blockHash = generateHash(productData);

        products.push(productData);

        showAlert('registerAlert', `✅ Product registered successfully! ID: ${productData.id}`);
        this.reset();
        renderProducts();
        updateStats();

        console.log('Product registered:', productData);

    } catch (error) {
        console.error('Registration error:', error);
        showAlert('registerAlert', 'Registration failed. Please try again.', true);
    }
});

// Status update
document.getElementById('updateForm').addEventListener('submit', function (e) {
    e.preventDefault();

    const productId = document.getElementById('updateProductId').value;
    const newStatus = document.getElementById('newStatus').value;
    const location = document.getElementById('location').value;
    const handler = document.getElementById('handler').value;
    const notes = document.getElementById('notes').value;

    const product = products.find(p => p.id === productId);

    if (!product) {
        showAlert('updateAlert', 'Product not found!', true);
        return;
    }

    // Add to timeline
    product.timeline.push({
        status: newStatus,
        location: location,
        handler: handler,
        timestamp: new Date().toISOString(),
        notes: notes || 'Status updated'
    });

    // Update current status
    product.currentStatus = newStatus;
    product.currentLocation = location;
    product.lastUpdated = new Date().toISOString();

    // Regenerate hash for blockchain integrity
    product.blockHash = generateHash(product);

    showAlert('updateAlert', `Product ${productId} updated successfully!`);
    this.reset();
    renderProducts();
    updateStats();
});

function searchProducts() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const filteredProducts = searchTerm ?
        products.filter(p =>
            p.id.toLowerCase().includes(searchTerm) ||
            p.name.toLowerCase().includes(searchTerm) ||
            p.manufacturer.toLowerCase().includes(searchTerm)
        ) : products;

    renderProducts(filteredProducts);
}

function renderProducts(productsToRender = products) {
    const grid = document.getElementById('productGrid');

    if (productsToRender.length === 0) {
        grid.innerHTML = '<p style="text-align: center; color: #666; grid-column: 1 / -1;">No products found. Register your first product to get started!</p>';
        return;
    }

    grid.innerHTML = productsToRender.map(product => `
                <div class="product-card">
                    <div class="product-id">${product.id}</div>
                    <h3>${product.name}</h3>
                    <p><strong>Manufacturer:</strong> ${product.manufacturer}</p>
                    <p><strong>Type:</strong> ${product.type}</p>
                    <div class="product-status status-${product.currentStatus}">${product.currentStatus.toUpperCase()}</div>
                    <p><strong>Current Location:</strong> ${product.currentLocation}</p>
                    <p><strong>Block Hash:</strong> <code>${product.blockHash}</code></p>
                    
                    <div class="timeline">
                        <h4>Supply Chain Timeline</h4>
                        ${product.timeline.map(event => `
                            <div class="timeline-item">
                                <strong>${event.status.toUpperCase()}</strong> - ${event.location}<br>
                                <em>Handler: ${event.handler}</em><br>
                                <small>${new Date(event.timestamp).toLocaleString()}</small><br>
                                ${event.notes ? `<span style="color: #666;">${event.notes}</span>` : ''}
                            </div>
                        `).join('')}
                    </div>
                </div>
            `).join('');
}

// Initialize demo data
function initializeDemoData() {
    const demoProducts = [
        {
            id: 'SCT-1640995200000-0001',
            name: 'Organic Coffee Beans',
            manufacturer: 'Mountain Harvest Co.',
            type: 'food',
            origin: 'Colombia',
            description: 'Premium organic coffee beans',
            registrationTime: '2024-01-15T10:00:00Z',
            currentStatus: 'delivered',
            currentLocation: 'New York, USA',
            timeline: [
                {
                    status: 'manufactured',
                    location: 'Colombia',
                    handler: 'Mountain Harvest Co.',
                    timestamp: '2024-01-15T10:00:00Z',
                    notes: 'Coffee beans harvested and processed'
                },
                {
                    status: 'shipped',
                    location: 'Bogotá Port',
                    handler: 'Global Shipping Inc.',
                    timestamp: '2024-01-16T14:30:00Z',
                    notes: 'Shipped via cargo vessel'
                },
                {
                    status: 'delivered',
                    location: 'New York, USA',
                    handler: 'Premium Foods Distributor',
                    timestamp: '2024-01-28T09:15:00Z',
                    notes: 'Delivered to distributor warehouse'
                }
            ]
        },
        {
            id: 'SCT-1640995200000-0002',
            name: 'Smart Watch Pro',
            manufacturer: 'TechCorp',
            type: 'electronics',
            origin: 'Shenzhen, China',
            description: 'Advanced smartwatch with health monitoring',
            registrationTime: '2024-02-01T08:00:00Z',
            currentStatus: 'in-transit',
            currentLocation: 'Los Angeles Port',
            timeline: [
                {
                    status: 'manufactured',
                    location: 'Shenzhen, China',
                    handler: 'TechCorp',
                    timestamp: '2024-02-01T08:00:00Z',
                    notes: 'Manufacturing completed and quality tested'
                },
                {
                    status: 'shipped',
                    location: 'Shanghai Port',
                    handler: 'Ocean Freight Ltd.',
                    timestamp: '2024-02-05T16:20:00Z',
                    notes: 'Container loaded for trans-Pacific shipping'
                },
                {
                    status: 'in-transit',
                    location: 'Los Angeles Port',
                    handler: 'Pacific Logistics',
                    timestamp: '2024-02-18T11:45:00Z',
                    notes: 'Arrived at destination port, awaiting customs clearance'
                }
            ]
        }
    ];

    demoProducts.forEach(product => {
        product.blockHash = generateHash(product);
        products.push(product);
    });

    productCounter = 2;
    renderProducts();
    updateStats();
}

// Initialize the system and add event listeners
document.addEventListener('DOMContentLoaded', function () {
    initializeDemoData();

    // Add debugging for form submission
    const form = document.getElementById('productForm');
    if (form) {
        console.log('Product form found and ready');
    } else {
        console.error('Product form not found!');
    }
});

// Add search on enter key
document.getElementById('searchInput').addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        searchProducts();
    }
});
