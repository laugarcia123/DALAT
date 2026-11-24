import os
import uuid
import boto3
from botocore.exceptions import ClientError
from typing import Optional, Tuple
from pathlib import Path

# Cargar variables del entorno
ENV_PATH = Path(__file__).resolve().parent.parent / ".env"
env_config = {}
if ENV_PATH.exists():
    with open(ENV_PATH, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith("#") and "=" in line:
                k, v = line.split("=", 1)
                env_config[k.strip()] = v.strip()


R2_BUCKET_NAME = env_config.get("R2_BUCKET_NAME") or os.getenv("R2_BUCKET_NAME", "dalat-documentos")
R2_ENDPOINT_URL = env_config.get("R2_ENDPOINT_URL") or os.getenv("R2_ENDPOINT_URL")
R2_ACCESS_KEY_ID = env_config.get("R2_ACCESS_KEY_ID") or os.getenv("R2_ACCESS_KEY_ID")
R2_SECRET_ACCESS_KEY = env_config.get("R2_SECRET_ACCESS_KEY") or os.getenv("R2_SECRET_ACCESS_KEY")


class StorageService:
    _client = None

    @classmethod
    def get_client(cls):
        if cls._client is None and R2_ENDPOINT_URL and R2_ACCESS_KEY_ID and R2_SECRET_ACCESS_KEY:
            cls._client = boto3.client(
                "s3",
                endpoint_url=R2_ENDPOINT_URL,
                aws_access_key_id=R2_ACCESS_KEY_ID,
                aws_secret_access_key=R2_SECRET_ACCESS_KEY,
                region_name="auto"
            )
        return cls._client

    @classmethod
    def upload_file_bytes(
        cls,
        file_bytes: bytes,
        filename: str,
        user_id: int,
        content_type: str = "application/octet-stream"
    ) -> Tuple[str, str]:
        """
        Sube un archivo directamente al bucket de Cloudflare R2.
        Devuelve (object_key, presigned_download_url).
        """
        client = cls.get_client()
        unique_id = uuid.uuid4().hex[:12]
        clean_name = filename.replace(" ", "_")
        object_key = f"documentos/user_{user_id}/{unique_id}_{clean_name}"

        if client:
            try:
                client.put_object(
                    Bucket=R2_BUCKET_NAME,
                    Key=object_key,
                    Body=file_bytes,
                    ContentType=content_type
                )
                print(f"[Cloudflare R2] Archivo subido exitosamente: {object_key}")
                
                # Generar URL de descarga prefirmada válida por 7 días
                download_url = client.generate_presigned_url(
                    "get_object",
                    Params={"Bucket": R2_BUCKET_NAME, "Key": object_key},
                    ExpiresIn=604800  # 7 días
                )
                return object_key, download_url
            except Exception as e:
                print(f"[Cloudflare R2 Error] Falló subida a R2: {e}")

        # Fallback local seguro si R2 no estuviera disponible
        local_dir = Path(__file__).resolve().parent.parent / "uploads" / f"user_{user_id}"
        local_dir.mkdir(parents=True, exist_ok=True)
        local_path = local_dir / f"{unique_id}_{clean_name}"
        with open(local_path, "wb") as f:
            f.write(file_bytes)
        return object_key, f"/api/repositorio/archivos/{unique_id}_{clean_name}"

    @classmethod
    def get_presigned_url(cls, object_key: str, expires_in: int = 604800) -> Optional[str]:
        """Genera una URL temporal prefirmada para acceder al archivo en R2."""
        client = cls.get_client()
        if client and object_key.startswith("documentos/"):
            try:
                return client.generate_presigned_url(
                    "get_object",
                    Params={"Bucket": R2_BUCKET_NAME, "Key": object_key},
                    ExpiresIn=expires_in
                )
            except Exception as e:
                print(f"[Cloudflare R2 Presign Error] {e}")
        return None

    @classmethod
    def get_file_bytes(cls, object_key_or_url: str) -> Optional[bytes]:
        """Obtiene los bytes del archivo desde Cloudflare R2 o almacenamiento local."""
        if not object_key_or_url:
            return None

        client = cls.get_client()

        # Si viene una URL completa prefirmada de R2 o externa
        if object_key_or_url.startswith("http://") or object_key_or_url.startswith("https://"):
            try:
                import urllib.request
                with urllib.request.urlopen(object_key_or_url, timeout=30) as resp:
                    return resp.read()
            except Exception as e:
                print(f"[Storage Download URL Error] {e}")

        # Si viene como object_key (ej: documentos/user_1/...)
        clean_key = object_key_or_url
        if "documentos/" in clean_key:
            clean_key = "documentos/" + clean_key.split("documentos/", 1)[1]

        if client and clean_key.startswith("documentos/"):
            try:
                resp = client.get_object(Bucket=R2_BUCKET_NAME, Key=clean_key)
                return resp["Body"].read()
            except Exception as e:
                print(f"[Cloudflare R2 Download Error] {e}")

        # Fallback local en uploads/
        filename_only = clean_key.split("/")[-1].split("?")[0]
        local_base = Path(__file__).resolve().parent.parent / "uploads"
        if local_base.exists():
            for candidate in local_base.rglob(filename_only):
                if candidate.is_file():
                    try:
                        with open(candidate, "rb") as f:
                            return f.read()
                    except Exception:
                        pass

        return None

    @classmethod
    def delete_file(cls, object_key: str) -> bool:
        """Elimina un objeto de Cloudflare R2."""
        client = cls.get_client()
        if client and object_key.startswith("documentos/"):
            try:
                client.delete_object(Bucket=R2_BUCKET_NAME, Key=object_key)
                print(f"[Cloudflare R2] Archivo eliminado: {object_key}")
                return True
            except Exception as e:
                print(f"[Cloudflare R2 Delete Error] {e}")
        return False
