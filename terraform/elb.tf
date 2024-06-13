# ---------------------------------------------
# ELB - ALB
# ---------------------------------------------
resource "aws_lb" "alb" {
  name               = "${var.project}-${var.environment}-alb"
  internal           = false
  load_balancer_type = "application"
  security_groups = [
    aws_security_group.elb_sg.id
  ]
  subnets = [
    aws_subnet.public_subnet_1a.id,
    aws_subnet.public_subnet_1c.id
  ]
}

# ---------------------------------------------
# ELB - リスナー
# ---------------------------------------------
resource "aws_lb_listener" "alb_listener_http" {
  load_balancer_arn = aws_lb.alb.arn
  port              = var.http_port
  protocol          = "HTTP"

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.alb_target_group.arn
  }
}

resource "aws_lb_listener" "alb_listener_ws" {
  load_balancer_arn = aws_lb.alb.arn
  port              = var.ecs_ws_port
  protocol          = "HTTP"

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.alb_target_group_ws.arn
  }
}

# ---------------------------------------------
# ELB - リスナールール
# ---------------------------------------------
resource "aws_lb_listener_rule" "alb_listerner_rule" {
  listener_arn = aws_lb_listener.alb_listener_http.arn

  # 受け取ったトラフィックをターゲットグループへ受け渡す
  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.alb_target_group.arn
  }

  condition {
    path_pattern {
      values = ["*"]
    }
  }
}

resource "aws_lb_listener_rule" "alb_listerner_rule_ws" {
  listener_arn = aws_lb_listener.alb_listener_ws.arn

  # 受け取ったトラフィックをターゲットグループへ受け渡す
  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.alb_target_group_ws.arn
  }

  condition {
    path_pattern {
      values = ["*"]
    }
  }
}

# ---------------------------------------------
# ELB - ターゲットグループ
# ---------------------------------------------
resource "aws_lb_target_group" "alb_target_group" {
  name = "${var.project}-${var.environment}-tg"

  vpc_id = aws_vpc.vpc.id
  # ALBからECS
  port        = var.ecs_port
  protocol    = "HTTP"
  target_type = "ip"

  health_check {
    interval            = 30
    path                = var.elb_health_url
    port                = "traffic-port"
    protocol            = "HTTP"
    timeout             = 5
    healthy_threshold   = 3
    unhealthy_threshold = 2
    matcher             = "200"
  }

  tags = {
    Name    = "${var.project}-${var.environment}-tg"
    Project = var.project
    Env     = var.environment
  }
}

resource "aws_lb_target_group" "alb_target_group_ws" {
  name = "${var.project}-${var.environment}-tgw"

  vpc_id = aws_vpc.vpc.id
  # ALBからECS
  port        = var.ecs_ws_port
  protocol    = "HTTP"
  target_type = "ip"

  health_check {
    interval            = 30
    path                = "/api/hello"
    port                = "traffic-port"
    protocol            = "HTTP"
    timeout             = 5
    healthy_threshold   = 3
    unhealthy_threshold = 2
    matcher             = "200"
  }

  tags = {
    Name    = "${var.project}-${var.environment}-tgw"
    Project = var.project
    Env     = var.environment
  }
}
