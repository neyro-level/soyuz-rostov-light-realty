# Open questions

| ID | Question | Status | Note |
| --- | --- | --- | --- |
| OQ-LEAD-SMTP | SMTP/e-mail preflight for `LEADS_MODE=direct` | OPEN | Live production mailbox is forbidden in this plan. L4 uses a mock LeadSink; destination address is taken from `site.config` email. Close after owner SMTP env (not Secret Master Payload) without sending live mail from this graph. |
