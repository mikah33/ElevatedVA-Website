// Initialize Supabase with correct keys
const SUPABASE_URL = 'https://csarhyiqmprbnvfosmde.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNzYXJoeWlxbXByYm52Zm9zbWRlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc2NTg3MTcsImV4cCI6MjA3MzIzNDcxN30.pOY3o5OQldoJZwlAOe1BSrYQfzy_9HVAQRgjVBnXxJM';

const { createClient } = supabase;
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Initialize Stripe
const STRIPE_PUBLISHABLE_KEY = 'pk_live_51Rq06lGcGCTrlHr7lRH4GimAEl9q0KXyhALAbzGud2iM4oB40AJXEk19hcrnbQORQE5NTjaPUtSN7s45Bfe9GLkr00KMvPQjvZ';

// Stripe Product and Price IDs
const STRIPE_PRODUCT_ID = 'prod_T3uSB5rD13vE92';
const STRIPE_PRICES = {
    monthly: 'price_1S7mdBGcGCTrlHr7HtTPBbs8',  // Main monthly price
    option2: 'price_1S7mdBGcGCTrlHr7oLvGnWP9',  // Alternative price option
    option3: 'price_1S7mdBGcGCTrlHr7Mnzsbqmu'   // Alternative price option
};
let stripe = null;
let elements = null;
let cardElement = null;

// Initialize Stripe when needed
function initializeStripe() {
    if (!stripe && typeof Stripe !== 'undefined') {
        stripe = Stripe(STRIPE_PUBLISHABLE_KEY);
        elements = stripe.elements({
            appearance: {
                theme: 'night',
                variables: {
                    colorPrimary: '#7c3aed',
                    colorBackground: 'rgba(124, 58, 237, 0.05)',
                    colorText: '#ffffff',
                    colorDanger: '#ef4444',
                    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                    spacingUnit: '4px',
                    borderRadius: '10px'
                }
            }
        });
    }
}

let currentAuthMode = 'signin';
let currentUser = null;

// Countdown Timer Function
function startCountdown() {
    // Set the target date to 20 days from now
    const now = new Date();
    const targetDate = new Date(now.getTime() + (20 * 24 * 60 * 60 * 1000)); // 20 days from now

    // Store target date in localStorage for consistency across page reloads
    if (!localStorage.getItem('countdownTarget')) {
        localStorage.setItem('countdownTarget', targetDate.getTime());
    }

    // Get the stored target date
    const storedTarget = parseInt(localStorage.getItem('countdownTarget'));
    const countDownDate = new Date(storedTarget);

    // Update the countdown every 1 second
    const timer = setInterval(function() {
        const now = new Date().getTime();
        const distance = countDownDate - now;

        // Time calculations for days, hours, minutes and seconds
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        // Update the display if elements exist
        if (document.getElementById('days')) {
            document.getElementById('days').textContent = days.toString().padStart(2, '0');
            document.getElementById('hours').textContent = hours.toString().padStart(2, '0');
            document.getElementById('minutes').textContent = minutes.toString().padStart(2, '0');
            document.getElementById('seconds').textContent = seconds.toString().padStart(2, '0');
        }

        // If the countdown is finished, display a message
        if (distance < 0) {
            clearInterval(timer);
            const countdownTimer = document.querySelector('.countdown-timer');
            if (countdownTimer) {
                countdownTimer.innerHTML = '<h3 style="color: var(--primary-light);">🚀 App is Live!</h3>';
                document.querySelector('.countdown-subtitle').textContent = 'Download now from the App Store and Google Play!';
            }
        }
    }, 1000);
}

// Stripe Payment Variables
let paymentElement = null;
let stripeElements = null;

// Open Stripe Checkout Modal
async function openStripeCheckout() {
    // Use embedded checkout to keep users on your site
    await openEmbeddedCheckout();
}

// Redirect to Stripe Checkout (Simple approach - uses your webhooks)
async function redirectToStripeCheckout() {
    try {
        if (!stripe) {
            stripe = Stripe(STRIPE_PUBLISHABLE_KEY);
        }

        // Create checkout session directly from client
        // This will redirect to Stripe's hosted checkout page
        const { error } = await stripe.redirectToCheckout({
            lineItems: [{
                price: STRIPE_PRICES.monthly, // Your monthly price ID
                quantity: 1
            }],
            mode: 'subscription',
            successUrl: window.location.origin + '?success=true',
            cancelUrl: window.location.origin + '?canceled=true',
            customerEmail: currentUser ? currentUser.email : undefined,
        });

        if (error) {
            console.error('Stripe checkout error:', error);
            alert('Error: ' + error.message);
        }
    } catch (err) {
        console.error('Error opening checkout:', err);
        alert('Unable to open checkout. Please try again.');
    }
}

// Open embedded checkout (keeps users on your site)
async function openEmbeddedCheckout() {
    const modal = document.getElementById('stripeCheckoutModal');
    modal.style.display = 'block';

    // Initialize embedded payment form
    await initializeEmbeddedPayment();
}

// Close Stripe Checkout Modal
function closeCheckoutModal() {
    const modal = document.getElementById('stripeCheckoutModal');
    modal.style.display = 'none';

    // Clean up if payment element exists
    if (paymentElement) {
        paymentElement.unmount();
        paymentElement = null;
    }
}

// Initialize Embedded Payment
async function initializeEmbeddedPayment() {
    try {
        if (!stripe) {
            stripe = Stripe(STRIPE_PUBLISHABLE_KEY);
        }

        // For embedded payments without a backend, we'll use Stripe's Payment Element
        // with a client-only integration

        // Create elements with subscription mode
        if (!elements) {
            elements = stripe.elements({
                mode: 'subscription',
                amount: 3999, // $39.99 in cents
                currency: 'usd',
                appearance: {
                    theme: 'night',
                    variables: {
                        colorPrimary: '#7c3aed',
                        colorBackground: 'transparent',
                        colorText: '#ffffff',
                        colorDanger: '#ef4444',
                        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                        spacingUnit: '4px',
                        borderRadius: '10px'
                    }
                }
            });
        }

        // Create and mount payment element
        if (!paymentElement) {
            paymentElement = elements.create('payment', {
                layout: 'tabs',
                defaultValues: {
                    billingDetails: {
                        email: currentUser?.email
                    }
                }
            });
            paymentElement.mount('#payment-element');
        }

        // Handle form submission
        const form = document.getElementById('payment-form');
        form.onsubmit = handleEmbeddedPaymentSubmit;

    } catch (error) {
        console.error('Error initializing embedded payment:', error);
        // Fallback to redirect checkout
        closeCheckoutModal();
        await redirectToStripeCheckout();
    }
}

// Handle embedded payment form submission
async function handleEmbeddedPaymentSubmit(e) {
    e.preventDefault();

    const submitBtn = document.getElementById('submit-payment');
    submitBtn.disabled = true;
    document.getElementById('button-text').style.display = 'none';
    document.getElementById('spinner').style.display = 'inline';

    try {
        // For subscription without backend, we need to use confirmSetup
        const { error } = await stripe.confirmSetup({
            elements,
            confirmParams: {
                return_url: window.location.origin + '?success=true',
            },
        });

        if (error) {
            // Show error message
            const messageContainer = document.getElementById('payment-message');
            if (error.type === 'card_error' || error.type === 'validation_error') {
                messageContainer.textContent = error.message;
            } else {
                messageContainer.textContent = 'An unexpected error occurred.';
            }
        }
    } catch (err) {
        console.error('Payment error:', err);
        document.getElementById('payment-message').textContent = 'Payment failed. Please try again.';
    } finally {
        submitBtn.disabled = false;
        document.getElementById('button-text').style.display = 'inline';
        document.getElementById('spinner').style.display = 'none';
    }
}


// Check authentication status on load
window.addEventListener('DOMContentLoaded', async () => {
    // Start the countdown timer
    startCountdown();

    // Check if returning from Stripe Checkout
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('success') === 'true') {
        // Payment successful - webhook will handle subscription update
        alert('🎉 Payment successful! Your subscription is being activated.');

        // Track conversion
        if (typeof fbq !== 'undefined') {
            fbq('track', 'Purchase', {
                value: 39.99,
                currency: 'USD',
                content_name: 'Monthly Subscription',
                content_type: 'product'
            });
        }

        // Clear the URL parameters
        window.history.replaceState({}, '', window.location.pathname);
    } else if (urlParams.get('canceled') === 'true') {
        // Payment canceled
        alert('Payment canceled. You can subscribe anytime!');

        // Clear the URL parameters
        window.history.replaceState({}, '', window.location.pathname);
    }

    // Check for existing session
    const { data: { session } } = await supabaseClient.auth.getSession();
    if (session) {
        currentUser = session.user;
        updateUIForAuthenticatedUser();
    }

    // Listen for auth changes
    supabaseClient.auth.onAuthStateChange((event, session) => {
        if (event === 'SIGNED_IN') {
            currentUser = session.user;
            updateUIForAuthenticatedUser();
            closeAuthModal();
        } else if (event === 'SIGNED_OUT') {
            currentUser = null;
            updateUIForUnauthenticatedUser();
        }
    });

    // Initialize hamburger menu
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('navMenu');

    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
    });

    // Close mobile menu when clicking a link
    document.querySelectorAll('.nav-menu a').forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
        });
    });

    // Handle auth form submission
    document.getElementById('authForm').addEventListener('submit', handleAuthSubmit);
});

// Auth Modal Functions
function openAuthModal(mode) {
    currentAuthMode = mode;
    const modal = document.getElementById('authModal');
    const title = document.getElementById('authTitle');
    const subtitle = document.getElementById('authSubtitle');
    const nameGroup = document.getElementById('nameGroup');
    const switchText = document.getElementById('authSwitchText');
    const switchLink = document.getElementById('authSwitchLink');

    if (mode === 'signup') {
        title.textContent = 'Create Account';
        subtitle.textContent = 'Get started with ElevatedVA today';
        nameGroup.style.display = 'block';
        switchText.textContent = 'Already have an account?';
        switchLink.textContent = 'Sign in';
    } else {
        title.textContent = 'Welcome Back';
        subtitle.textContent = 'Access your account on web or mobile';
        nameGroup.style.display = 'none';
        switchText.textContent = "Don't have an account?";
        switchLink.textContent = 'Sign up';
    }

    modal.style.display = 'block';
    // Reset form
    document.getElementById('authForm').reset();
}

function closeAuthModal() {
    document.getElementById('authModal').style.display = 'none';
}

function toggleAuthMode() {
    const newMode = currentAuthMode === 'signin' ? 'signup' : 'signin';
    openAuthModal(newMode);
}

// Handle Auth Form Submission
async function handleAuthSubmit(e) {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const fullName = document.getElementById('fullName').value;

    try {
        let result;

        if (currentAuthMode === 'signup') {
            // Sign up new user
            const { data, error } = await supabaseClient.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: fullName,
                        app_source: 'web'
                    },
                    emailRedirectTo: window.location.origin
                }
            });

            if (error) throw error;

            // Create profile in database
            if (data?.user) {
                const { error: profileError } = await supabaseClient
                    .from('profiles')
                    .insert({
                        id: data.user.id,
                        full_name: fullName,
                        email: email,
                        app_source: 'web'
                    });

                if (profileError) console.error('Profile creation error:', profileError);
            }

            // Track signup conversion
            if (typeof fbq !== 'undefined') {
                fbq('track', 'CompleteRegistration');
            }
            alert('Account created successfully! You can now sign in.');
            toggleAuthMode(); // Switch to sign in mode
        } else {
            // Sign in existing user
            const { data, error } = await supabaseClient.auth.signInWithPassword({
                email,
                password
            });

            if (error) throw error;

            // Check for existing Stripe subscription
            if (data?.user) {
                const { data: subscription } = await supabaseClient
                    .from('subscriptions')
                    .select('*')
                    .eq('user_id', data.user.id)
                    .eq('status', 'active')
                    .single();

                if (subscription) {
                    currentUser.hasActiveSubscription = true;
                }
            }

            // Successful sign in - the auth state change listener will handle UI updates
        }
    } catch (error) {
        console.error('Auth error:', error);
        alert(error.message || 'An error occurred. Please try again.');
    }
}

// Google Sign In
async function signInWithGoogle() {
    try {
        const { data, error } = await supabaseClient.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: window.location.origin,
                queryParams: {
                    access_type: 'offline',
                    prompt: 'consent'
                }
            }
        });

        if (error) throw error;
    } catch (error) {
        console.error('Google sign in error:', error);
        alert('Failed to sign in with Google. Please try again.');
    }
}

// Account Modal Functions
async function openAccountModal() {
    if (!currentUser) {
        openAuthModal('signin');
        return;
    }

    const modal = document.getElementById('accountModal');
    const userEmail = document.getElementById('userEmail');
    const subscriptionStatus = document.getElementById('subscriptionStatus');

    userEmail.textContent = currentUser.email;

    console.log('Current user ID:', currentUser.id);
    console.log('Checking subscription for user:', currentUser.email);

    // Check subscription status in profiles table (where your actual data is)
    const { data: profile, error } = await supabaseClient
        .from('profiles')
        .select('*')
        .eq('id', currentUser.id)
        .maybeSingle();

    console.log('Profile query result:', profile);
    console.log('Profile query error:', error);

    // Check if user has active subscription
    const hasActiveSubscription = profile?.subscription_status === 'active';

    if (hasActiveSubscription) {
        subscriptionStatus.textContent = `Active - ${profile.subscription_plan || 'Professional'} Plan`;

        // Show active subscription view
        const activeView = document.getElementById('activeSubscriptionView');
        const noSubView = document.getElementById('noSubscriptionView');
        if (activeView) activeView.style.display = 'block';
        if (noSubView) noSubView.style.display = 'none';

        // Hide subscribe button if it exists
        const subscribeBtn = document.querySelector('.subscribe-button');
        if (subscribeBtn) subscribeBtn.style.display = 'none';

        // Show subscription details section
        const detailsSection = document.getElementById('subscriptionDetailsSection');
        if (detailsSection) detailsSection.style.display = 'grid';

        // Update embedded subscription details
        const planNameEl = document.getElementById('planName');
        if (planNameEl) planNameEl.textContent = profile.subscription_plan || 'Monthly';

        const planAmountEl = document.getElementById('planAmount');
        if (planAmountEl) planAmountEl.textContent = '$39.99/mo';

        const planStatusEl = document.getElementById('planStatus');
        if (planStatusEl) planStatusEl.textContent = 'Active';

        const customerIdEl = document.getElementById('stripeCustomerId');
        if (customerIdEl && profile.stripe_customer_id) {
            customerIdEl.textContent = profile.stripe_customer_id;
        }

        // Show customer since date
        if (profile.current_period_start) {
            const customerSince = new Date(profile.current_period_start);
            const customerSinceEl = document.getElementById('customerSince');
            if (customerSinceEl) {
                customerSinceEl.textContent = customerSince.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
            }
        }

        // Show next billing date
        if (profile.current_period_end) {
            const nextBilling = new Date(profile.current_period_end);
            const formattedDate = nextBilling.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

            // Update multiple elements that show next billing
            const nextBillingEl = document.getElementById('nextBillingDate');
            if (nextBillingEl) nextBillingEl.textContent = formattedDate;

            const nextBillingDisplay = document.getElementById('nextBillingDisplay');
            if (nextBillingDisplay) {
                nextBillingDisplay.textContent = nextBilling.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            }

            const nextBillingEl2 = document.getElementById('nextBilling');
            if (nextBillingEl2) nextBillingEl2.textContent = formattedDate;
        }
    } else {
        subscriptionStatus.textContent = 'Not Subscribed';

        // Show no subscription view
        const activeView = document.getElementById('activeSubscriptionView');
        const noSubView = document.getElementById('noSubscriptionView');
        if (activeView) activeView.style.display = 'none';
        if (noSubView) noSubView.style.display = 'block';

        // Show subscribe button
        const subscribeBtn = document.querySelector('.subscribe-button');
        if (subscribeBtn) {
            subscribeBtn.textContent = 'Subscribe Now';
            subscribeBtn.style.display = 'block';
        }

        // Hide subscription details
        const detailsSection = document.getElementById('subscriptionDetailsSection');
        if (detailsSection) detailsSection.style.display = 'none';
    }

    modal.style.display = 'block';
}

function closeAccountModal() {
    document.getElementById('accountModal').style.display = 'none';
}

// Handle Logout
async function handleLogout() {
    try {
        const { error } = await supabaseClient.auth.signOut();
        if (error) throw error;

        window.location.reload();
    } catch (error) {
        console.error('Logout error:', error);
        alert('Failed to log out. Please try again.');
    }
}

// Subscribe function (alias for compatibility)
async function subscribe() {
    await handleSubscribe();
}

// Quick subscribe from hero section
async function handleQuickSubscribe() {
    if (!currentUser) {
        // Not logged in - open signup modal
        openAuthModal('signup');
    } else {
        // Already logged in - go straight to checkout
        await handleSubscribe();
    }
}

// Handle Subscription
async function handleSubscribe() {
    if (!currentUser) {
        alert('Please sign in to subscribe');
        openAuthModal('signin');
        return;
    }

    // Track subscription initiation
    if (typeof fbq !== 'undefined') {
        fbq('track', 'InitiateCheckout', {
            value: 39.99,
            currency: 'USD',
            content_name: 'Monthly Subscription',
            content_type: 'product'
        });
    }

    // Open the embedded Stripe checkout modal
    openStripeCheckout();

    // You can store subscription status in Supabase
    // const { data, error } = await supabaseClient
    //     .from('subscriptions')
    //     .insert({
    //         user_id: currentUser.id,
    //         plan: 'professional',
    //         status: 'active'
    //     });
}

// UI Update Functions
async function updateUIForAuthenticatedUser() {
    // Show account menu items
    document.getElementById('accountMenu').style.display = 'block';
    document.getElementById('logoutMenu').style.display = 'block';

    // Hide sign in/up buttons
    const navMenu = document.getElementById('navMenu');
    const signInLinks = navMenu.querySelectorAll('a[onclick*="signin"], a[onclick*="signup"]');
    signInLinks.forEach(link => {
        if (link.parentElement.id !== 'subscribeMenu') {
            link.parentElement.style.display = 'none';
        }
    });

    // Check subscription status to show/hide subscribe button
    try {
        const { data: profile } = await supabaseClient
            .from('profiles')
            .select('subscription_status')
            .eq('id', currentUser.id)
            .single();

        const subscribeMenu = document.getElementById('subscribeMenu');
        if (subscribeMenu) {
            // Show subscribe button only if not subscribed
            subscribeMenu.style.display = profile?.subscription_status === 'active' ? 'none' : 'block';
        }
    } catch (error) {
        console.error('Error checking subscription:', error);
        // Show subscribe button by default if there's an error
        const subscribeMenu = document.getElementById('subscribeMenu');
        if (subscribeMenu) subscribeMenu.style.display = 'block';
    }

    // Update hero CTA based on subscription status
    const heroCTA = document.querySelector('.hero-buttons .primary-button');
    if (heroCTA) {
        // Check if user has active subscription
        try {
            const { data: profile } = await supabaseClient
                .from('profiles')
                .select('subscription_status')
                .eq('id', currentUser.id)
                .single();

            if (profile?.subscription_status === 'active') {
                // User is subscribed - show dashboard
                heroCTA.innerHTML = '📊 Go to Dashboard';
                heroCTA.onclick = () => openAccountModal();
            } else {
                // User is not subscribed - show subscribe button
                heroCTA.innerHTML = '🚀 Start Now - $39.99/mo';
                heroCTA.onclick = () => handleSubscribe();
            }
        } catch (error) {
            // Default to subscribe if we can't check
            heroCTA.innerHTML = '🚀 Start Now - $39.99/mo';
            heroCTA.onclick = () => handleSubscribe();
        }
    }
}

function updateUIForUnauthenticatedUser() {
    // Hide account menu items
    document.getElementById('accountMenu').style.display = 'none';
    document.getElementById('logoutMenu').style.display = 'none';

    // Show sign in/up buttons
    const navMenu = document.getElementById('navMenu');
    const signInLinks = navMenu.querySelectorAll('a[onclick*="signin"], a[onclick*="signup"]');
    signInLinks.forEach(link => {
        link.parentElement.style.display = 'block';
    });
}

// Utility Functions
function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.scrollIntoView({ behavior: 'smooth' });
    }
}

// Billing Management Functions
async function viewBillingHistory() {
    // Hide main subscription section and show billing history
    document.querySelector('.subscription-section').style.display = 'none';
    document.getElementById('billingHistory').style.display = 'block';

    const billingList = document.getElementById('billingHistoryList');

    // Show loading state
    billingList.innerHTML = `
        <div style="text-align: center; padding: 2rem; color: var(--text-secondary);">
            <p>Loading billing history...</p>
        </div>
    `;

    try {
        // Get the user's full profile with subscription data
        const { data: profile } = await supabaseClient
            .from('profiles')
            .select('*')
            .eq('id', currentUser.id)
            .single();

        if (profile?.stripe_customer_id && profile?.subscription_status === 'active') {
            // Show real subscription information from Supabase
            const currentDate = new Date();
            const endDate = profile.current_period_end ? new Date(profile.current_period_end) : null;
            const startDate = profile.current_period_start ? new Date(profile.current_period_start) : null;

            let subscriptionInfo = '';

            // Current subscription period
            if (startDate && endDate) {
                subscriptionInfo += `
                    <div class="billing-item">
                        <div>
                            <div class="billing-item-date">Current Billing Period</div>
                            <div style="color: var(--text-secondary);">
                                ${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}
                            </div>
                        </div>
                        <div style="display: flex; align-items: center; gap: 1rem;">
                            <span class="billing-item-amount">$39.99/mo</span>
                            <span class="billing-item-status paid">ACTIVE</span>
                        </div>
                    </div>
                `;
            }

            // Next billing date info
            if (endDate) {
                subscriptionInfo += `
                    <div style="margin-top: 1.5rem; padding: 1rem; background: var(--glass); border-radius: 10px; border: 1px solid var(--glass-border);">
                        <p style="color: var(--text-secondary); margin-bottom: 0.5rem;">Next billing date:</p>
                        <p style="color: var(--primary-light); font-size: 1.2rem; font-weight: 600;">
                            ${endDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                        </p>
                    </div>
                `;
            }

            subscriptionInfo += `
                <div style="text-align: center; margin-top: 2rem;">
                    <button class="secondary-action-button" onclick="openStripePortal('${profile.stripe_customer_id}')">
                        View Full Billing History in Stripe →
                    </button>
                    <p style="color: var(--text-secondary); font-size: 0.9rem; margin-top: 1rem;">
                        Access invoices, payment methods, and download receipts
                    </p>
                </div>
            `;

            billingList.innerHTML = subscriptionInfo;
        } else if (profile?.stripe_customer_id) {
            // Has Stripe customer but no active subscription
            billingList.innerHTML = `
                <div style="text-align: center; padding: 2rem;">
                    <p style="color: var(--text-secondary); margin-bottom: 1.5rem;">No active subscription</p>
                    <button class="secondary-action-button" onclick="openStripePortal('${profile.stripe_customer_id}')">
                        View Past Invoices in Stripe →
                    </button>
                </div>
            `;
        } else {
            // No Stripe customer ID
            billingList.innerHTML = `
                <div style="text-align: center; padding: 2rem; color: var(--text-secondary);">
                    <p>No billing history available</p>
                    <small>Your payment history will appear here once you have an active subscription</small>
                </div>
            `;
        }
    } catch (error) {
        console.error('Error fetching billing history:', error);
        billingList.innerHTML = `
            <div style="text-align: center; padding: 2rem; color: var(--text-secondary);">
                <p>Error loading billing history</p>
                <small>Please try again later</small>
            </div>
        `;
    }
}

// Open Stripe Customer Portal
async function openStripePortal(customerId) {
    // Your Stripe Customer Portal URL
    const STRIPE_PORTAL_URL = `https://billing.stripe.com/p/login/fZueVdesU0VEdymgoVffy00`;

    // Open the Stripe Customer Portal
    window.open(STRIPE_PORTAL_URL, '_blank');
}

function hideBillingHistory() {
    document.querySelector('.subscription-section').style.display = 'block';
    document.getElementById('billingHistory').style.display = 'none';
}

async function updatePaymentMethod() {
    try {
        // Hide other sections and show payment update
        document.querySelector('.subscription-section').style.display = 'none';
        document.getElementById('billingHistory').style.display = 'none';
        document.getElementById('paymentUpdate').style.display = 'block';

        // Initialize Stripe if not already done
        initializeStripe();

        // Create card element if it doesn't exist
        if (!cardElement && elements) {
            cardElement = elements.create('card', {
                style: {
                    base: {
                        fontSize: '16px',
                        color: '#ffffff',
                        '::placeholder': {
                            color: '#9ca3af'
                        }
                    }
                }
            });

            // Mount the card element
            cardElement.mount('#card-element');

            // Handle card errors
            cardElement.on('change', function(event) {
                const displayError = document.getElementById('card-errors');
                if (event.error) {
                    displayError.textContent = event.error.message;
                } else {
                    displayError.textContent = '';
                }
            });

            // Handle form submission
            document.getElementById('payment-form').addEventListener('submit', handlePaymentUpdate);
        }
    } catch (error) {
        console.error('Error setting up payment form:', error);
        // Fallback to Stripe Portal
        const { data: profile } = await supabaseClient
            .from('profiles')
            .select('stripe_customer_id')
            .eq('id', currentUser.id)
            .single();

        if (profile?.stripe_customer_id) {
            openStripePortal(profile.stripe_customer_id);
        }
    }
}

// Handle payment form submission
async function handlePaymentUpdate(event) {
    event.preventDefault();

    const updateButton = document.getElementById('updateCardButton');
    updateButton.disabled = true;
    updateButton.textContent = 'Updating...';

    // In production, you would:
    // 1. Create a SetupIntent on your backend
    // 2. Confirm the payment method with Stripe
    // 3. Update the customer's default payment method

    // For now, show a message
    alert('To complete payment update:\n\n1. Set up a backend endpoint to create SetupIntents\n2. Use stripe.confirmCardSetup() to save the card\n\nFor now, use the Stripe Portal for payment updates.');

    updateButton.disabled = false;
    updateButton.textContent = 'Update Card';

    // Open Stripe Portal as fallback
    const { data: profile } = await supabaseClient
        .from('profiles')
        .select('stripe_customer_id')
        .eq('id', currentUser.id)
        .single();

    if (profile?.stripe_customer_id) {
        openStripePortal(profile.stripe_customer_id);
    }
}

// Hide payment update form
function hidePaymentUpdate() {
    document.querySelector('.subscription-section').style.display = 'block';
    document.getElementById('paymentUpdate').style.display = 'none';
}

async function cancelSubscription() {
    const confirmCancel = confirm(
        'Are you sure you want to cancel your subscription?\n\n' +
        'You will continue to have access until the end of your current billing period.'
    );

    if (confirmCancel) {
        try {
            // Update subscription status in profiles table
            const { error } = await supabaseClient
                .from('profiles')
                .update({
                    subscription_status: 'canceled'
                })
                .eq('id', currentUser.id);

            if (error) throw error;

            alert('Your subscription has been canceled. You will continue to have access until the end of your billing period.');

            // Refresh the modal
            closeAccountModal();
            openAccountModal();
        } catch (error) {
            console.error('Cancel subscription error:', error);
            alert('Failed to cancel subscription. Please contact support.');
        }
    }
}

// Close modals when clicking outside
window.onclick = function(event) {
    const authModal = document.getElementById('authModal');
    const accountModal = document.getElementById('accountModal');

    if (event.target == authModal) {
        closeAuthModal();
    }
    if (event.target == accountModal) {
        closeAccountModal();
    }
}