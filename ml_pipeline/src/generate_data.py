import pandas as pd
import random

roles = [
    "Frontend Developer",
    "Backend Developer",
    "QA/Testing Role",
    "Database Administrator",
    "DevOps Engineer"
]

frontend_keywords = ["React", "UI", "CSS", "Tailwind", "component", "button", "responsive", "frontend", "view", "page", "modal", "animation", "layout", "design"]
backend_keywords = ["API", "REST", "endpoint", "Node", "FastAPI", "server", "authentication", "middleware", "route", "backend", "JSON", "controller"]
qa_keywords = ["test", "unit test", "integration test", "QA", "bug", "fix", "coverage", "Jest", "Selenium", "Cypress", "assertion", "mock"]
db_keywords = ["SQL", "schema", "database", "MongoDB", "PostgreSQL", "query", "migration", "index", "table", "collection", "ORM", "Mongoose"]
devops_keywords = ["CI/CD", "Docker", "Kubernetes", "deploy", "pipeline", "AWS", "cloud", "infrastructure", "serverless", "container", "action", "yaml"]

def generate_task(role):
    if role == "Frontend Developer":
        pool = frontend_keywords + ["build", "create", "implement", "update"]
    elif role == "Backend Developer":
        pool = backend_keywords + ["develop", "create", "implement", "secure"]
    elif role == "QA/Testing Role":
        pool = qa_keywords + ["write", "ensure", "verify", "check"]
    elif role == "Database Administrator":
        pool = db_keywords + ["design", "optimize", "update", "migrate"]
    else:
        pool = devops_keywords + ["setup", "configure", "monitor", "deploy"]
        
    words = random.sample(pool, k=random.randint(4, 7))
    return " ".join(words).capitalize() + " for the new feature."

data = []
for _ in range(500):
    role = random.choice(roles)
    task = generate_task(role)
    data.append({"task_description": task, "role": role})

df = pd.DataFrame(data)
df.to_csv("d:/my_PROJECTS/FINAL YEAR PROJECT -SSJY/ml_pipeline/data/agile_tasks.csv", index=False)
print("Synthetic dataset generated: agile_tasks.csv")
