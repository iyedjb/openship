"use client";

import { useState } from "react";
import { Key, Copy, Check, Terminal, Code2, ShieldCheck, RefreshCw } from "lucide-react";

interface ApiKeyCardProps {
  domain: string;
  serverId: string;
}

export function ApiKeyIntegrationCard({ domain, serverId }: ApiKeyCardProps) {
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [activeCodeTab, setActiveCodeTab] = useState<"node" | "curl" | "python" | "php">("node");
  const [apiKey, setApiKey] = useState(`opsh_live_${serverId.slice(0, 8)}_9a8b7c6d5e4f`);
  const mailHost = domain ? `mail.${domain}` : "mail.example.com";

  const handleCopyKey = async () => {
    try {
      await navigator.clipboard.writeText(apiKey);
      setCopiedKey(true);
      setTimeout(() => setCopiedKey(false), 1500);
    } catch {}
  };

  const handleRegenerateKey = () => {
    const randomHex = Math.random().toString(36).substring(2, 10) + Math.random().toString(36).substring(2, 10);
    setApiKey(`opsh_live_${serverId.slice(0, 8)}_${randomHex}`);
  };

  const codeSnippets = {
    node: `import nodemailer from "nodemailer";

// 1. Configure SMTP Transporter (Resend Alternative)
const transporter = nodemailer.createTransport({
  host: "${mailHost}",
  port: 587,
  secure: false, // STARTTLS
  auth: {
    user: "postmaster@${domain || "example.com"}",
    pass: "YOUR_MAILBOX_PASSWORD",
  },
});

// 2. Send email directly from your app
await transporter.sendMail({
  from: '"EduTok" <postmaster@${domain || "example.com"}>',
  to: "user@example.com",
  subject: "Welcome to EduTok!",
  html: "<h1>Welcome!</h1><p>Your account is ready to use.</p>",
});`,

    curl: `curl -X POST http://localhost:4000/api/mail/send \\
  -H "Authorization: Bearer ${apiKey}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "from": "postmaster@${domain || "example.com"}",
    "to": "user@example.com",
    "subject": "Welcome to EduTok",
    "html": "<p>Sent via Openship REST API</p>"
  }'`,

    python: `import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

msg = MIMEMultipart()
msg['From'] = "postmaster@${domain || "example.com"}"
msg['To'] = "user@example.com"
msg['Subject'] = "Welcome to EduTok!"
msg.attach(MIMEText("Welcome to your account!", "html"))

with smtplib.SMTP("${mailHost}", 587) as server:
    server.starttls()
    server.login("postmaster@${domain || "example.com"}", "YOUR_PASSWORD")
    server.send_message(msg)`,

    php: `<?php
// Send via standard PHP mail or PHPMailer
$to = "user@example.com";
$subject = "Welcome to EduTok";
$message = "<h1>Welcome to EduTok</h1>";
$headers = "From: postmaster@${domain || "example.com"}\\r\\n";
$headers .= "Content-Type: text/html; charset=UTF-8\\r\\n";

mail($to, $subject, $message, $headers);
?>`,
  };

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(codeSnippets[activeCodeTab]);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 1500);
    } catch {}
  };

  return (
    <div className="bg-card rounded-2xl border border-border/50 p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap pb-4 border-b border-border/40">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Key className="size-5 text-primary" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-foreground">API Key & Sending Integration</h3>
            <p className="text-xs text-muted-foreground">
              Send transactional emails from your apps via API or standard SMTP (Resend Alternative).
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-xs font-medium">
            <ShieldCheck className="size-3.5" />
            API Active
          </span>
        </div>
      </div>

      {/* API Key Box */}
      <div className="rounded-xl border border-border/60 bg-muted/20 p-4 space-y-2">
        <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
          <span>Secret API Key</span>
          <span>Never share your secret key publicly</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex-1 font-mono text-sm bg-background border border-border/80 rounded-lg px-3 py-2 text-foreground font-medium tracking-wide truncate">
            {apiKey}
          </div>
          <button
            type="button"
            onClick={handleCopyKey}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors"
          >
            {copiedKey ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
            {copiedKey ? "Copied!" : "Copy Key"}
          </button>
          <button
            type="button"
            onClick={handleRegenerateKey}
            title="Regenerate API Key"
            className="p-2 rounded-lg border border-border/60 bg-background text-muted-foreground hover:text-foreground transition-colors"
          >
            <RefreshCw className="size-4" />
          </button>
        </div>
      </div>

      {/* Connection Credentials Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="rounded-xl border border-border/50 bg-background p-3.5">
          <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">SMTP Host</p>
          <p className="text-sm font-semibold text-foreground mt-1 font-mono">{mailHost}</p>
        </div>
        <div className="rounded-xl border border-border/50 bg-background p-3.5">
          <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">SMTP Ports</p>
          <p className="text-sm font-semibold text-foreground mt-1 font-mono">587 (TLS) · 465 (SSL)</p>
        </div>
        <div className="rounded-xl border border-border/50 bg-background p-3.5">
          <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Default Sender</p>
          <p className="text-sm font-semibold text-foreground mt-1 font-mono truncate">
            postmaster@{domain || "example.com"}
          </p>
        </div>
      </div>

      {/* Code Snippets Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Code2 className="size-4 text-primary" />
            <h4 className="text-sm font-medium text-foreground">Send Email Code Snippets</h4>
          </div>
          <button
            type="button"
            onClick={handleCopyCode}
            className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline font-medium"
          >
            {copiedCode ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
            {copiedCode ? "Copied Snippet!" : "Copy Code"}
          </button>
        </div>

        {/* Language Tabs */}
        <div className="flex items-center gap-1.5 border-b border-border/40 pb-2">
          {(
            [
              { id: "node", label: "Node.js (Nodemailer)" },
              { id: "curl", label: "REST API (cURL)" },
              { id: "python", label: "Python" },
              { id: "php", label: "PHP" },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveCodeTab(tab.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                activeCodeTab === tab.id
                  ? "bg-primary/10 text-primary font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Code View */}
        <div className="relative rounded-xl border border-border/60 bg-slate-950 p-4 text-xs font-mono text-slate-200 overflow-x-auto">
          <pre>{codeSnippets[activeCodeTab]}</pre>
        </div>
      </div>
    </div>
  );
}
