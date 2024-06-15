FROM node:20

# 必要なパッケージのインストール
RUN apt-get update && apt-get install -y curl bash

# Bunのインストール
RUN curl -fsSL https://bun.sh/install | bash

# Bunのパスを環境変数に追加
ENV BUN_INSTALL="/root/.bun"
ENV PATH="$BUN_INSTALL/bin:$PATH"

WORKDIR /app

COPY package.json bun.lockb ./

# Bunを使って依存関係をインストール
RUN bun install

COPY . .

# Prismaのクライアントを生成
RUN bunx prisma generate

EXPOSE 3000
EXPOSE 3001
EXPOSE 3002

CMD ["bun", "dev"]
