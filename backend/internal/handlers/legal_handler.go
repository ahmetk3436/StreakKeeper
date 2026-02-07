package handlers

import "github.com/gofiber/fiber/v2"

type LegalHandler struct{}

func NewLegalHandler() *LegalHandler {
	return &LegalHandler{}
}

func (h *LegalHandler) PrivacyPolicy(c *fiber.Ctx) error {
	html := `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Privacy Policy - Snapstreak</title><style>body{font-family:-apple-system,system-ui,sans-serif;max-width:800px;margin:0 auto;padding:20px;color:#333;line-height:1.6}h1{color:#EF4444}h2{color:#DC2626;margin-top:30px}</style></head><body><h1>Privacy Policy</h1><p><strong>Last updated:</strong> February 7, 2026</p><p>Snapstreak ("we", "our", or "us") is committed to protecting your privacy.</p><h2>Information We Collect</h2><ul><li><strong>Account Information:</strong> Email and encrypted password.</li><li><strong>Photos:</strong> Daily streak photos you submit.</li><li><strong>Social Data:</strong> Friend connections and streak data.</li></ul><h2>How We Use Your Information</h2><ul><li>To track daily photo streaks</li><li>To enable friend connections and leaderboards</li><li>To award achievements</li></ul><h2>Data Storage & Security</h2><p>Stored securely with JWT authentication and encryption.</p><h2>Third-Party Services</h2><ul><li><strong>RevenueCat:</strong> Subscription management.</li><li><strong>Apple Sign In:</strong> Email and name only.</li></ul><h2>Data Deletion</h2><p>Delete your account and all data from Settings.</p><h2>Contact</h2><p>Email: <strong>ahmetk3436@gmail.com</strong></p></body></html>`
	c.Set("Content-Type", "text/html; charset=utf-8")
	return c.SendString(html)
}

func (h *LegalHandler) TermsOfService(c *fiber.Ctx) error {
	html := `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Terms of Service - Snapstreak</title><style>body{font-family:-apple-system,system-ui,sans-serif;max-width:800px;margin:0 auto;padding:20px;color:#333;line-height:1.6}h1{color:#EF4444}h2{color:#DC2626;margin-top:30px}</style></head><body><h1>Terms of Service</h1><p><strong>Last updated:</strong> February 7, 2026</p><h2>Use of Service</h2><p>Snapstreak provides daily photo streak tracking with friends. Must be 13+.</p><h2>Content Guidelines</h2><ul><li>No inappropriate or illegal photos</li><li>No harassment</li><li>Content is moderated</li></ul><h2>Subscriptions</h2><ul><li>Premium via Apple's App Store. Cancel anytime.</li></ul><h2>Limitation of Liability</h2><p>Snapstreak is provided "as is".</p><h2>Contact</h2><p>Email: <strong>ahmetk3436@gmail.com</strong></p></body></html>`
	c.Set("Content-Type", "text/html; charset=utf-8")
	return c.SendString(html)
}
