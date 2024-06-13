# AWS

## ECRにデプロイ

```bash
# Dockerイメージのビルド
docker build -t nextjs-hono-back-messanger-app .

# ECRにログイン
aws ecr get-login-password --region <your-region> | docker login --username AWS --password-stdin <your-account-id>.dkr.ecr.<your-region>.amazonaws.com

# Dockerイメージのタグ付け
docker tag hono-app:latest <your-account-id>.dkr.ecr.<your-region>.amazonaws.com/<your-repo-name>:latest

# Dockerイメージのプッシュ
docker push <your-account-id>.dkr.ecr.<your-region>.amazonaws.com/<your-repo-name>:latest
```

※ AWS CLIの設定は割愛