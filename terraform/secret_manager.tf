# ---------------------------------------------
# Secret Manager - 環境変数
# ---------------------------------------------
resource "aws_secretsmanager_secret" "hono_env" {
  name = "hono-env-secret"
}

resource "aws_secretsmanager_secret_version" "hono_env" {
  secret_id = aws_secretsmanager_secret.hono_env.id
  secret_string = jsonencode({
    CORS_ADDRESS                  = var.secret_cors_address,
    PORT                          = var.secret_port,
    WS_PORT                       = var.secret_ws_port,
    PUSHER_APP_ID                 = "",
    PUSHER_KEY                    = "",
    PUSHER_SECRET                 = "",
    PUSHER_CLUSTER                = "",
    NEXT_PUBLIC_SUPABASE_URL      = var.secret_supabase_url,
    NEXT_PUBLIC_SUPABASE_ANON_KEY = var.secret_supabase_anon_key,
    NEXT_PUBLIC_BASE_URL          = var.secret_base_url,
    SUPABASE_REFERENCE_ID         = var.secret_supabase_reference_id,
  })
}

data "aws_secretsmanager_secret" "hono_env" {
  name = aws_secretsmanager_secret.hono_env.name
}

data "aws_secretsmanager_secret_version" "hono_env" {
  secret_id = data.aws_secretsmanager_secret.hono_env.id
}

