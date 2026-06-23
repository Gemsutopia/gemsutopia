// Email templates for Gemsutopia
// All templates are HTML strings that can be sent via Resend

export interface OrderItem {
  name: string;
  price: number;
  quantity: number;
}

export interface ShippingAddress {
  firstName: string;
  lastName: string;
  address: string;
  apartment?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone?: string;
}

export interface OrderData {
  orderId: string;
  customerEmail: string;
  customerName: string;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  total: number;
  currency: string;
  shippingAddress?: ShippingAddress;
  paymentMethod?: string;
  trackingNumber?: string;
  trackingUrl?: string;
}

export interface AuctionData {
  auctionId: string;
  title: string;
  imageUrl?: string;
  currentBid: number;
  userBid: number;
  endTime: string;
  currency: string;
}

// Base email wrapper
function emailWrapper(content: string, previewText: string = ''): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <meta name="x-apple-disable-message-reformatting">
      <title>Gemsutopia</title>
      ${previewText ? `<span style="display:none;font-size:1px;color:#ffffff;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;">${previewText}</span>` : ''}
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background: #f5f5f5; }
        .container { max-width: 600px; margin: 0 auto; background: #ffffff; }
        .header { text-align: center; padding: 30px 20px; border-bottom: 3px solid #000; }
        .logo { font-size: 28px; font-weight: bold; color: #000; letter-spacing: 2px; }
        .content { padding: 30px 20px; }
        .footer { text-align: center; padding: 20px; background: #f8f9fa; color: #666; font-size: 14px; }
        .btn { display: inline-block; padding: 14px 28px; background: #000; color: #fff !important; text-decoration: none; font-weight: bold; border-radius: 4px; }
        .btn:hover { background: #333; }
        .highlight-box { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .success-box { background: #e8f5e8; border-left: 4px solid #28a745; padding: 15px; margin: 20px 0; }
        .warning-box { background: #fff3e0; border-left: 4px solid #ff9800; padding: 15px; margin: 20px 0; }
        .error-box { background: #ffebee; border-left: 4px solid #f44336; padding: 15px; margin: 20px 0; }
        .items-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        .items-table th, .items-table td { padding: 12px; text-align: left; border-bottom: 1px solid #eee; }
        .items-table th { background: #f8f9fa; font-weight: 600; }
        h1, h2, h3 { color: #000; margin-top: 0; }
        a { color: #000; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">GEMSUTOPIA</div>
          <p style="margin: 5px 0 0 0; color: #666; font-size: 14px;">Premium Ethically Sourced Gemstones</p>
        </div>
        <div class="content">
          ${content}
        </div>
        <div class="footer">
          <p><strong>Gemsutopia</strong></p>
          <p>Questions? <a href="mailto:gemsutopia@gmail.com">gemsutopia@gmail.com</a></p>
          <p style="font-size: 12px; color: #999; margin-top: 15px;">
            You received this email because you have an account with Gemsutopia or placed an order.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
}

// Format currency
function formatCurrency(amount: number, currency: string = 'CAD'): string {
  return `$${amount.toFixed(2)} ${currency}`;
}

// Format date
function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// ============================================================================
// ORDER EMAILS
// ============================================================================

export function orderConfirmationEmail(order: OrderData): string {
  const itemsHtml = order.items
    .map(
      item => `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #eee;">
          <strong>${item.name}</strong>
        </td>
        <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
        <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">${formatCurrency(item.price, order.currency)}</td>
        <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;"><strong>${formatCurrency(item.price * item.quantity, order.currency)}</strong></td>
      </tr>
    `
    )
    .join('');

  const shippingHtml = order.shippingAddress
    ? `
      <div style="margin-top: 20px;">
        <h3 style="margin-bottom: 10px;">Shipping Address</h3>
        <p style="margin: 0; color: #666;">
          ${order.shippingAddress.firstName} ${order.shippingAddress.lastName}<br>
          ${order.shippingAddress.address}<br>
          ${order.shippingAddress.apartment ? `${order.shippingAddress.apartment}<br>` : ''}
          ${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.zipCode}<br>
          ${order.shippingAddress.country}
          ${order.shippingAddress.phone ? `<br>Phone: ${order.shippingAddress.phone}` : ''}
        </p>
      </div>
    `
    : '';

  const content = `
    <h1>Order Confirmed!</h1>
    <p>Hi ${order.customerName},</p>
    <p>Thank you for your order! We've received your payment and will begin processing your order shortly.</p>

    <div class="success-box">
      <strong>Order #${order.orderId.slice(-8).toUpperCase()}</strong><br>
      Placed on ${formatDate(new Date())}
    </div>

    <h2>Order Details</h2>
    <table class="items-table">
      <thead>
        <tr>
          <th>Item</th>
          <th style="text-align: center;">Qty</th>
          <th style="text-align: right;">Price</th>
          <th style="text-align: right;">Total</th>
        </tr>
      </thead>
      <tbody>
        ${itemsHtml}
      </tbody>
    </table>

    <div class="highlight-box">
      <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
        <span>Subtotal:</span>
        <span>${formatCurrency(order.subtotal, order.currency)}</span>
      </div>
      <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
        <span>Shipping:</span>
        <span>${formatCurrency(order.shipping, order.currency)}</span>
      </div>
      <div style="display: flex; justify-content: space-between; padding-top: 12px; border-top: 2px solid #000; font-size: 18px; font-weight: bold;">
        <span>Total:</span>
        <span>${formatCurrency(order.total, order.currency)}</span>
      </div>
    </div>

    ${shippingHtml}

    <div style="margin-top: 30px; padding: 20px; background: #f0f7ff; border-radius: 8px;">
      <h3 style="margin-top: 0;">What's Next?</h3>
      <p style="margin-bottom: 0;">Your order will be carefully inspected, packaged, and shipped within 1-2 business days. You'll receive another email with tracking information once your gems are on their way!</p>
    </div>
  `;

  return emailWrapper(content, `Order #${order.orderId.slice(-8).toUpperCase()} confirmed!`);
}

export function orderReceivedAdminEmail(order: OrderData): string {
  const itemsList = order.items.map(item => `${item.quantity}x ${item.name} @ ${formatCurrency(item.price, order.currency)}`).join('<br>');

  const content = `
    <h1>New Order Received!</h1>

    <div class="success-box">
      <strong>Order #${order.orderId.slice(-8).toUpperCase()}</strong><br>
      Total: <strong>${formatCurrency(order.total, order.currency)}</strong>
    </div>

    <h2>Customer</h2>
    <p>
      <strong>${order.customerName}</strong><br>
      ${order.customerEmail}
    </p>

    ${order.shippingAddress ? `
    <h2>Ship To</h2>
    <p>
      ${order.shippingAddress.firstName} ${order.shippingAddress.lastName}<br>
      ${order.shippingAddress.address}<br>
      ${order.shippingAddress.apartment ? `${order.shippingAddress.apartment}<br>` : ''}
      ${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.zipCode}<br>
      ${order.shippingAddress.country}
      ${order.shippingAddress.phone ? `<br>Phone: ${order.shippingAddress.phone}` : ''}
    </p>
    ` : ''}

    <h2>Items</h2>
    <div class="highlight-box">
      ${itemsList}
      <hr style="margin: 15px 0; border: none; border-top: 1px solid #ddd;">
      <strong>Subtotal:</strong> ${formatCurrency(order.subtotal, order.currency)}<br>
      <strong>Shipping:</strong> ${formatCurrency(order.shipping, order.currency)}<br>
      <strong style="font-size: 18px;">Total: ${formatCurrency(order.total, order.currency)}</strong>
    </div>

    <p style="text-align: center; margin-top: 30px;">
      <a href="https://gemsutopia.ca/admin/dashboard" class="btn">View in Dashboard</a>
    </p>
  `;

  return emailWrapper(content, `New order from ${order.customerName} - ${formatCurrency(order.total, order.currency)}`);
}

export function shippingConfirmationEmail(order: OrderData): string {
  const content = `
    <h1>Your Order Has Shipped!</h1>
    <p>Hi ${order.customerName},</p>
    <p>Great news! Your order has been shipped and is on its way to you.</p>

    <div class="success-box">
      <strong>Order #${order.orderId.slice(-8).toUpperCase()}</strong>
    </div>

    ${order.trackingNumber ? `
    <div class="highlight-box">
      <h3 style="margin-top: 0;">Tracking Information</h3>
      <p style="font-size: 18px; margin: 10px 0;"><strong>${order.trackingNumber}</strong></p>
      ${order.trackingUrl ? `<a href="${order.trackingUrl}" class="btn">Track Package</a>` : ''}
    </div>
    ` : ''}

    ${order.shippingAddress ? `
    <h2>Shipping To</h2>
    <p style="color: #666;">
      ${order.shippingAddress.firstName} ${order.shippingAddress.lastName}<br>
      ${order.shippingAddress.address}<br>
      ${order.shippingAddress.apartment ? `${order.shippingAddress.apartment}<br>` : ''}
      ${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.zipCode}<br>
      ${order.shippingAddress.country}
    </p>
    ` : ''}

    <p style="color: #666;">Estimated delivery: 3-7 business days</p>
  `;

  return emailWrapper(content, `Your Gemsutopia order is on its way!`);
}

export function paymentFailedEmail(order: OrderData, reason?: string): string {
  const content = `
    <h1>Payment Issue</h1>
    <p>Hi ${order.customerName},</p>
    <p>We were unable to process your payment for Order #${order.orderId.slice(-8).toUpperCase()}.</p>

    <div class="error-box">
      <strong>Payment Failed</strong>
      ${reason ? `<br><span style="color: #666;">${reason}</span>` : ''}
    </div>

    <p>Your items are still in your cart. Please try again with a different payment method or contact your bank.</p>

    <p style="text-align: center; margin-top: 30px;">
      <a href="https://gemsutopia.ca/checkout" class="btn">Try Again</a>
    </p>

    <p style="color: #666; font-size: 14px;">If you continue to experience issues, please contact us at gemsutopia@gmail.com</p>
  `;

  return emailWrapper(content, `Payment issue with your Gemsutopia order`);
}

export function orderCancelledEmail(order: OrderData, reason?: string): string {
  const content = `
    <h1>Order Cancelled</h1>
    <p>Hi ${order.customerName},</p>
    <p>Your order #${order.orderId.slice(-8).toUpperCase()} has been cancelled.</p>

    <div class="warning-box">
      <strong>Order Cancelled</strong>
      ${reason ? `<br><span style="color: #666;">Reason: ${reason}</span>` : ''}
    </div>

    <p>If you were charged, a refund will be processed within 5-10 business days.</p>

    <p style="color: #666;">If you have any questions, please contact us at gemsutopia@gmail.com</p>
  `;

  return emailWrapper(content, `Order #${order.orderId.slice(-8).toUpperCase()} has been cancelled`);
}

export function refundProcessedEmail(order: OrderData, refundAmount: number): string {
  const content = `
    <h1>Refund Processed</h1>
    <p>Hi ${order.customerName},</p>
    <p>We've processed a refund for your order #${order.orderId.slice(-8).toUpperCase()}.</p>

    <div class="success-box">
      <strong>Refund Amount: ${formatCurrency(refundAmount, order.currency)}</strong>
    </div>

    <p>The refund should appear on your original payment method within 5-10 business days, depending on your bank.</p>

    <p style="color: #666;">If you have any questions, please contact us at gemsutopia@gmail.com</p>
  `;

  return emailWrapper(content, `Refund of ${formatCurrency(refundAmount, order.currency)} processed`);
}

// ============================================================================
// AUCTION EMAILS
// ============================================================================

export function bidConfirmationEmail(customerName: string, customerEmail: string, auction: AuctionData): string {
  const content = `
    <h1>Bid Placed Successfully!</h1>
    <p>Hi ${customerName},</p>
    <p>Your bid has been placed on <strong>${auction.title}</strong>.</p>

    <div class="success-box">
      <strong>Your Bid: ${formatCurrency(auction.userBid, auction.currency)}</strong>
    </div>

    <div class="highlight-box">
      <h3 style="margin-top: 0;">${auction.title}</h3>
      <p>
        <strong>Current High Bid:</strong> ${formatCurrency(auction.currentBid, auction.currency)}<br>
        <strong>Auction Ends:</strong> ${formatDate(auction.endTime)}
      </p>
    </div>

    <p style="text-align: center; margin-top: 30px;">
      <a href="https://gemsutopia.ca/auctions/${auction.auctionId}" class="btn">View Auction</a>
    </p>

    <p style="color: #666; font-size: 14px;">We'll notify you if you're outbid or when the auction ends.</p>
  `;

  return emailWrapper(content, `Bid of ${formatCurrency(auction.userBid, auction.currency)} placed on ${auction.title}`);
}

export function outbidNotificationEmail(customerName: string, customerEmail: string, auction: AuctionData): string {
  const content = `
    <h1>You've Been Outbid!</h1>
    <p>Hi ${customerName},</p>
    <p>Someone has placed a higher bid on <strong>${auction.title}</strong>.</p>

    <div class="warning-box">
      <strong>New High Bid: ${formatCurrency(auction.currentBid, auction.currency)}</strong><br>
      Your bid was: ${formatCurrency(auction.userBid, auction.currency)}
    </div>

    <div class="highlight-box">
      <h3 style="margin-top: 0;">${auction.title}</h3>
      <p>
        <strong>Auction Ends:</strong> ${formatDate(auction.endTime)}
      </p>
    </div>

    <p style="text-align: center; margin-top: 30px;">
      <a href="https://gemsutopia.ca/auctions/${auction.auctionId}" class="btn">Place New Bid</a>
    </p>

    <p style="color: #666; font-size: 14px;">Don't miss out on this gem!</p>
  `;

  return emailWrapper(content, `You've been outbid on ${auction.title}`);
}

export function auctionWonEmail(customerName: string, customerEmail: string, auction: AuctionData): string {
  const content = `
    <h1>Congratulations! You Won!</h1>
    <p>Hi ${customerName},</p>
    <p>You've won the auction for <strong>${auction.title}</strong>!</p>

    <div class="success-box">
      <strong>Winning Bid: ${formatCurrency(auction.userBid, auction.currency)}</strong>
    </div>

    <div class="highlight-box">
      <h3 style="margin-top: 0;">${auction.title}</h3>
      ${auction.imageUrl ? `<img src="${auction.imageUrl}" alt="${auction.title}" style="max-width: 200px; border-radius: 8px; margin: 10px 0;">` : ''}
    </div>

    <p>Please complete your purchase within 48 hours to claim your gem.</p>

    <p style="text-align: center; margin-top: 30px;">
      <a href="https://gemsutopia.ca/checkout?auction=${auction.auctionId}" class="btn">Complete Purchase</a>
    </p>

    <p style="color: #666; font-size: 14px;">If you have any questions, please contact us at gemsutopia@gmail.com</p>
  `;

  return emailWrapper(content, `You won ${auction.title}!`);
}

export function auctionEndedNoWinnerEmail(customerName: string, customerEmail: string, auction: AuctionData): string {
  const content = `
    <h1>Auction Ended</h1>
    <p>Hi ${customerName},</p>
    <p>The auction for <strong>${auction.title}</strong> has ended.</p>

    <div class="highlight-box">
      <p>Unfortunately, your bid of ${formatCurrency(auction.userBid, auction.currency)} did not win this time.</p>
      <p><strong>Winning Bid:</strong> ${formatCurrency(auction.currentBid, auction.currency)}</p>
    </div>

    <p>Don't worry - we have more auctions coming soon!</p>

    <p style="text-align: center; margin-top: 30px;">
      <a href="https://gemsutopia.ca/auctions" class="btn">View Active Auctions</a>
    </p>
  `;

  return emailWrapper(content, `Auction ended for ${auction.title}`);
}

// ============================================================================
// CONTACT & MISC EMAILS
// ============================================================================

export function contactFormConfirmationEmail(customerName: string, customerEmail: string, subject: string, message: string): string {
  const content = `
    <h1>We've Received Your Message</h1>
    <p>Hi ${customerName},</p>
    <p>Thank you for contacting Gemsutopia. We've received your message and will get back to you within 24-48 hours.</p>

    <div class="highlight-box">
      <h3 style="margin-top: 0;">Your Message</h3>
      <p><strong>Subject:</strong> ${subject}</p>
      <p style="white-space: pre-wrap; color: #666;">${message}</p>
    </div>

    <p style="color: #666; font-size: 14px;">If this is urgent, you can reach us directly at gemsutopia@gmail.com</p>
  `;

  return emailWrapper(content, `We received your message - ${subject}`);
}

export function contactFormAdminEmail(customerName: string, customerEmail: string, subject: string, message: string): string {
  const content = `
    <h1>New Contact Form Submission</h1>

    <div class="highlight-box">
      <p><strong>From:</strong> ${customerName} (${customerEmail})</p>
      <p><strong>Subject:</strong> ${subject}</p>
    </div>

    <h2>Message</h2>
    <div style="background: #fff; border: 1px solid #ddd; padding: 20px; border-radius: 8px; white-space: pre-wrap;">
${message}
    </div>

    <p style="margin-top: 20px;">
      <a href="mailto:${customerEmail}?subject=Re: ${encodeURIComponent(subject)}" class="btn">Reply to ${customerName}</a>
    </p>
  `;

  return emailWrapper(content, `Contact form: ${subject} from ${customerName}`);
}

// ============================================================================
// AUTH EMAILS
// ============================================================================

export function verificationEmailTemplate(data: { userName: string; verificationUrl: string }): string {
  const content = `
    <h1>Verify Your Email</h1>
    <p>Hi ${data.userName},</p>
    <p>Welcome to Gemsutopia! Please verify your email address to complete your account setup.</p>

    <div class="highlight-box" style="text-align: center;">
      <p style="margin-bottom: 20px;">Click the button below to verify your email:</p>
      <a href="${data.verificationUrl}" class="btn">Verify Email Address</a>
    </div>

    <p style="color: #666; font-size: 14px; margin-top: 30px;">
      If the button doesn't work, copy and paste this link into your browser:<br>
      <a href="${data.verificationUrl}" style="word-break: break-all;">${data.verificationUrl}</a>
    </p>

    <div class="warning-box" style="margin-top: 30px;">
      <strong>Didn't create an account?</strong><br>
      If you didn't sign up for Gemsutopia, you can safely ignore this email.
    </div>

    <p style="color: #999; font-size: 12px; margin-top: 20px;">This link will expire in 24 hours.</p>
  `;

  return emailWrapper(content, `Verify your Gemsutopia account`);
}

export function passwordResetEmailTemplate(data: { userName: string; resetUrl: string }): string {
  const content = `
    <h1>Reset Your Password</h1>
    <p>Hi ${data.userName},</p>
    <p>We received a request to reset your password for your Gemsutopia account.</p>

    <div class="highlight-box" style="text-align: center;">
      <p style="margin-bottom: 20px;">Click the button below to reset your password:</p>
      <a href="${data.resetUrl}" class="btn">Reset Password</a>
    </div>

    <p style="color: #666; font-size: 14px; margin-top: 30px;">
      If the button doesn't work, copy and paste this link into your browser:<br>
      <a href="${data.resetUrl}" style="word-break: break-all;">${data.resetUrl}</a>
    </p>

    <div class="warning-box" style="margin-top: 30px;">
      <strong>Didn't request this?</strong><br>
      If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.
    </div>

    <p style="color: #999; font-size: 12px; margin-top: 20px;">This link will expire in 1 hour for security reasons.</p>
  `;

  return emailWrapper(content, `Reset your Gemsutopia password`);
}

export function welcomeEmailTemplate(data: { userName: string }): string {
  const content = `
    <h1>Welcome to Gemsutopia!</h1>
    <p>Hi ${data.userName},</p>
    <p>Your account has been verified and you're all set to explore our collection of premium, ethically sourced gemstones.</p>

    <div class="success-box">
      <strong>Account Activated!</strong><br>
      You can now browse, bid on auctions, and make purchases.
    </div>

    <div class="highlight-box">
      <h3 style="margin-top: 0;">What You Can Do Now:</h3>
      <ul style="margin: 0; padding-left: 20px;">
        <li>Browse our curated gemstone collection</li>
        <li>Save items to your wishlist</li>
        <li>Participate in live auctions</li>
        <li>Earn rewards with every purchase</li>
      </ul>
    </div>

    <p style="text-align: center; margin-top: 30px;">
      <a href="https://gemsutopia.ca/shop" class="btn">Start Exploring</a>
    </p>

    <p style="color: #666; font-size: 14px; margin-top: 20px;">
      Questions? Reply to this email or reach us at gemsutopia@gmail.com
    </p>
  `;

  return emailWrapper(content, `Welcome to Gemsutopia - Start exploring!`);
}
