resource "google_iam_workload_identity_pool" "id_pool" {
  workload_identity_pool_id = "my-id-pool"
}

variable "aws_account_id" {
  type = string
}

resource "google_iam_workload_identity_pool_provider" "id_pool_provider" {
  workload_identity_pool_id          = google_iam_workload_identity_pool.id_pool.workload_identity_pool_id
  workload_identity_pool_provider_id = "my-id-provider"
  attribute_mapping = {
    "google.subject"        = "assertion.arn"
    "attribute.aws_role"    = "assertion.arn.extract('assumed-role/{role}/')"
    "attribute.aws_session" = "assertion.arn.extract('assumed-role/{role_and_session}').extract('/{session}')"
  }
  aws {
    account_id = var.aws_account_id
  }
}

