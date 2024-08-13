variable "bucket_name" {
  type = string
}

resource "google_storage_bucket" "bucket" {
  name                        = var.bucket_name
  location                    = "asia-northeast1"
  storage_class               = "STANDARD"
  uniform_bucket_level_access = true
}
