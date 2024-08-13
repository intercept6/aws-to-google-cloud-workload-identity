variable "aws_writer_role_name" {
  type = string
}

resource "google_storage_bucket_iam_binding" "writer_bucket_iam_binding" {
  bucket = google_storage_bucket.bucket.name
  role   = "roles/storage.objectCreator"
  members = [
    "principalSet://iam.googleapis.com/projects/${data.google_project.project.number}/locations/global/workloadIdentityPools/${google_iam_workload_identity_pool.id_pool.workload_identity_pool_id}/attribute.aws_role/${var.aws_writer_role_name}"
  ]
}

variable "aws_reader_role_name" {
  type = string
}

resource "google_storage_bucket_iam_binding" "reader_bucket_iam_binding" {
  bucket = google_storage_bucket.bucket.name
  role   = "roles/storage.objectViewer"
  members = [
    "principalSet://iam.googleapis.com/projects/${data.google_project.project.number}/locations/global/workloadIdentityPools/${google_iam_workload_identity_pool.id_pool.workload_identity_pool_id}/attribute.aws_role/${var.aws_reader_role_name}"
  ]
}
