# Security Policy

## Supported Versions

We release patches for security vulnerabilities. Currently supported versions are:

| Version | Supported          |
| ------- | ------------------ |
| 0.1.x   | :white_check_mark: |

## Reporting a Vulnerability

We take the security of MSSQL MCP Server seriously. If you believe you have found a security
vulnerability, please report it to us as described below.

**Please do not report security vulnerabilities through public GitHub issues.**

Instead, please report them via email to [security@yourdomain.com] (replace with appropriate
contact).

You should receive a response within 48 hours. If for some reason you do not, please follow up via
email to ensure we received your original message.

Please include the requested information listed below (as much as you can provide) to help us better
understand the nature and scope of the possible issue:

- Type of issue (e.g. buffer overflow, SQL injection, cross-site scripting, etc.)
- Full paths of source file(s) related to the manifestation of the issue
- The location of the affected source code (tag/branch/commit or direct URL)
- Any special configuration required to reproduce the issue
- Step-by-step instructions to reproduce the issue
- Proof-of-concept or exploit code (if possible)
- Impact of the issue, including how an attacker might exploit it

This information will help us triage your report more quickly.

## Preferred Languages

We prefer all communications to be in English.

## Security Update Process

1. The security report is received and assigned to an owner
2. The problem is confirmed and a list of affected versions is determined
3. Code is audited to find any similar problems
4. Fixes are prepared for all supported releases
5. New versions are released and notifications are sent

## Security Best Practices

When using MSSQL MCP Server in your environment:

1. **Environment Variables**

   - Never commit sensitive environment variables
   - Use secure secrets management in production
   - Rotate credentials regularly

2. **Database Access**

   - Use least privilege principle
   - Enable TLS/SSL encryption
   - Use strong passwords
   - Implement proper access controls

3. **Query Security**

   - Always use parameterized queries
   - Validate all inputs
   - Limit query execution time
   - Monitor query patterns

4. **Network Security**

   - Use firewalls to restrict access
   - Enable encryption in transit
   - Monitor network traffic
   - Use VPNs or private networks when possible

5. **Logging and Monitoring**
   - Enable security logging
   - Monitor for suspicious activity
   - Implement alerts for security events
   - Maintain audit trails

## Disclosure Policy

When we receive a security bug report, we will:

1. Confirm the problem and determine affected versions
2. Audit code to find any similar problems
3. Prepare fixes for all supported versions
4. Release new versions as soon as possible

## Comments on this Policy

If you have suggestions on how this process could be improved, please submit a pull request.
