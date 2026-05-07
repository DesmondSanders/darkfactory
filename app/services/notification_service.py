import smtplib
from email.mime.text import MIMEText
from app.config import settings
from app.models import DraftPackage


class NotificationService:
    def send_draft_for_approval(self, draft: DraftPackage):
        subject = f"[FDE Agent] Weekly Draft Ready: {draft.week_key}"
        body = f"""Your weekly LinkedIn draft is ready for review.\n\nTitle: {draft.title}\n\n{draft.body}\n\nManual publishing required (auto-publish disabled).\n"""
        if not settings.smtp_host:
            print('SMTP not configured. Draft notification fallback to stdout.')
            print(subject)
            print(body)
            return

        msg = MIMEText(body)
        msg['Subject'] = subject
        msg['From'] = settings.smtp_from
        msg['To'] = settings.user_email

        with smtplib.SMTP(settings.smtp_host, settings.smtp_port) as server:
            server.starttls()
            server.login(settings.smtp_user, settings.smtp_pass)
            server.sendmail(settings.smtp_from, [settings.user_email], msg.as_string())
