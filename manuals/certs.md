# 自己証明書の作成の仕方

wsではなく、wssプロトコルで動かすときは自己証明書が必要。
以下コマンドを実行し、自己証明書を発行する。

```bash
openssl req -x509 -newkey rsa:2048 -keyout key.pem -out cert.pem -days 365 -nodes
```