# ---------------------------------------------
# ECR - リポジトリ
# ---------------------------------------------
# Amazon Elastic Container Registry(ECR)リポジトリを作成します。
resource "aws_ecr_repository" "ecr_repository" {
  name = "${var.project}-${var.environment}-ecr-repo"
  # 同一タグのイメージの上書きが可能
  image_tag_mutability = "MUTABLE"
}