# Open questions

| ID | Question | Status | Note |
| --- | --- | --- | --- |
| OQ-LEAD-SMTP | SMTP/e-mail preflight for `LEADS_ROUTE=direct` | OPEN | Live production mailbox is forbidden in this plan. Destination address is taken from `site.config` email. Close after owner SMTP env (not Secret Master Payload) without sending live mail from this graph. |
| OQ-LEGAL-TEXT | Approved privacy/consent legal texts | OPEN | Starter pages stay honest stubs. This is a production-release blocker only; it does not block SOUZ-TEMPLATE-HARDENING. |
