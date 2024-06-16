# ---------------------------------------------
# Security Group - ELB
# ---------------------------------------------
resource "aws_security_group" "elb_sg" {
  name        = "${var.project}-${var.environment}-elb-sg"
  description = "ELB security group"
  vpc_id      = aws_vpc.vpc.id

  tags = {
    Name    = "${var.project}-${var.environment}-elb-sg"
    Project = var.project
    Env     = var.environment
  }
}

# ---------------------------------------------
# Security Rule - ELB
# ---------------------------------------------
resource "aws_security_group_rule" "elb_in_http" {
  security_group_id = aws_security_group.elb_sg.id

  type        = var.security_in_bound
  protocol    = "tcp"
  from_port   = var.http_port
  to_port     = var.http_port
  cidr_blocks = [var.igw_address]
}

resource "aws_security_group_rule" "elb_in_https" {
  security_group_id = aws_security_group.elb_sg.id

  type        = var.security_in_bound
  protocol    = "tcp"
  from_port   = var.https_port
  to_port     = var.https_port
  cidr_blocks = [var.igw_address]
}

resource "aws_security_group_rule" "elb_out_all" {
  security_group_id = aws_security_group.elb_sg.id

  type        = var.security_out_bound
  protocol    = "-1"
  from_port   = 0
  to_port     = 0
  cidr_blocks = [var.igw_address]
}

# ---------------------------------------------
# Security Group - ECS
# ---------------------------------------------
resource "aws_security_group" "ecs_sg" {
  name        = "${var.project}-${var.environment}-ecs-sg"
  description = "ecs security group"
  vpc_id      = aws_vpc.vpc.id

  tags = {
    Name    = "${var.project}-${var.environment}-ecs-sg"
    Project = var.project
    Env     = var.environment
  }
}

# ---------------------------------------------
# Security Rule - ECS
# ---------------------------------------------
resource "aws_security_group_rule" "ecs_in_alb" {
  security_group_id = aws_security_group.ecs_sg.id

  type                     = var.security_in_bound
  protocol                 = "tcp"
  from_port                = var.ecs_port
  to_port                  = var.ecs_port
  source_security_group_id = aws_security_group.elb_sg.id
}

resource "aws_security_group_rule" "ens_in_ws" {
  security_group_id = aws_security_group.ecs_sg.id

  type                     = var.security_in_bound
  protocol                 = "tcp"
  from_port                = var.ecs_ws_port
  to_port                  = var.ecs_ws_port
  source_security_group_id = aws_security_group.elb_sg.id
}

resource "aws_security_group_rule" "ens_in_health" {
  security_group_id = aws_security_group.ecs_sg.id

  type                     = var.security_in_bound
  protocol                 = "tcp"
  from_port                = var.ecs_ws_health_port
  to_port                  = var.ecs_ws_health_port
  source_security_group_id = aws_security_group.elb_sg.id
}

resource "aws_security_group_rule" "ecs_out_all" {
  security_group_id = aws_security_group.ecs_sg.id

  type        = var.security_out_bound
  protocol    = "-1"
  from_port   = 0
  to_port     = 0
  cidr_blocks = [var.igw_address]
}

