
# My Messanger API

# Tech
---

- Backend
  - Hono
  - TypeScript
- DB + Authentication
  - Supabase
- ORM
  - Prisma
- AWS
- Terraform

# Memo
---

- リアルタイム通信はWebSocketを使用することに決定。
  - WebSocket(採用)
  - Push(不採用)

# TODO
---

- まだ移行していない機能は後に移行する。

- BackendのインフラはAWS。TerraformのIaCを利用する。

- CICDはひとまずGitHub Actions。AWSECRにコンテナイメージをプッシュする予定。s

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