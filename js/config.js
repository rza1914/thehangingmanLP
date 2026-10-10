/* ============================================================
   The Hanging Man — site configuration
   This is the only file you need to edit to personalize the site.
   Everything here is PUBLIC information — never put passwords,
   private tokens, or secret API keys in a frontend file.
   ============================================================ */
window.THM_CONFIG = {

  /* Contact form endpoint — see README ("Make the form real").
     Empty = the form shows an honest notice instead of pretending
     to send. Recommended free provider: https://formspree.io
     Example value: "https://formspree.io/f/abcdwxyz" */
  formEndpoint: "",

  /* Direct contact channels. Empty = hidden from the site.
     Fill any of these in and the links appear automatically
     in the Contact section and the footer (with a clean handle). */
  contacts: {
    telegram: "",           // e.g. "https://t.me/yourusername"
    whatsapp: "",           // e.g. "https://wa.me/989123456789"
    email: ""               // e.g. "mailto:hello@thehangingman.com"
  }
};