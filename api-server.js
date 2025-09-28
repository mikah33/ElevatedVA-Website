const express = require('express');
const cors = require('cors');
const app = express();

// Enable CORS for all origins
app.use(cors());
app.use(express.json());

// IMPORTANT: In production, store this in environment variables
const STRIPE_SECRET_KEY = 'YOUR_STRIPE_SECRET_KEY'; // You need to add your Stripe secret key here

// Initialize Stripe
const stripe = require('stripe')(STRIPE_SECRET_KEY);

// Endpoint to get billing history for a customer
app.post('/api/billing-history', async (req, res) => {
    try {
        const { customerId } = req.body;

        if (!customerId) {
            return res.status(400).json({ error: 'Customer ID required' });
        }

        // Fetch invoices from Stripe
        const invoices = await stripe.invoices.list({
            customer: customerId,
            limit: 10 // Get last 10 invoices
        });

        // Format the billing history
        const billingHistory = invoices.data.map(invoice => ({
            id: invoice.id,
            amount: (invoice.amount_paid / 100).toFixed(2), // Convert cents to dollars
            currency: invoice.currency.toUpperCase(),
            status: invoice.status,
            paid: invoice.paid,
            date: new Date(invoice.created * 1000).toLocaleDateString(),
            description: invoice.description || 'Monthly Subscription',
            invoice_pdf: invoice.invoice_pdf,
            hosted_invoice_url: invoice.hosted_invoice_url
        }));

        res.json({ success: true, billingHistory });
    } catch (error) {
        console.error('Error fetching billing history:', error);
        res.status(500).json({ error: 'Failed to fetch billing history' });
    }
});

// Endpoint to create Stripe customer portal session
app.post('/api/customer-portal', async (req, res) => {
    try {
        const { customerId } = req.body;

        if (!customerId) {
            return res.status(400).json({ error: 'Customer ID required' });
        }

        const session = await stripe.billingPortal.sessions.create({
            customer: customerId,
            return_url: 'http://localhost:8080'
        });

        res.json({ success: true, url: session.url });
    } catch (error) {
        console.error('Error creating portal session:', error);
        res.status(500).json({ error: 'Failed to create portal session' });
    }
});

const PORT = 3001;
app.listen(PORT, () => {
    console.log(`API server running on http://localhost:${PORT}`);
});