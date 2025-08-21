import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";

const sesClient = new SESClient({
  region: "us-west-1",
});

export interface StatusChangeEmailData {
  userEmail: string;
  businessName?: string;
  userName?: string;
  status: string;
  previousStatus?: string;
  reason?: string;
  contactUrl?: string;
}

export async function sendStatusChangeEmail(data: StatusChangeEmailData) {
  const { userEmail, businessName, userName, status, previousStatus, reason, contactUrl } = data;
  
  const contactFormUrl = contactUrl || 'https://www.qrewards.net/contact';
  
  let subject = '';
  let emailContent = '';
  
  switch (status) {
    case 'approved':
      subject = '🎉 Your QRewards Business Account Has Been Approved!';
      emailContent = generateApprovalEmail(businessName, contactFormUrl);
      break;
      
    case 'rejected':
      subject = '❌ Your QRewards Business Account Application Update';
      emailContent = generateRejectionEmail(businessName, reason, contactFormUrl);
      break;
      
    case 'pending_approval':
      subject = '⏳ Your QRewards Business Account Application Received';
      emailContent = generatePendingEmail(businessName, contactFormUrl);
      break;
      
    case 'suspended':
      subject = '⚠️ Your QRewards Business Account Has Been Suspended';
      emailContent = generateSuspensionEmail(businessName, reason, contactFormUrl);
      break;
      
    case 'update_approved':
      subject = '✅ Your Business Profile Update Has Been Approved';
      emailContent = generateUpdateApprovalEmail(businessName, contactFormUrl);
      break;
      
    case 'update_rejected':
      subject = '❌ Your Business Profile Update Has Been Rejected';
      emailContent = generateUpdateRejectionEmail(businessName, reason, contactFormUrl);
      break;
      
    default:
      subject = '📧 Your QRewards Account Status Update';
      emailContent = generateGenericStatusEmail(status, businessName, contactFormUrl);
  }

  const command = new SendEmailCommand({
    Source: process.env.SES_FROM_EMAIL || "QRewards@qrewards.net",
    Destination: {
      ToAddresses: [userEmail],
    },
    Message: {
      Subject: {
        Data: subject,
        Charset: "UTF-8",
      },
      Body: {
        Html: {
          Data: emailContent,
          Charset: "UTF-8",
        },
      },
    },
  });

  await sesClient.send(command);
}

function generateApprovalEmail(businessName?: string, contactFormUrl?: string): string {
  return `
    <div style="font-family: 'Segoe UI', sans-serif; background-color: #f4f4f7; padding: 40px 0; color: #1f2937;">
      <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; padding: 32px; box-shadow: 0 8px 24px rgba(0,0,0,0.05);">
        <div style="text-align: center;">
          <img src="https://www.qrewards.net/logo.png" alt="QRewards Logo" style="height: 40px; margin-bottom: 24px;" />
          <h1 style="color: #16a34a; margin-bottom: 8px; font-size: 28px;">Congratulations!</h1>
          <p style="font-size: 18px; margin-bottom: 16px; color: #374151;">Your business account has been approved!</p>
          <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 16px; margin: 24px 0;">
            <h2 style="color: #166534; margin: 0 0 8px 0; font-size: 20px;">${businessName || 'Your Business'}</h2>
            <p style="color: #166534; margin: 0; font-size: 16px;">You can now start creating and managing rewards for your customers!</p>
          </div>
        </div>

        <div style="margin: 32px 0;">
          <h3 style="color: #374151; margin-bottom: 16px; font-size: 18px;">Next Steps:</h3>
          <ol style="color: #6b7280; line-height: 1.6; padding-left: 20px;">
            <li style="margin-bottom: 8px;">Sign in to your business dashboard using your email and password</li>
            <li style="margin-bottom: 8px;">Complete your business profile with additional details</li>
            <li style="margin-bottom: 8px;">Create your first reward offer</li>
            <li style="margin-bottom: 8px;">Generate QR codes for your customers to scan</li>
          </ol>
        </div>

        <div style="text-align: center; margin-bottom: 30px;">
          <a href="https://www.qrewards.net/business/login" style="
            background-color: #16a34a;
            color: #ffffff;
            padding: 16px 32px;
            font-size: 16px;
            border-radius: 8px;
            text-decoration: none;
            display: inline-block;
            font-weight: 600;
            box-shadow: 0 4px 12px rgba(22, 163, 74, 0.3);
          ">Sign In to Dashboard</a>
        </div>

        <div style="background-color: #fef3c7; border: 1px solid #fde68a; border-radius: 8px; padding: 16px; margin: 24px 0;">
          <h4 style="color: #92400e; margin: 0 0 8px 0; font-size: 16px;">🔐 Login Information</h4>
          <p style="color: #92400e; margin: 0 0 4px 0; font-size: 14px;"><strong>Email:</strong> Use the email you registered with</p>
          <p style="color: #92400e; margin: 0; font-size: 14px;"><strong>Password:</strong> Use the password you created during signup</p>
          <p style="color: #92400e; margin: 8px 0 0 0; font-size: 14px;">If you forgot your password, you can reset it from the login page.</p>
        </div>

        <hr style="margin: 32px 0; border: none; border-top: 1px solid #e5e7eb;" />

        <div style="text-align: center;">
          <p style="font-size: 14px; color: #6b7280; margin-bottom: 16px;">
            Need help getting started? Check out our 
            <a href="https://www.qrewards.net/help" style="color: #16a34a; text-decoration: none;">help center</a> 
            or <a href="${contactFormUrl}" style="color: #16a34a; text-decoration: none;">contact our support team</a>.
          </p>
          <p style="font-size: 12px; color: #9ca3af;">
            You received this email because your business account was approved on QRewards.<br/>
            If you have any questions, please contact our support team.
          </p>
        </div>
      </div>
    </div>
  `;
}

function generateRejectionEmail(businessName?: string, reason?: string, contactFormUrl?: string): string {
  return `
    <div style="font-family: 'Segoe UI', sans-serif; background-color: #f4f4f7; padding: 40px 0; color: #1f2937;">
      <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; padding: 32px; box-shadow: 0 8px 24px rgba(0,0,0,0.05);">
        <div style="text-align: center;">
          <img src="https://www.qrewards.net/logo.png" alt="QRewards Logo" style="height: 40px; margin-bottom: 24px;" />
          <h1 style="color: #dc2626; margin-bottom: 8px; font-size: 28px;">Application Update</h1>
          <p style="font-size: 18px; margin-bottom: 16px; color: #374151;">We regret to inform you that your business account application has not been approved at this time.</p>
          <div style="background-color: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 16px; margin: 24px 0;">
            <h2 style="color: #dc2626; margin: 0 0 8px 0; font-size: 20px;">${businessName || 'Your Business'}</h2>
            <p style="color: #dc2626; margin: 0; font-size: 16px;">We appreciate your interest in QRewards and encourage you to review the feedback below.</p>
          </div>
        </div>

        ${reason ? `
        <div style="margin: 32px 0;">
          <h3 style="color: #374151; margin-bottom: 16px; font-size: 18px;">Feedback:</h3>
          <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px;">
            <p style="color: #6b7280; margin: 0; line-height: 1.6;">${reason}</p>
          </div>
        </div>
        ` : ''}

        <div style="margin: 32px 0;">
          <h3 style="color: #374151; margin-bottom: 16px; font-size: 18px;">Next Steps:</h3>
          <ol style="color: #6b7280; line-height: 1.6; padding-left: 20px;">
            <li style="margin-bottom: 8px;">Review the feedback provided above</li>
            <li style="margin-bottom: 8px;">Address any issues or concerns mentioned</li>
            <li style="margin-bottom: 8px;">Consider resubmitting your application with updated information</li>
            <li style="margin-bottom: 8px;">Contact our support team if you have questions</li>
          </ol>
        </div>

        <div style="text-align: center; margin-bottom: 30px;">
          <a href="${contactFormUrl}" style="
            background-color: #dc2626;
            color: #ffffff;
            padding: 16px 32px;
            font-size: 16px;
            border-radius: 8px;
            text-decoration: none;
            display: inline-block;
            font-weight: 600;
            box-shadow: 0 4px 12px rgba(220, 38, 38, 0.3);
          ">Contact Support</a>
        </div>

        <hr style="margin: 32px 0; border: none; border-top: 1px solid #e5e7eb;" />

        <div style="text-align: center;">
          <p style="font-size: 14px; color: #6b7280; margin-bottom: 16px;">
            We're here to help! If you have any questions about this decision or need assistance with your application, 
            please don't hesitate to <a href="${contactFormUrl}" style="color: #16a34a; text-decoration: none;">contact our support team</a>.
          </p>
          <p style="font-size: 12px; color: #9ca3af;">
            You received this email because your business account application was reviewed on QRewards.<br/>
            Thank you for your interest in our platform.
          </p>
        </div>
      </div>
    </div>
  `;
}

function generatePendingEmail(businessName?: string, contactFormUrl?: string): string {
  return `
    <div style="font-family: 'Segoe UI', sans-serif; background-color: #f4f4f7; padding: 40px 0; color: #1f2937;">
      <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; padding: 32px; box-shadow: 0 8px 24px rgba(0,0,0,0.05);">
        <div style="text-align: center;">
          <img src="https://www.qrewards.net/logo.png" alt="QRewards Logo" style="height: 40px; margin-bottom: 24px;" />
          <h1 style="color: #f59e0b; margin-bottom: 8px; font-size: 28px;">Application Received!</h1>
          <p style="font-size: 18px; margin-bottom: 16px; color: #374151;">Thank you for submitting your business account application.</p>
          <div style="background-color: #fffbeb; border: 1px solid #fed7aa; border-radius: 8px; padding: 16px; margin: 24px 0;">
            <h2 style="color: #d97706; margin: 0 0 8px 0; font-size: 20px;">${businessName || 'Your Business'}</h2>
            <p style="color: #d97706; margin: 0; font-size: 16px;">Your application is now under review by our team.</p>
          </div>
        </div>

        <div style="margin: 32px 0;">
          <h3 style="color: #374151; margin-bottom: 16px; font-size: 18px;">What happens next?</h3>
          <ol style="color: #6b7280; line-height: 1.6; padding-left: 20px;">
            <li style="margin-bottom: 8px;">Our team will review your application within 2-3 business days</li>
            <li style="margin-bottom: 8px;">We'll verify your business information and credentials</li>
            <li style="margin-bottom: 8px;">You'll receive an email notification once the review is complete</li>
            <li style="margin-bottom: 8px;">If approved, you'll get access to your business dashboard</li>
          </ol>
        </div>

        <div style="background-color: #f0f9ff; border: 1px solid #bae6fd; border-radius: 8px; padding: 16px; margin: 24px 0;">
          <h4 style="color: #0369a1; margin: 0 0 8px 0; font-size: 16px;">📧 Stay Updated</h4>
          <p style="color: #0369a1; margin: 0; font-size: 14px;">You'll receive an email notification as soon as your application status changes. No action is required from you at this time.</p>
        </div>

        <hr style="margin: 32px 0; border: none; border-top: 1px solid #e5e7eb;" />

        <div style="text-align: center;">
          <p style="font-size: 14px; color: #6b7280; margin-bottom: 16px;">
            Have questions about your application? 
            <a href="${contactFormUrl}" style="color: #16a34a; text-decoration: none;">Contact our support team</a>.
          </p>
          <p style="font-size: 12px; color: #9ca3af;">
            You received this email because you submitted a business account application on QRewards.<br/>
            Thank you for choosing our platform!
          </p>
        </div>
      </div>
    </div>
  `;
}

function generateSuspensionEmail(businessName?: string, reason?: string, contactFormUrl?: string): string {
  return `
    <div style="font-family: 'Segoe UI', sans-serif; background-color: #f4f4f7; padding: 40px 0; color: #1f2937;">
      <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; padding: 32px; box-shadow: 0 8px 24px rgba(0,0,0,0.05);">
        <div style="text-align: center;">
          <img src="https://www.qrewards.net/logo.png" alt="QRewards Logo" style="height: 40px; margin-bottom: 24px;" />
          <h1 style="color: #dc2626; margin-bottom: 8px; font-size: 28px;">Account Suspension Notice</h1>
          <p style="font-size: 18px; margin-bottom: 16px; color: #374151;">Your QRewards business account has been temporarily suspended.</p>
          <div style="background-color: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 16px; margin: 24px 0;">
            <h2 style="color: #dc2626; margin: 0 0 8px 0; font-size: 20px;">${businessName || 'Your Business'}</h2>
            <p style="color: #dc2626; margin: 0; font-size: 16px;">Your account access has been temporarily restricted.</p>
          </div>
        </div>

        ${reason ? `
        <div style="margin: 32px 0;">
          <h3 style="color: #374151; margin-bottom: 16px; font-size: 18px;">Reason for Suspension:</h3>
          <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px;">
            <p style="color: #6b7280; margin: 0; line-height: 1.6;">${reason}</p>
          </div>
        </div>
        ` : ''}

        <div style="margin: 32px 0;">
          <h3 style="color: #374151; margin-bottom: 16px; font-size: 18px;">What this means:</h3>
          <ul style="color: #6b7280; line-height: 1.6; padding-left: 20px;">
            <li style="margin-bottom: 8px;">Your business dashboard access is temporarily disabled</li>
            <li style="margin-bottom: 8px;">Existing rewards remain active for customers</li>
            <li style="margin-bottom: 8px;">You cannot create new rewards or make changes</li>
            <li style="margin-bottom: 8px;">Customer QR codes will continue to work</li>
          </ul>
        </div>

        <div style="text-align: center; margin-bottom: 30px;">
          <a href="${contactFormUrl}" style="
            background-color: #dc2626;
            color: #ffffff;
            padding: 16px 32px;
            font-size: 16px;
            border-radius: 8px;
            text-decoration: none;
            display: inline-block;
            font-weight: 600;
            box-shadow: 0 4px 12px rgba(220, 38, 38, 0.3);
          ">Contact Support</a>
        </div>

        <hr style="margin: 32px 0; border: none; border-top: 1px solid #e5e7eb;" />

        <div style="text-align: center;">
          <p style="font-size: 14px; color: #6b7280; margin-bottom: 16px;">
            If you believe this suspension is in error or have questions, please 
            <a href="${contactFormUrl}" style="color: #16a34a; text-decoration: none;">contact our support team</a> immediately.
          </p>
          <p style="font-size: 12px; color: #9ca3af;">
            You received this email because your QRewards business account was suspended.<br/>
            We're here to help resolve any issues.
          </p>
        </div>
      </div>
    </div>
  `;
}

function generateUpdateApprovalEmail(businessName?: string, contactFormUrl?: string): string {
  return `
    <div style="font-family: 'Segoe UI', sans-serif; background-color: #f4f4f7; padding: 40px 0; color: #1f2937;">
      <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; padding: 32px; box-shadow: 0 8px 24px rgba(0,0,0,0.05);">
        <div style="text-align: center;">
          <img src="https://www.qrewards.net/logo.png" alt="QRewards Logo" style="height: 40px; margin-bottom: 24px;" />
          <h1 style="color: #16a34a; margin-bottom: 8px; font-size: 28px;">Profile Update Approved!</h1>
          <p style="font-size: 18px; margin-bottom: 16px; color: #374151;">Your business profile update has been approved and is now live.</p>
          <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 16px; margin: 24px 0;">
            <h2 style="color: #166534; margin: 0 0 8px 0; font-size: 20px;">${businessName || 'Your Business'}</h2>
            <p style="color: #166534; margin: 0; font-size: 16px;">Your updated information is now visible to customers.</p>
          </div>
        </div>

        <div style="margin: 32px 0;">
          <h3 style="color: #374151; margin-bottom: 16px; font-size: 18px;">What's been updated:</h3>
          <ul style="color: #6b7280; line-height: 1.6; padding-left: 20px;">
            <li style="margin-bottom: 8px;">Your business profile information</li>
            <li style="margin-bottom: 8px;">Contact details and hours</li>
            <li style="margin-bottom: 8px;">Business description and category</li>
            <li style="margin-bottom: 8px;">Any other requested changes</li>
          </ul>
        </div>

        <div style="text-align: center; margin-bottom: 30px;">
          <a href="https://www.qrewards.net/business/dashboard" style="
            background-color: #16a34a;
            color: #ffffff;
            padding: 16px 32px;
            font-size: 16px;
            border-radius: 8px;
            text-decoration: none;
            display: inline-block;
            font-weight: 600;
            box-shadow: 0 4px 12px rgba(22, 163, 74, 0.3);
          ">View Dashboard</a>
        </div>

        <hr style="margin: 32px 0; border: none; border-top: 1px solid #e5e7eb;" />

        <div style="text-align: center;">
          <p style="font-size: 14px; color: #6b7280; margin-bottom: 16px;">
            Need to make more changes? You can submit additional updates through your dashboard, or 
            <a href="${contactFormUrl}" style="color: #16a34a; text-decoration: none;">contact our support team</a>.
          </p>
          <p style="font-size: 12px; color: #9ca3af;">
            You received this email because your business profile update was approved on QRewards.<br/>
            Thank you for keeping your information current!
          </p>
        </div>
      </div>
    </div>
  `;
}

function generateUpdateRejectionEmail(businessName?: string, reason?: string, contactFormUrl?: string): string {
  return `
    <div style="font-family: 'Segoe UI', sans-serif; background-color: #f4f4f7; padding: 40px 0; color: #1f2937;">
      <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; padding: 32px; box-shadow: 0 8px 24px rgba(0,0,0,0.05);">
        <div style="text-align: center;">
          <img src="https://www.qrewards.net/logo.png" alt="QRewards Logo" style="height: 40px; margin-bottom: 24px;" />
          <h1 style="color: #dc2626; margin-bottom: 8px; font-size: 28px;">Profile Update Not Approved</h1>
          <p style="font-size: 18px; margin-bottom: 16px; color: #374151;">Your business profile update request has not been approved.</p>
          <div style="background-color: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 16px; margin: 24px 0;">
            <h2 style="color: #dc2626; margin: 0 0 8px 0; font-size: 20px;">${businessName || 'Your Business'}</h2>
            <p style="color: #dc2626; margin: 0; font-size: 16px;">Your current profile information remains unchanged.</p>
          </div>
        </div>

        ${reason ? `
        <div style="margin: 32px 0;">
          <h3 style="color: #374151; margin-bottom: 16px; font-size: 18px;">Reason for Rejection:</h3>
          <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px;">
            <p style="color: #6b7280; margin: 0; line-height: 1.6;">${reason}</p>
          </div>
        </div>
        ` : ''}

        <div style="margin: 32px 0;">
          <h3 style="color: #374151; margin-bottom: 16px; font-size: 18px;">Next Steps:</h3>
          <ol style="color: #6b7280; line-height: 1.6; padding-left: 20px;">
            <li style="margin-bottom: 8px;">Review the feedback provided above</li>
            <li style="margin-bottom: 8px;">Address any issues or concerns mentioned</li>
            <li style="margin-bottom: 8px;">Submit a new update request with corrected information</li>
            <li style="margin-bottom: 8px;">Contact support if you need clarification</li>
          </ol>
        </div>

        <div style="text-align: center; margin-bottom: 30px;">
          <a href="${contactFormUrl}" style="
            background-color: #dc2626;
            color: #ffffff;
            padding: 16px 32px;
            font-size: 16px;
            border-radius: 8px;
            text-decoration: none;
            display: inline-block;
            font-weight: 600;
            box-shadow: 0 4px 12px rgba(220, 38, 38, 0.3);
          ">Contact Support</a>
        </div>

        <hr style="margin: 32px 0; border: none; border-top: 1px solid #e5e7eb;" />

        <div style="text-align: center;">
          <p style="font-size: 14px; color: #6b7280; margin-bottom: 16px;">
            Need help understanding the feedback or want to discuss your update request? 
            <a href="${contactFormUrl}" style="color: #16a34a; text-decoration: none;">Contact our support team</a>.
          </p>
          <p style="font-size: 12px; color: #9ca3af;">
            You received this email because your business profile update was reviewed on QRewards.<br/>
            Your current profile information remains unchanged.
          </p>
        </div>
      </div>
    </div>
  `;
}

function generateGenericStatusEmail(status: string, businessName?: string, contactFormUrl?: string): string {
  return `
    <div style="font-family: 'Segoe UI', sans-serif; background-color: #f4f4f7; padding: 40px 0; color: #1f2937;">
      <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; padding: 32px; box-shadow: 0 8px 24px rgba(0,0,0,0.05);">
        <div style="text-align: center;">
          <img src="https://www.qrewards.net/logo.png" alt="QRewards Logo" style="height: 40px; margin-bottom: 24px;" />
          <h1 style="color: #374151; margin-bottom: 8px; font-size: 28px;">Account Status Update</h1>
          <p style="font-size: 18px; margin-bottom: 16px; color: #374151;">Your QRewards account status has been updated.</p>
          <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; margin: 24px 0;">
            <h2 style="color: #374151; margin: 0 0 8px 0; font-size: 20px;">${businessName || 'Your Account'}</h2>
            <p style="color: #374151; margin: 0; font-size: 16px;">Status: <strong>${status}</strong></p>
          </div>
        </div>

        <div style="margin: 32px 0;">
          <h3 style="color: #374151; margin-bottom: 16px; font-size: 18px;">What this means:</h3>
          <p style="color: #6b7280; line-height: 1.6;">
            Your account status has been changed to "${status}". This may affect your access to certain features or services on the QRewards platform.
          </p>
        </div>

        <div style="text-align: center; margin-bottom: 30px;">
          <a href="${contactFormUrl}" style="
            background-color: #374151;
            color: #ffffff;
            padding: 16px 32px;
            font-size: 16px;
            border-radius: 8px;
            text-decoration: none;
            display: inline-block;
            font-weight: 600;
            box-shadow: 0 4px 12px rgba(55, 65, 81, 0.3);
          ">Contact Support</a>
        </div>

        <hr style="margin: 32px 0; border: none; border-top: 1px solid #e5e7eb;" />

        <div style="text-align: center;">
          <p style="font-size: 14px; color: #6b7280; margin-bottom: 16px;">
            If you have questions about this status change, please 
            <a href="${contactFormUrl}" style="color: #16a34a; text-decoration: none;">contact our support team</a>.
          </p>
          <p style="font-size: 12px; color: #9ca3af;">
            You received this email because your QRewards account status was updated.<br/>
            Thank you for using our platform.
          </p>
        </div>
      </div>
    </div>
  `;
} 