# ---------------------------------------------
# Terraform configuration
# ---------------------------------------------
terraform {
  required_version = ">=1.6"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

# ---------------------------------------------
# Provider
# ---------------------------------------------
provider "aws" {
  profile = "terraform"
  region  = "ap-northeast-1"
}

# ---------------------------------------------
# Variables
# ---------------------------------------------
variable "project" {
  type = string
}

variable "environment" {
  type = string
}

variable "vpc_address" {
  type = string
}

variable "vpc_region" {
  type = string
}

variable "public_1a_address" {
  type = string
}

variable "public_1c_address" {
  type = string
}

variable "private_1a_address" {
  type = string
}

variable "private_1c_address" {
  type = string
}

variable "igw_address" {
  type = string
}

variable "security_in_bound" {
  type = string
}

variable "security_out_bound" {
  type = string
}

variable "http_port" {
  type = number
}

variable "https_port" {
  type = number
}

variable "ecs_port" {
  type = number
}

variable "ecs_ws_port" {
  type = number
}

variable "ecs_https_ws_port" {
  type = number
}

variable "ecs_desired_count" {
  type = number
}

variable "ecs_cpu" {
  type = number
}

variable "ecs_memory" {
  type = number
}

variable "ecs_container_name" {
  type = string
}

variable "ecr_repository_name" {
  type = string
}

variable "ecr_repository_uri" {
  type = string
}

variable "secret_cors_address" {
  type = string
}

variable "secret_port" {
  type = number
}

variable "secret_ws_port" {
  type = number
}

variable "secret_supabase_url" {
  type = string
}

variable "secret_supabase_anon_key" {
  type = string
}

variable "secret_base_url" {
  type = string
}

variable "secret_supabase_reference_id" {
  type = string
}

variable "elb_health_url" {
  type = string
}

variable "domain" {
  type = string
}
