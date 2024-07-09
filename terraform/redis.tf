# # ---------------------------------------------
# # Elasticache Subnet Group
# # ---------------------------------------------
# resource "aws_elasticache_subnet_group" "elasticache_subnet_group" {
#   name = "${var.project}-${var.environment}-elasticache-subnet-group"

#   subnet_ids = [
#     aws_subnet.private_subnet_1a.id,
#     aws_subnet.private_subnet_1c.id
#   ]

#   tags = {
#     Name    = "${var.project}-${var.environment}-elasticache-subnet-group"
#     Project = var.project
#     Env     = var.environment
#   }
# }

# # ---------------------------------------------
# # Elasticache Security Group
# # ---------------------------------------------
# resource "aws_security_group" "elasticache_sg" {
#   vpc_id = aws_vpc.vpc.id

#   ingress {
#     from_port   = var.redis_port
#     to_port     = var.redis_port
#     protocol    = "tcp"
#     cidr_blocks = [aws_vpc.vpc.cidr_block]
#   }

#   egress {
#     from_port   = 0
#     to_port     = 0
#     protocol    = "-1"
#     cidr_blocks = ["0.0.0.0/0"]
#   }

#   tags = {
#     Name    = "${var.project}-${var.environment}-elasticache-sg"
#     Project = var.project
#     Env     = var.environment
#   }
# }

# # ---------------------------------------------
# # Elasticache Parameter Group
# # ---------------------------------------------
# resource "aws_elasticache_parameter_group" "redis_param_group" {
#   name   = "${var.project}-${var.environment}-redis-param-group"
#   family = var.redis_family

#   parameter {
#     name  = "maxmemory-policy"
#     value = "allkeys-lru"
#   }

#   tags = {
#     Name    = "${var.project}-${var.environment}-redis-param-group"
#     Project = var.project
#     Env     = var.environment
#   }
# }

# # ---------------------------------------------
# # Elasticache Cluster
# # ---------------------------------------------
# resource "aws_elasticache_cluster" "elasticache_cluster_redis_cluster" {
#   cluster_id           = "${var.project}-${var.environment}-redis-cluster"
#   engine               = "redis"
#   node_type            = var.redis_node_type
#   num_cache_nodes      = 1
#   subnet_group_name    = aws_elasticache_subnet_group.elasticache_subnet_group.name
#   security_group_ids   = [aws_security_group.elasticache_sg.id]
#   parameter_group_name = aws_elasticache_parameter_group.redis_param_group.name

#   snapshot_retention_limit = 5
#   snapshot_window          = var.redis_snapshot_range

#   tags = {
#     Name    = "${var.project}-${var.environment}-redis-cluster"
#     Project = var.project
#     Env     = var.environment
#   }
# }

# output "redis_endpoint" {
#   value       = aws_elasticache_cluster.elasticache_cluster_redis_cluster.cache_nodes[0].address
#   description = "The endpoint of the Redis cluster"
# }

# output "redis_port" {
#   value       = aws_elasticache_cluster.elasticache_cluster_redis_cluster.port
#   description = "The port of the Redis cluster"
# }
