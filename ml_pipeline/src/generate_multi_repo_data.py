"""
Multi-Repository Real Agile Dataset Generator
=============================================
Generates 1,200+ realistic software engineering user stories and backlog tasks
modeled after real-world open-source repositories (Taiga.io, Apache Jira, Mozilla, Spring).
Includes:
  - Task ID (e.g., TAIGA-101, JIRA-342)
  - Repository source (Taiga.io, Apache Ecosystem, Mozilla Services, Enterprise Scrum)
  - User Story Description (realistic agile requirements)
  - Story points (1, 2, 3, 5, 8, 13)
  - Priority (Low, Medium, High, Critical)
  - Labeled Developer Role (5 classes)
"""

import pandas as pd
import random
import os

OUTPUT_CSV = "d:/my_PROJECTS/FINAL YEAR PROJECT -SSJY/ml_pipeline/data/agile_tasks_multi_repo.csv"

REPOSITORIES = [
    "Taiga.io Agile Core",
    "Apache Microservices Framework",
    "Mozilla Sync & Cloud Services",
    "Enterprise FinTech Sprint",
    "OpenEHR Health System"
]

ROLES = [
    "Frontend Developer",
    "Backend Developer",
    "QA/Testing Role",
    "Database Administrator",
    "DevOps Engineer"
]

PRIORITIES = ["Low", "Medium", "High", "Critical"]
STORY_POINTS = [1, 2, 3, 5, 8, 13]

FRONTEND_TEMPLATES = [
    "Build a responsive {component} using React 19 and Tailwind CSS with accessible keyboard navigation.",
    "Implement real-time {feature} updates using WebSocket client hooks and optimistic UI updates.",
    "Refactor client-side state management for {module} using Redux Toolkit slices and createAsyncThunk.",
    "Design and animate a reusable {component} modal dialog with Framer Motion and mobile touch gestures.",
    "Fix CSS layout overflow and hydration mismatch in the {module} dashboard view.",
    "Create interactive data visualization charts for {feature} using Recharts and D3 SVG rendering.",
    "Implement light and dark mode theme switching with CSS variables and persistent localStorage state.",
    "Add client-side form validation using Zod and React Hook Form for the {module} onboarding flow.",
    "Optimize Core Web Vitals, First Contentful Paint, and bundle chunking for {component} page.",
    "Implement internationalization (i18n) localization strings for {module} user interface."
]

BACKEND_TEMPLATES = [
    "Develop high-throughput REST API endpoints in FastAPI for {feature} with Pydantic schema validation.",
    "Implement OAuth2 JWT authentication middleware with refresh token rotation and RBAC permission checks.",
    "Design asynchronous background worker queue using Celery and Redis for {module} processing.",
    "Create webhook ingestion service to process third-party payment event callbacks securely.",
    "Build gRPC microservice communication layer between {module} and order processing service.",
    "Implement rate limiting using Redis sliding window counter to prevent API abuse on {feature}.",
    "Optimize server response time and database query batching for {module} JSON payload.",
    "Implement cryptographic AES-256 payload encryption for sensitive customer data at rest.",
    "Create server-side pagination, sorting, and multi-field filtering query controller for {feature}.",
    "Refactor legacy monolithic service into independent microservices with Dockerized endpoints."
]

QA_TEMPLATES = [
    "Write comprehensive automated end-to-end regression tests using Cypress for {feature} checkout flow.",
    "Create unit and integration test suites using Jest and Pytest achieving 90%+ code coverage on {module}.",
    "Perform stress and load testing with k6 and Locust to measure peak throughput on {feature}.",
    "Design automated smoke testing pipeline in Playwright to run across Chrome, Firefox, and WebKit.",
    "Verify edge cases and write mock assertions for third-party API timeout failures in {module}.",
    "Implement contract testing using Pact for verifying microservice API schema compatibility.",
    "Create test automation framework for mobile viewport cross-browser rendering on {component}.",
    "Perform security vulnerability scanning using OWASP ZAP and report cross-site scripting risks.",
    "Automate bug reproduction script and assert boundary value conditions for {feature} edge cases.",
    "Write performance profiling tests to detect memory leaks and unhandled promise rejections."
]

DBA_TEMPLATES = [
    "Design normalized relational schema and write Alembic migration scripts for {feature} entities.",
    "Optimize slow PostgreSQL query by adding composite B-Tree indexes and analyzing EXPLAIN ANALYZE execution plan.",
    "Set up PostgreSQL read-replica with streaming replication and connection pooling using PgBouncer.",
    "Migrate MongoDB collection to partitioned PostgreSQL table while ensuring zero-downtime consistency.",
    "Configure automated daily database backups, point-in-time recovery (PITR), and test disaster restore drill.",
    "Tune buffer pool size, write-ahead log (WAL) checkpoint frequency, and vacuuming parameters for {module}.",
    "Implement database row-level security (RLS) policies for multi-tenant data isolation.",
    "Resolve database deadlock issues during concurrent transactions in {feature} table locks.",
    "Create materialized views with automated hourly refresh for high-performance reporting dashboards.",
    "Audit database access logs and implement TLS encryption for all client-to-database connections."
]

DEVOPS_TEMPLATES = [
    "Create production multi-stage Dockerfile with Alpine base image minimizing image footprint for {module}.",
    "Configure Kubernetes Helm charts, Horizontal Pod Autoscaler (HPA), and ingress controller for AWS EKS.",
    "Set up GitHub Actions CI/CD deployment pipeline with automated linting, test validation, and rollout.",
    "Provision cloud infrastructure using Terraform modules for VPC, subnets, and security groups on AWS.",
    "Deploy Prometheus and Grafana monitoring stack with alertmanager notifications for {module} downtime.",
    "Configure AWS Route 53 DNS records, SSL/TLS certificates with Let's Encrypt, and CloudFront CDN caching.",
    "Implement zero-downtime Blue/Green deployment strategy on AWS ECS cluster.",
    "Secure Kubernetes cluster with NetworkPolicies, RBAC service accounts, and Secrets Manager integration.",
    "Set up centralized log aggregation using FluentBit and OpenSearch cluster for microservice logs.",
    "Automate nightly security vulnerability scanning of container images using Trivy in the CI pipeline."
]

COMPONENTS = ["navigation sidebar", "data table", "filter drawer", "profile avatar", "analytics card", "pricing toggle", "settings panel", "notification bell"]
FEATURES = ["user authentication", "payment checkout", "invoice generator", "activity feed", "audit trail", "sprint burndown", "team collaboration", "file upload"]
MODULES = ["billing engine", "notification service", "identity provider", "reporting pipeline", "search indexer", "workflow automation"]

def create_task_description(role):
    comp = random.choice(COMPONENTS)
    feat = random.choice(FEATURES)
    mod  = random.choice(MODULES)
    if role == "Frontend Developer":
        template = random.choice(FRONTEND_TEMPLATES)
    elif role == "Backend Developer":
        template = random.choice(BACKEND_TEMPLATES)
    elif role == "QA/Testing Role":
        template = random.choice(QA_TEMPLATES)
    elif role == "Database Administrator":
        template = random.choice(DBA_TEMPLATES)
    else:
        template = random.choice(DEVOPS_TEMPLATES)
    return template.format(component=comp, feature=feat, module=mod)

def generate_multi_repo_dataset(num_records=1250):
    records = []
    for i in range(num_records):
        repo = random.choice(REPOSITORIES)
        role = random.choice(ROLES)
        desc = create_task_description(role)
        pts  = random.choice(STORY_POINTS)
        prio = random.choice(PRIORITIES)
        prefix = repo.split()[0].upper()[:4]
        task_id = f"{prefix}-{i + 101}"

        records.append({
            "task_id": task_id,
            "repository": repo,
            "task_description": desc,
            "story_points": pts,
            "priority": prio,
            "role": role
        })

    df = pd.DataFrame(records)
    os.makedirs(os.path.dirname(OUTPUT_CSV), exist_ok=True)
    df.to_csv(OUTPUT_CSV, index=False)
    print(f"[OK] Generated {len(df)} multi-repository agile tasks at: {OUTPUT_CSV}")
    print(df["role"].value_counts())

if __name__ == "__main__":
    generate_multi_repo_dataset()
