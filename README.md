
# My Messanger API

# Tech
---

- Backend
  - Hono
  - TypeScript
- DB + Authentication
  - Supabase
- ORM
  - Prisma ORM
- Cloud
  - AWS
- IaC
  - Terraform
- Domain(お名前.com)

# AWS

以下をTerraformで構築。ドメインはお名前.comで購入。

- AWS
  - ECS or Fargate
  - ELB(ALB)
  - Route53
  - ACM
  - CloudWatch
  - VPC
    - Public Subnet
    - Private Subnet
    - Route Table
    - IGW
  - Securty Group
  - IAM
  - Secret Manager

# Memo
---

- リアルタイム通信はWebSocketを使用することに決定。
  - WebSocket(採用)
  - Push(不採用)
- AWSを使用。とりあえず、HTTPSでアクセスできるところまで。
- カスタムドメインをお名前.comで購入。

# TODO
---

- まだ移行していない機能は後に移行する。

- CICDはひとまずGitHub Actions。AWSECRにコンテナイメージをプッシュする予定。

# Execute
---

docker-compose.yml に Honoコンテナを設定して使用すること

# URL
---

- Bun

https://bun.sh/guides/ecosystem/nextjs

- Hono

https://hono.dev/getting-started/basic

- Supabase

https://supabase.com

- Prisma

https://www.prisma.io

- AWS

https://aws.amazon.com/jp/console/

- お名前.com

https://cp.onamae.ne.jp/login