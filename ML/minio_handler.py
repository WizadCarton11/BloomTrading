from minio import Minio
from minio.error import S3Error
import os
import logging

class MinIOHandler:
    def __init__(self, endpoint, access_key, secret_key, bucket_name, secure=False):
        self.endpoint = endpoint
        self.access_key = access_key
        self.secret_key = secret_key
        self.bucket_name = bucket_name
        self.secure = secure

        self.logger = logging.getLogger(__name__)
        self.client = Minio(
            endpoint=self.endpoint,
            access_key=self.access_key,
            secret_key=self.secret_key,
            secure=self.secure
        )

        self._ensure_bucket()

    def _ensure_bucket(self):
        """Ensure the bucket exists."""
        if not self.client.bucket_exists(self.bucket_name):
            self.client.make_bucket(self.bucket_name)
            self.logger.info(f"🪣 Created bucket: {self.bucket_name}")
        else:
            self.logger.info(f"🪣 Bucket '{self.bucket_name}' already exists.")

    def upload_file(self, file_path, object_name=None, content_type="application/octet-stream"):
        """Upload a file to MinIO."""
        if not os.path.isfile(file_path):
            raise FileNotFoundError(f"File not found: {file_path}")

        object_name = object_name or os.path.basename(file_path)

        try:
            self.client.fput_object(
                bucket_name=self.bucket_name,
                object_name=object_name,
                file_path=file_path,
                content_type=content_type
            )
            self.logger.info(f"✅ Uploaded '{file_path}' as '{object_name}' to bucket '{self.bucket_name}'")
        except S3Error as e:
            self.logger.error(f"❌ S3 Error during upload: {e}")
            raise e

    def download_file(self, object_name, destination_path):
        """Download a file from MinIO."""
        try:
            self.client.fget_object(
                bucket_name=self.bucket_name,
                object_name=object_name,
                file_path=destination_path
            )
            self.logger.info(f"✅ Downloaded '{object_name}' to '{destination_path}'")
        except S3Error as e:
            self.logger.error(f"❌ S3 Error during download: {e}")
            raise e
    
    def delete_file_from_minio(self, object_name):
        try:
            self.client.remove_object(self.bucket_name, object_name)
            self.logger.info(f"✅ Deleted '{object_name}' from bucket '{self.bucket_name}'")
        except S3Error as e:
            self.logger.error(f"❌ S3 Error during deletion: {e}")
            raise e
    
    def delete_file_from_local(self, file_path):
        try:
            os.remove(file_path)
            self.logger.info(f"✅ Deleted '{file_path}' from local")
        except FileNotFoundError:
            self.logger.warning(f"❌ File '{file_path}' not found on local")
