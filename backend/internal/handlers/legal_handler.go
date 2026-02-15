package handlers

import "github.com/gofiber/fiber/v2"

// commonStyles contains shared CSS for both legal pages
const commonStyles = `
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<style>
		body {
			background-color: #030712;
			color: #e5e7eb;
			font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
			padding: 20px;
			max-width: 600px;
			margin: 0 auto;
			line-height: 1.6;
		}
		h1 {
			color: #ffffff;
			font-size: 24px;
			margin-bottom: 20px;
			border-bottom: 2px solid #f97316;
			padding-bottom: 10px;
		}
		h2 {
			color: #f97316;
			font-size: 18px;
			margin-top: 24px;
			margin-bottom: 12px;
		}
		p {
			margin-bottom: 16px;
		}
		ul {
			margin-bottom: 16px;
			padding-left: 24px;
		}
		li {
			margin-bottom: 8px;
		}
		a {
			color: #f97316;
			text-decoration: none;
		}
		a:hover {
			text-decoration: underline;
		}
		.last-updated {
			color: #9ca3af;
			font-size: 14px;
			margin-bottom: 20px;
		}
		.contact {
			background-color: #1f2937;
			border-radius: 12px;
			padding: 16px;
			margin-top: 24px;
		}
		.contact-title {
			color: #f97316;
			font-weight: 600;
			margin-bottom: 8px;
		}
	</style>
`

type LegalHandler struct{}

func NewLegalHandler() *LegalHandler {
	return &LegalHandler{}
}

func (h *LegalHandler) PrivacyPolicy(c *fiber.Ctx) error {
	html := `<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	` + commonStyles + `
	<title>Privacy Policy - StreakSnap</title>
</head>
<body>
	<h1>Privacy Policy</h1>
	<p class="last-updated">Last updated: February 14, 2026</p>

	<p>Welcome to StreakSnap. We are committed to protecting your privacy and ensuring you have a positive experience with our app. This Privacy Policy explains how we collect, use, and safeguard your information when you use StreakSnap.</p>

	<h2>Information We Collect</h2>
	<p>StreakSnap collects the following types of information:</p>
	<ul>
		<li><strong>Account Information:</strong> When you create an account, we collect your email address and a securely hashed version of your password.</li>
		<li><strong>Usage Data:</strong> We track your streak data, daily completion status, and app usage patterns to provide you with personalized insights and motivation.</li>
		<li><strong>Device Information:</strong> We collect basic device information including device type, operating system version, and app version for troubleshooting and optimization purposes.</li>
		<li><strong>Subscription Data:</strong> If you subscribe to StreakSnap Premium, we receive transaction information from RevenueCat to manage your subscription.</li>
	</ul>

	<h2>How We Use Your Information</h2>
	<p>We use the information we collect to:</p>
	<ul>
		<li>Provide, maintain, and improve our services</li>
		<li>Track and display your streak progress and statistics</li>
		<li>Send you notifications related to your streaks and account</li>
		<li>Process and manage your premium subscription</li>
		<li>Respond to your comments, questions, and support requests</li>
		<li>Detect, prevent, and address technical issues and fraud</li>
	</ul>

	<h2>Data Storage and Security</h2>
	<p>We implement industry-standard security measures to protect your personal information. Your data is stored securely on our servers and is encrypted during transmission. However, no method of transmission over the Internet or electronic storage is 100% secure, and we cannot guarantee absolute security.</p>

	<h2>Data Retention</h2>
	<p>We retain your personal information for as long as your account is active or as needed to provide you services. If you delete your account, we will delete or anonymize your information within 30 days, except where retention is required by law.</p>

	<h2>Your Rights</h2>
	<p>You have the right to:</p>
	<ul>
		<li>Access the personal information we hold about you</li>
		<li>Request correction of inaccurate data</li>
		<li>Request deletion of your account and associated data</li>
		<li>Opt-out of promotional communications</li>
		<li>Export your data in a portable format</li>
	</ul>

	<h2>Third-Party Services</h2>
	<p>StreakSnap uses the following third-party services:</p>
	<ul>
		<li><strong>RevenueCat:</strong> For subscription management and payment processing. RevenueCat's privacy policy applies to payment information.</li>
		<li><strong>Apple Sign In:</strong> For authentication. Apple's privacy policy applies to authentication data.</li>
	</ul>

	<h2>Children's Privacy</h2>
	<p>StreakSnap is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13. If you are a parent or guardian and believe your child has provided us with personal information, please contact us.</p>

	<h2>Changes to This Policy</h2>
	<p>We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date. You are advised to review this Privacy Policy periodically for any changes.</p>

	<div class="contact">
		<p class="contact-title">Contact Us</p>
		<p>If you have any questions about this Privacy Policy, please contact us at:</p>
		<p><a href="mailto:support@streaksnap.app">support@streaksnap.app</a></p>
	</div>
</body>
</html>`

	c.Set("Content-Type", "text/html; charset=utf-8")
	return c.SendString(html)
}

func (h *LegalHandler) TermsOfService(c *fiber.Ctx) error {
	html := `<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	` + commonStyles + `
	<title>Terms of Service - StreakSnap</title>
</head>
<body>
	<h1>Terms of Service</h1>
	<p class="last-updated">Last updated: February 14, 2026</p>

	<p>Welcome to StreakSnap. By downloading, accessing, or using StreakSnap, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our app.</p>

	<h2>1. Acceptance of Terms</h2>
	<p>By accessing and using StreakSnap, you accept and agree to be bound by these Terms of Service and our Privacy Policy. These terms apply to all visitors, users, and others who access or use the app.</p>

	<h2>2. Description of Service</h2>
	<p>StreakSnap is a habit tracking and streak management application that helps users build and maintain daily habits. The app provides:</p>
	<ul>
		<li>Daily streak tracking and visualization</li>
		<li>Progress statistics and insights</li>
		<li>Reminder notifications</li>
		<li>Premium features through subscription</li>
	</ul>

	<h2>3. Account Registration</h2>
	<p>To access certain features of StreakSnap, you may be required to create an account. You agree to:</p>
	<ul>
		<li>Provide accurate and complete information during registration</li>
		<li>Maintain the security of your account credentials</li>
		<li>Promptly update your account information if it changes</li>
		<li>Accept responsibility for all activities that occur under your account</li>
	</ul>

	<h2>4. Subscription and Payments</h2>
	<p>StreakSnap offers premium features through auto-renewing subscriptions:</p>
	<ul>
		<li><strong>Billing:</strong> Subscriptions are billed through your Apple ID account at confirmation of purchase.</li>
		<li><strong>Auto-Renewal:</strong> Subscriptions automatically renew unless auto-renew is turned off at least 24 hours before the end of the current period.</li>
		<li><strong>Management:</strong> You can manage and cancel subscriptions in your Apple ID account settings after purchase.</li>
		<li><strong>Refunds:</strong> Refunds are handled according to Apple's App Store policies. Contact Apple Support for refund requests.</li>
		<li><strong>Price Changes:</strong> We may change subscription prices; you will be notified before any price increase takes effect.</li>
	</ul>
	<p>Subscription management is powered by RevenueCat. By subscribing, you also agree to RevenueCat's terms of service.</p>

	<h2>5. Free Trial</h2>
	<p>We may offer free trials for new subscribers. At the end of the free trial, your subscription will automatically renew at the standard rate unless you cancel before the trial ends. You will not be charged if you cancel during the trial period.</p>

	<h2>6. User Conduct</h2>
	<p>You agree not to:</p>
	<ul>
		<li>Use StreakSnap for any unlawful purpose</li>
		<li>Attempt to gain unauthorized access to any part of the service</li>
		<li>Interfere with or disrupt the service or servers</li>
		<li>Use automated systems to access the service without permission</li>
		<li>Share your account credentials with others</li>
		<li>Reverse engineer or attempt to extract the source code of the app</li>
	</ul>

	<h2>7. Intellectual Property</h2>
	<p>StreakSnap and its original content, features, and functionality are owned by StreakSnap and are protected by international copyright, trademark, and other intellectual property laws. You may not copy, modify, distribute, or create derivative works without our express written permission.</p>

	<h2>8. Limitation of Liability</h2>
	<p>To the maximum extent permitted by law, StreakSnap shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, or other intangible losses resulting from your use or inability to use the service.</p>

	<h2>9. Disclaimer</h2>
	<p>StreakSnap is provided "as is" and "as available" without warranties of any kind, either express or implied. We do not warrant that the service will be uninterrupted, error-free, or secure.</p>

	<h2>10. Account Termination</h2>
	<p>You may delete your account at any time through the app's settings. Upon account deletion:</p>
	<ul>
		<li>Your account and associated data will be permanently deleted within 30 days</li>
		<li>Any active subscription will be cancelled</li>
		<li>You will not receive a refund for any remaining subscription period</li>
	</ul>
	<p>We reserve the right to suspend or terminate accounts that violate these Terms of Service.</p>

	<h2>11. Changes to Terms</h2>
	<p>We reserve the right to modify these Terms of Service at any time. We will notify users of any material changes by posting the updated terms in the app. Your continued use of StreakSnap after such modifications constitutes your acceptance of the new terms.</p>

	<h2>12. Governing Law</h2>
	<p>These Terms of Service shall be governed by and construed in accordance with the laws of the jurisdiction in which StreakSnap operates, without regard to its conflict of law provisions.</p>

	<h2>13. Contact Us</h2>
	<p>If you have any questions about these Terms of Service, please contact us:</p>
	<ul>
		<li>Email: <a href="mailto:support@streaksnap.app">support@streaksnap.app</a></li>
	</ul>

	<div class="contact">
		<p class="contact-title">Need Help?</p>
		<p>For subscription issues, please contact Apple Support or visit your Apple ID account settings.</p>
		<p>For other questions: <a href="mailto:support@streaksnap.app">support@streaksnap.app</a></p>
	</div>
</body>
</html>`

	c.Set("Content-Type", "text/html; charset=utf-8")
	return c.SendString(html)
}
