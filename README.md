# My cool Service A

## Deploying to Cloud Run

This branch (`cloud-run`) deploys the Docker image to **Google Cloud Run** via
`.github/workflows/cloud-run-deploy.yml`, which runs on every `v*` tag push. It:

1. Builds the image from the `Dockerfile`
2. Pushes it to **Artifact Registry**
3. Deploys it to **Cloud Run** as service `service-a`
4. Smoke-tests `GET /hello/test` against the deployed URL

Before the first tag push, you need to do a one-time setup in GCP and in this
repo's GitHub settings.

### 1. One-time GCP setup

Run these with the [gcloud CLI](https://cloud.google.com/sdk/docs/install),
logged in to the project below:

```bash
# --- fill these in ---
PROJECT_ID="gcp-demo-400419"
REGION="europe-west3"
AR_REPO="service-a"
SA_NAME="cloud-run-deployer"
SA_EMAIL="${SA_NAME}@${PROJECT_ID}.iam.gserviceaccount.com"

gcloud config set project "$PROJECT_ID"

# 1. Enable the required APIs
gcloud services enable \
  artifactregistry.googleapis.com \
  run.googleapis.com \
  iam.googleapis.com

# 2. Create the Artifact Registry Docker repo
gcloud artifacts repositories create "$AR_REPO" \
  --repository-format=docker \
  --location="$REGION" \
  --description="Images for service-a"

# 3. Create the deploy service account
gcloud iam service-accounts create "$SA_NAME" \
  --display-name="Cloud Run deployer (service-a)"

# 4. Grant it the roles it needs
gcloud projects add-iam-policy-binding "$PROJECT_ID" \
  --member="serviceAccount:${SA_EMAIL}" \
  --role="roles/artifactregistry.writer"

gcloud projects add-iam-policy-binding "$PROJECT_ID" \
  --member="serviceAccount:${SA_EMAIL}" \
  --role="roles/run.admin"

gcloud projects add-iam-policy-binding "$PROJECT_ID" \
  --member="serviceAccount:${SA_EMAIL}" \
  --role="roles/iam.serviceAccountUser"

# 5. Create and download its key
gcloud iam service-accounts keys create sa-key.json \
  --iam-account="$SA_EMAIL"
```

> `roles/run.admin` + `roles/iam.serviceAccountUser` are granted at the project
> level here, which lets this service account manage *any* Cloud Run service and
> act as *any* service account in the project. That's fine for a demo project,
> but for production you'd want to scope these down to just the `service-a`
> resource instead.

### 2. Wire the credentials into GitHub Actions

Either via the GitHub UI (**Settings → Secrets and variables → Actions**), or
with the [`gh` CLI](https://cli.github.com/) if you have it authenticated:

```bash
gh secret set GCP_CLOUDRUN_SA_KEY < sa-key.json
gh variable set GCP_PROJECT_ID --body "$PROJECT_ID"
gh variable set GCP_REGION --body "$REGION"
gh variable set AR_REPO --body "$AR_REPO"

# delete the local key once it's uploaded — don't leave it on disk
rm sa-key.json
```

| Name                | Type     | Value                                  |
|---------------------|----------|-----------------------------------------|
| `GCP_CLOUDRUN_SA_KEY` | Secret | contents of `sa-key.json`               |
| `GCP_PROJECT_ID`     | Variable | `gcp-demo-400419`                       |
| `GCP_REGION`         | Variable | e.g. `europe-west3`                     |
| `AR_REPO`            | Variable | Artifact Registry repo name, e.g. `service-a` |

### 3. Deploy

Push a tag matching `v*` to trigger the workflow:

```bash
git tag v1.0.0
git push origin v1.0.0
```
