# NetSuite Integration Patterns

Choose the right tool for connecting external systems to NetSuite:

| Tool | Best For... | Direction | Data Volume |
| :--- | :--- | :--- | :--- |
| **CSV Import** | One-time migration or manual weekly batches | Inbound | High |
| **SuiteTalk (SOAP/REST)** | Standard ERP integrations (Shopify, Salesforce) | Bi-directional | Medium |
| **RESTlets** | Custom mobile apps, complex external logic | Bi-directional | Medium |
| **SuiteQL** | High-speed read-only data extraction | Outbound | High |
| **File Drag & Drop** | User-driven document uploads | Inbound | Low |

## Best Practices
1. **Use Token-Based Authentication (TBA)** or OAuth 2.0. Never use password-based auth.
2. **Handle Concurrency:** Be prepared to handle `SSS_REQUEST_LIMIT_EXCEEDED` errors.
3. **Use Custom Records** for staging incoming data before processing it into financial records.
