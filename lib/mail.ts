import nodemailer from 'nodemailer';

// Configure your email transporter
const transporter = nodemailer.createTransport({
    service: 'gmail', // You can change this if using Outlook/AWS SES/Resend
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

const BRAND_COLOR = "#ec1313";

// 1. Order Confirmation Email
export async function sendOrderConfirmationEmail(customerEmail: string, orderId: string, total: number) {
    const htmlTemplate = `
        <div style="font-family: Arial, sans-serif; max-w: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #eeeeee; border-radius: 12px; overflow: hidden;">
            <div style="background: #0f172a; padding: 30px; text-align: center;">
                <h1 style="color: #ffffff; margin: 0; font-weight: 900; letter-spacing: 2px;">STRENOXA<span style="color: ${BRAND_COLOR}">.</span></h1>
            </div>
            <div style="padding: 40px 30px;">
                <h2 style="color: #0f172a; font-weight: 900; margin-top: 0;">Order Confirmed!</h2>
                <p style="color: #64748b; line-height: 1.6; font-size: 16px;">Thanks for gearing up with us. We've received your order and our team is already getting it ready to ship.</p>
                
                <div style="background: #f8f9fa; border-left: 4px solid ${BRAND_COLOR}; padding: 20px; border-radius: 4px; margin: 30px 0;">
                    <p style="margin: 0; color: #64748b; font-size: 14px; text-transform: uppercase; font-weight: bold;">Order Number</p>
                    <p style="margin: 5px 0 0 0; color: #0f172a; font-size: 20px; font-weight: 900;">#${orderId.slice(-8).toUpperCase()}</p>
                    
                    <p style="margin: 20px 0 0 0; color: #64748b; font-size: 14px; text-transform: uppercase; font-weight: bold;">Total Paid</p>
                    <p style="margin: 5px 0 0 0; color: #0f172a; font-size: 20px; font-weight: 900;">$${total.toFixed(2)}</p>
                </div>
                
                <p style="color: #64748b; font-size: 14px;">We'll send you another update the moment your package leaves our facility.</p>
            </div>
        </div>
    `;

    try {
        await transporter.sendMail({
            from: `"Strenoxa Support" <${process.env.EMAIL_USER}>`,
            to: customerEmail,
            subject: `Order Confirmed - #${orderId.slice(-8).toUpperCase()}`,
            html: htmlTemplate,
        });
    } catch (error) {
        console.error("Failed to send confirmation email:", error);
    }
}

// 2. Shipping Update Email
export async function sendShippingUpdateEmail(customerEmail: string, orderId: string, status: string) {
    const htmlTemplate = `
        <div style="font-family: Arial, sans-serif; max-w: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #eeeeee; border-radius: 12px; overflow: hidden;">
            <div style="background: #0f172a; padding: 30px; text-align: center;">
                <h1 style="color: #ffffff; margin: 0; font-weight: 900; letter-spacing: 2px;">STRENOXA<span style="color: ${BRAND_COLOR}">.</span></h1>
            </div>
            <div style="padding: 40px 30px;">
                <h2 style="color: #0f172a; font-weight: 900; margin-top: 0;">Order Update</h2>
                <p style="color: #64748b; line-height: 1.6; font-size: 16px;">Your order <strong>#${orderId.slice(-8).toUpperCase()}</strong> has been marked as:</p>
                
                <div style="text-align: center; margin: 30px 0;">
                    <span style="background: #ec1313; color: white; padding: 12px 24px; border-radius: 50px; font-weight: 900; text-transform: uppercase; letter-spacing: 1px; font-size: 18px;">
                        ${status}
                    </span>
                </div>
            </div>
        </div>
    `;

    try {
        await transporter.sendMail({
            from: `"Strenoxa Delivery" <${process.env.EMAIL_USER}>`,
            to: customerEmail,
            subject: `Your Strenoxa Order is ${status}!`,
            html: htmlTemplate,
        });
    } catch (error) {
        console.error("Failed to send shipping update email:", error);
    }
}