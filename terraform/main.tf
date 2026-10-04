terraform {
  required_version = "~> 1.16"

  backend "s3" {
    bucket       = ""
    key          = ""
    region       = ""
    use_lockfile = true
    encrypt      = true
  }

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 6.66"
    }
    # Zips the built Lambda bundles (see api.tf)
    archive = {
      source  = "hashicorp/archive"
      version = "~> 2.8"
    }
  }
}

# Configure the default AWS provider
provider "aws" {
  region = var.aws_region
}
