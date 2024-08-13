terraform {
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "5.40.0"
    }
  }
}

variable "google_project_id" {
  type = string
}

provider "google" {
  project = var.google_project_id
}

data "google_project" "project" {
}
