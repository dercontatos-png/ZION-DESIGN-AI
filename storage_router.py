import asyncio
import json
import os
from pathlib import Path
from typing import Any, Dict, List, Optional
import uuid

from fastapi import (
    APIRouter,
    Cookie,
    Depends,
    File,
    Form,
    Header,
    HTTPException,
    Query,
    Request,
    UploadFile,
    status,
)
from fastapi.responses import FileResponse, JSONResponse, RedirectResponse, StreamingResponse
import time
import jwt
from jwt.exceptions import ExpiredSignatureError, InvalidTokenError, PyJWTError

# ==========================================
# Configuration & Security Settings
# ==========================================
SECRET_KEY = os.getenv("JWT_SECRET_KEY", "my_super_secret")
ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
COOKIE_NAME = "__Host-db.sessao"

# Base storage directory (defaults to ./local_storage)
STORAGE_BASE_DIR = Path(os.getenv("STORAGE_BASE_DIR", "./local_storage")).resolve()

# In-memory generation jobs store for SSE streaming & status
generation_jobs: Dict[str, Dict[str, Any]] = {}

router = APIRouter()


# ==========================================
# Authentication Dependency
# ==========================================
async def get_current_user(
    authorization: Optional[str] = Header(default=None),
    token_cookie: Optional[str] = Cookie(default=None, alias=COOKIE_NAME),
) -> dict:
    """
    Extracts authentication credentials from either:
    1. 'Authorization: Bearer <token>' header
    2. '__Host-db.sessao' session cookie
    Raises HTTPException(401) if credentials are missing, invalid, or expired.
    """
    raw_token: Optional[str] = None
    if authorization:
        if authorization.lower().startswith("bearer "):
            raw_token = authorization.split(" ", 1)[1].strip()
        else:
            raw_token = authorization.strip()
    elif token_cookie:
        raw_token = token_cookie

    if not raw_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Missing credentials. Provide 'Authorization: Bearer <token>' header or '{COOKIE_NAME}' session cookie.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    try:
        payload = jwt.decode(raw_token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Session token has expired.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except (InvalidTokenError, PyJWTError) as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid session token: {str(exc)}",
            headers={"WWW-Authenticate": "Bearer"},
        )



# ==========================================
# Protected Storage Download Endpoint
# ==========================================
@router.get(
    "/api/bff/api/storage/download",
    summary="Download stored file (Protected)",
    description="Securely fetches a file from storage using its relative key.",
)
@router.get(
    "/api/storage/download",
    summary="Download stored file (Alias)",
)
async def download_file(
    key: str = Query(
        ...,
        description="Relative file key/path (e.g., inputs/uuid/folder/0.jpg)",
        min_length=1,
    ),
    authorization: Optional[str] = Header(default=None),
    token_cookie: Optional[str] = Cookie(default=None, alias=COOKIE_NAME),
):
    clean_key = key.lstrip("/\\")
    target_path = (STORAGE_BASE_DIR / clean_key).resolve()

    # Directory Traversal Security Guard
    try:
        is_safe = target_path.is_relative_to(STORAGE_BASE_DIR)
    except AttributeError:
        try:
            target_path.relative_to(STORAGE_BASE_DIR)
            is_safe = True
        except ValueError:
            is_safe = False

    if not is_safe or target_path == STORAGE_BASE_DIR:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Access denied: Invalid or unsafe file key.",
        )

    if target_path.is_file():
        media_type = "image/jpeg"
        if target_path.name.endswith(".png"):
            media_type = "image/png"
        elif target_path.name.endswith(".avif"):
            media_type = "image/avif"
        return FileResponse(path=target_path, filename=target_path.name, media_type=media_type)

    fallback_logo = Path("./public/favicon-db.png").resolve()
    if fallback_logo.is_file():
        return FileResponse(path=fallback_logo, media_type="image/png")

    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail="File not found.",
    )


# ==========================================
# Core Generation Endpoint (Protected Multipart)
# ==========================================
@router.post(
    "/api/bff/api/generate",
    summary="Initiate Design Generation",
    description="Processes multipart/form-data generation request with uploaded assets and generation parameters.",
)
async def generate_design(
    # Required generation fields
    agent_slug: str = Form(..., description="Target agent slug"),
    fotos_do_sujeito_produto: UploadFile = File(..., description="Main subject/product photo"),
    quantidade: int = Form(1, description="Number of variations to generate"),
    genero: str = Form("", description="Gender / audience descriptor"),
    subject_description: str = Form("", description="Detailed subject description"),
    subject_position: str = Form("center", description="Position of subject in layout"),
    dimensions: str = Form("1:1", description="Target aspect ratio (e.g. 1:1, 9:16)"),
    quality: str = Form("standard", description="Generation quality tier"),
    scene_description: str = Form("", description="Description of the scene background and environment"),
    
    # Optional image references
    referencias_de_ambiente: Optional[UploadFile] = File(None, description="Optional environment reference image"),
    referencias_de_estilo: Optional[UploadFile] = File(None, description="Optional style reference image"),

    # Form parameters & stringified JSON objects/arrays
    referencias_de_ambiente_descriptions: str = Form("[]", description="JSON array of environment descriptions"),
    text_blocks: str = Form("[]", description="JSON array of text overlay objects"),
    degrade: str = Form("false", description="Whether text background uses gradient (true/false)"),
    posicao_do_texto: str = Form("center", description="Text layout positioning"),
    color_palette: str = Form("{}", description="JSON object of color palette definitions"),
    plano: str = Form("medio", description="Camera shot/framing plan (e.g. primeiro plano, plano geral)"),
    elementos_flutuantes: str = Form("", description="Floating elements/particles around the subject"),
    estilo_visual: str = Form("cinematic", description="Visual aesthetic style"),

    # Optional headers & authentication guard
    idempotency_key: Optional[str] = Header(None, alias="idempotency-key"),
    current_user: dict = Depends(get_current_user),
) -> Dict[str, Any]:
    """
    1. Validates JWT user session.
    2. Parses stringified JSON fields (text_blocks, color_palette, referencias_de_ambiente_descriptions).
    3. Persists uploaded images to local storage under ./local_storage/inputs/<job_uuid>/.
    4. Compiles an aggregated, structured generation prompt.
    5. Registers the job for SSE streaming and returns job ID and download URL.
    """
    # 1. Parse stringified JSON inputs safely
    try:
        parsed_ambiente_descriptions = json.loads(referencias_de_ambiente_descriptions) if referencias_de_ambiente_descriptions else []
    except Exception:
        parsed_ambiente_descriptions = [referencias_de_ambiente_descriptions] if referencias_de_ambiente_descriptions else []

    try:
        parsed_text_blocks = json.loads(text_blocks) if text_blocks else []
    except Exception:
        parsed_text_blocks = []

    try:
        parsed_color_palette = json.loads(color_palette) if color_palette else {}
    except Exception:
        parsed_color_palette = {}

    # 2. Setup job storage directory: ./local_storage/inputs/<job_uuid>/
    job_id = idempotency_key.strip() if (idempotency_key and idempotency_key.strip()) else str(uuid.uuid4())
    job_storage_dir = STORAGE_BASE_DIR / "inputs" / job_id
    saved_files: Dict[str, Optional[str]] = {
        "fotos_do_sujeito_produto": None,
        "referencias_de_ambiente": None,
        "referencias_de_estilo": None,
    }

    # Save main subject image
    subject_dir = job_storage_dir / "fotos_do_sujeito_produto"
    subject_dir.mkdir(parents=True, exist_ok=True)
    subject_filename = Path(fotos_do_sujeito_produto.filename or "0.jpg").name
    subject_file_path = subject_dir / subject_filename

    file_bytes = await fotos_do_sujeito_produto.read()
    with open(subject_file_path, "wb") as f:
        f.write(file_bytes)
    saved_files["fotos_do_sujeito_produto"] = str(subject_file_path.relative_to(STORAGE_BASE_DIR)).replace("\\", "/")

    # Create results folder and copy as result.avif and result.png (R2 result simulation)
    results_dir = STORAGE_BASE_DIR / "results" / job_id
    results_dir.mkdir(parents=True, exist_ok=True)
    with open(results_dir / "result.avif", "wb") as f:
        f.write(file_bytes)
    with open(results_dir / "result.png", "wb") as f:
        f.write(file_bytes)

    # Also create thumbnails folder for R2 thumbnail simulation
    thumbs_dir = STORAGE_BASE_DIR / "thumbnails" / job_id
    thumbs_dir.mkdir(parents=True, exist_ok=True)
    with open(thumbs_dir / "thumbnail.avif", "wb") as f:
        f.write(file_bytes)
    with open(thumbs_dir / "thumbnail.png", "wb") as f:
        f.write(file_bytes)

    # Save optional environment reference
    if referencias_de_ambiente and referencias_de_ambiente.filename:
        amb_dir = job_storage_dir / "referencias_de_ambiente"
        amb_dir.mkdir(parents=True, exist_ok=True)
        amb_filename = Path(referencias_de_ambiente.filename).name
        amb_path = amb_dir / amb_filename
        amb_bytes = await referencias_de_ambiente.read()
        with open(amb_path, "wb") as f:
            f.write(amb_bytes)
        saved_files["referencias_de_ambiente"] = str(amb_path.relative_to(STORAGE_BASE_DIR)).replace("\\", "/")

    # Save optional style reference
    if referencias_de_estilo and referencias_de_estilo.filename:
        style_dir = job_storage_dir / "referencias_de_estilo"
        style_dir.mkdir(parents=True, exist_ok=True)
        style_filename = Path(referencias_de_estilo.filename).name
        style_path = style_dir / style_filename
        style_bytes = await referencias_de_estilo.read()
        with open(style_path, "wb") as f:
            f.write(style_bytes)
        saved_files["referencias_de_estilo"] = str(style_path.relative_to(STORAGE_BASE_DIR)).replace("\\", "/")

    # 3. Construct structured generation prompt
    colors_repr = (
        ", ".join([f"{k}: {v}" for k, v in parsed_color_palette.items()])
        if parsed_color_palette
        else "natural ambient lighting"
    )

    valid_text_blocks = [
        b for b in parsed_text_blocks
        if isinstance(b, dict) and str(b.get("content", "")).strip()
    ]
    texts_repr = (
        "; ".join([
            f"[{b.get('type', 'text').upper()}{f' (weight {b.get(\"weight\")})' if 'weight' in b else ''}]: \"{b.get('content', '').strip()}\""
            for b in valid_text_blocks
        ])
        if valid_text_blocks
        else "No text overlay"
    )

    env_refs_repr = (
        ", ".join([str(desc) for desc in parsed_ambiente_descriptions])
        if parsed_ambiente_descriptions
        else "None specified"
    )

    is_degrade = str(degrade).strip().lower() in ("true", "1", "yes")

    structured_prompt = (
        f"[Style]: {estilo_visual}. [Framing]: {plano}. "
        f"[Scene Background]: {scene_description}. [Environment References]: {env_refs_repr}. "
        f"[Main Subject]: {subject_description} ({genero}), positioned at {subject_position}. "
        f"[Floating Elements]: {elementos_flutuantes or 'None'}. "
        f"[Color Palette]: {colors_repr}. "
        f"[Text Layout]: {texts_repr} at {posicao_do_texto} (Gradient effect: {'enabled' if is_degrade else 'disabled'}). "
        f"[Output Specs]: Aspect Ratio {dimensions}, Quality tier: {quality}, Variations: {quantidade}."
    )

    result_key = f"results/{job_id}/result.avif"
    cdn_url = f"/designbuilder/results/{job_id}/result.avif"
    bff_url = f"/api/bff/api/storage/download?key={result_key}"

    # Register job in active store for SSE progress streaming
    job_record = {
        "generation_id": job_id,
        "status": "QUEUED",
        "progress": 10,
        "message": "Solicitação recebida e arquivos salvos.",
        "agent_slug": agent_slug,
        "quantidade": quantidade,
        "download_key": result_key,
        "download_url": cdn_url,
        "parsed_prompt": structured_prompt,
        "user": current_user.get("sub", "authenticated_user"),
        "saved_files": saved_files,
        "outputs": [
            {
                "id": f"gen-{job_id}-0",
                "url": cdn_url,
                "preview_url": cdn_url,
                "thumbnail_url": f"/designbuilder/thumbnails/{job_id}/thumbnail.avif",
                "download_url": bff_url,
                "storage_key": result_key,
            }
        ],
    }
    generation_jobs[job_id] = job_record

    return {
        "status": "success",
        "job_id": job_id,
        "generation_id": job_id,
        "agent_slug": agent_slug,
        "quantidade": quantidade,
        "generated_image_url": cdn_url,
        "download_url": bff_url,
        "parsed_prompt": structured_prompt,
        "user": current_user.get("sub", "authenticated_user"),
        "saved_files": saved_files,
        "parsed_parameters": {
            "text_blocks": parsed_text_blocks,
            "color_palette": parsed_color_palette,
            "referencias_de_ambiente_descriptions": parsed_ambiente_descriptions,
            "degrade": is_degrade,
        },
    }


# ==========================================
# Direct Results Asset CDN (Cloudflare R2 Simulation)
# ==========================================
@router.get(
    "/designbuilder/results/{generation_id}/{filename}",
    summary="Direct Results Asset CDN Simulation",
    description="Direct endpoint simulating Cloudflare R2 / S3 storage path for generated images (e.g. result.avif).",
)
@router.get(
    "/results/{generation_id}/{filename}",
    summary="Direct Results Asset CDN Simulation (Alias)",
)
async def get_direct_result_file(
    generation_id: str,
    filename: str,
    response_cache_control: Optional[str] = Query(
        default="private, max-age=3600, immutable", alias="response-cache-control"
    ),
):
    clean_filename = Path(filename).name
    headers = {"Cache-Control": response_cache_control or "private, max-age=3600, immutable"}
    result_path = STORAGE_BASE_DIR / "results" / generation_id / clean_filename
    if result_path.is_file():
        media_type = "image/avif" if clean_filename.endswith(".avif") else "image/png" if clean_filename.endswith(".png") else "image/jpeg"
        return FileResponse(path=result_path, media_type=media_type, headers=headers)

    for ext in (".avif", ".png", ".jpg", ".jpeg"):
        alt_path = STORAGE_BASE_DIR / "results" / generation_id / f"result{ext}"
        if alt_path.is_file():
            media_type = "image/avif" if ext == ".avif" else "image/png" if ext == ".png" else "image/jpeg"
            return FileResponse(path=alt_path, media_type=media_type, headers=headers)

    fallback_path = STORAGE_BASE_DIR / "inputs" / generation_id / "fotos_do_sujeito_produto" / "0.jpg"
    if fallback_path.is_file():
        return FileResponse(path=fallback_path, media_type="image/jpeg", headers=headers)

    raise HTTPException(status_code=404, detail="Result file not found.")


# ==========================================
# Direct Thumbnails Asset CDN (Cloudflare R2 Simulation)
# ==========================================
@router.get(
    "/designbuilder/thumbnails/{generation_id}/{filename}",
    summary="Direct Thumbnails Asset CDN Simulation",
    description="Direct endpoint simulating Cloudflare R2 / S3 storage path for generation thumbnails (e.g. thumbnail.avif).",
)
@router.get(
    "/thumbnails/{generation_id}/{filename}",
    summary="Direct Thumbnails Asset CDN Simulation (Alias)",
)
async def get_direct_thumbnail_file(
    generation_id: str,
    filename: str,
    response_cache_control: Optional[str] = Query(
        default="private, max-age=3600, immutable", alias="response-cache-control"
    ),
):
    clean_filename = Path(filename).name
    headers = {"Cache-Control": response_cache_control or "private, max-age=3600, immutable"}

    # 1. Check local thumbnails folder
    thumb_path = STORAGE_BASE_DIR / "thumbnails" / generation_id / clean_filename
    if thumb_path.is_file():
        media_type = "image/avif" if clean_filename.endswith(".avif") else "image/png" if clean_filename.endswith(".png") else "image/webp" if clean_filename.endswith(".webp") else "image/jpeg"
        return FileResponse(path=thumb_path, media_type=media_type, headers=headers)

    for ext in (".avif", ".png", ".webp", ".jpg", ".jpeg"):
        alt_path = STORAGE_BASE_DIR / "thumbnails" / generation_id / f"thumbnail{ext}"
        if alt_path.is_file():
            media_type = "image/avif" if ext == ".avif" else "image/png" if ext == ".png" else "image/webp" if ext == ".webp" else "image/jpeg"
            return FileResponse(path=alt_path, media_type=media_type, headers=headers)

    # 2. Fallback to local results folder
    result_equiv = clean_filename.replace("thumbnail", "result") if "thumbnail" in clean_filename else clean_filename
    result_path = STORAGE_BASE_DIR / "results" / generation_id / result_equiv
    if result_path.is_file():
        media_type = "image/avif" if result_equiv.endswith(".avif") else "image/png" if result_equiv.endswith(".png") else "image/jpeg"
        return FileResponse(path=result_path, media_type=media_type, headers=headers)

    for ext in (".avif", ".png", ".jpg", ".jpeg"):
        alt_result = STORAGE_BASE_DIR / "results" / generation_id / f"result{ext}"
        if alt_result.is_file():
            media_type = "image/avif" if ext == ".avif" else "image/png" if ext == ".png" else "image/jpeg"
            return FileResponse(path=alt_result, media_type=media_type, headers=headers)

    # 3. Fallback to inputs
    fallback_path = STORAGE_BASE_DIR / "inputs" / generation_id / "fotos_do_sujeito_produto" / "0.jpg"
    if fallback_path.is_file():
        return FileResponse(path=fallback_path, media_type="image/jpeg", headers=headers)

    # 4. Fallback to favicon
    fallback_logo = Path("./public/favicon-db.png").resolve()
    if fallback_logo.is_file():
        return FileResponse(path=fallback_logo, media_type="image/png", headers=headers)

    raise HTTPException(status_code=404, detail="Thumbnail file not found.")


# ==========================================
# Direct Inputs Asset CDN (Cloudflare R2 Simulation)
# ==========================================
@router.get(
    "/designbuilder/inputs/{generation_id}/{folder}/{filename}",
    summary="Direct Inputs Asset CDN Simulation",
)
@router.get(
    "/inputs/{generation_id}/{folder}/{filename}",
    summary="Direct Inputs Asset CDN Simulation (Alias)",
)
@router.get(
    "/designbuilder/inputs/{generation_id}/{filename}",
    summary="Direct Inputs Asset CDN Simulation (Direct Alias)",
)
@router.get(
    "/inputs/{generation_id}/{filename}",
    summary="Direct Inputs Asset CDN Simulation (Direct Alias)",
)
async def get_direct_input_file(
    generation_id: str,
    filename: str,
    folder: Optional[str] = None,
    response_cache_control: Optional[str] = Query(
        default="private, max-age=3600, immutable", alias="response-cache-control"
    ),
):
    clean_filename = Path(filename).name
    headers = {"Cache-Control": response_cache_control or "private, max-age=3600, immutable"}

    if folder:
        input_path = STORAGE_BASE_DIR / "inputs" / generation_id / folder / clean_filename
        if input_path.is_file():
            media_type = "image/avif" if clean_filename.endswith(".avif") else "image/png" if clean_filename.endswith(".png") else "image/jpeg"
            return FileResponse(path=input_path, media_type=media_type, headers=headers)

    direct_path = STORAGE_BASE_DIR / "inputs" / generation_id / clean_filename
    if direct_path.is_file():
        media_type = "image/avif" if clean_filename.endswith(".avif") else "image/png" if clean_filename.endswith(".png") else "image/jpeg"
        return FileResponse(path=direct_path, media_type=media_type, headers=headers)

    fallback_logo = Path("./public/favicon-db.png").resolve()
    if fallback_logo.is_file():
        return FileResponse(path=fallback_logo, media_type="image/png", headers=headers)

    raise HTTPException(status_code=404, detail="Input file not found.")


# ==========================================
# Real-Time SSE Stream Endpoint
# ==========================================
@router.get(
    "/api/bff/api/generations/{generation_id}/stream",
    summary="Stream Generation Progress (SSE)",
    description="Server-Sent Events endpoint streaming real-time status and progress updates for a design generation job.",
)
async def stream_generation(
    generation_id: str,
    request: Request,
):
    """
    Server-Sent Events (SSE) streaming endpoint:
    GET /api/bff/api/generations/{generation_id}/stream
    Emits keepalive ping, queued, analyzing, generating, and completed events.
    """
    async def event_generator():
        # 1. Keepalive ping event
        yield f"event: ping\ndata: {json.dumps({'type': 'ping', 'timestamp': int(uuid.uuid1().time)})}\n\n"

        job = generation_jobs.get(generation_id)
        download_key = job.get("download_key") if job else f"results/{generation_id}/result.avif"
        cdn_url = f"/designbuilder/results/{generation_id}/result.avif"
        bff_url = f"/api/bff/api/storage/download?key={download_key}"

        stages = [
            {"status": "QUEUED", "progress": 15, "message": "Na fila de processamento..."},
            {"status": "ANALYZING", "progress": 40, "message": "Processando referências de ambiente e sujeito..."},
            {"status": "GENERATING", "progress": 75, "message": "Renderizando arte com inteligência artificial..."},
            {"status": "FINISHING", "progress": 95, "message": "Finalizando iluminação e composição visual..."},
            {
                "status": "COMPLETED",
                "progress": 100,
                "message": "Design gerado com sucesso!",
                "outputs": [
                    {
                        "id": f"gen-{generation_id}-0",
                        "url": cdn_url,
                        "preview_url": cdn_url,
                        "download_url": bff_url,
                        "storage_key": download_key,
                    }
                ],
            },
        ]

        for stage in stages:
            if await request.is_disconnected():
                break

            payload = {
                "generation_id": generation_id,
                **stage,
            }
            if job:
                job["status"] = stage["status"]
                job["progress"] = stage["progress"]
                job["message"] = stage["message"]

            yield f"event: message\ndata: {json.dumps(payload)}\n\n"
            yield f"data: {json.dumps(payload)}\n\n"

            if stage["status"] == "COMPLETED":
                yield f"event: done\ndata: {json.dumps({'success': True, 'generation_id': generation_id})}\n\n"
                break

            await asyncio.sleep(1.0)

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache, no-transform",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )


# ==========================================
# Generation Status Endpoint (Polling)
# ==========================================
@router.get(
    "/api/bff/api/generations/{generation_id}/status",
    summary="Get Generation Job Status",
    description="Returns current status and metadata of a design generation job.",
)
@router.get(
    "/api/bff/api/generations/{generation_id}",
    summary="Get Generation Job Status (Alias)",
    description="Returns current status and metadata of a design generation job.",
)
async def get_generation_status(generation_id: str) -> Dict[str, Any]:
    job = generation_jobs.get(generation_id)
    fallback_key = f"results/{generation_id}/result.avif"
    download_key = job.get("download_key") if job else fallback_key
    cdn_url = f"/designbuilder/results/{generation_id}/result.avif"
    bff_url = f"/api/bff/api/storage/download?key={download_key}"
    status_str = job.get("status", "COMPLETED") if job else "COMPLETED"
    progress_val = job.get("progress", 100) if job else 100
    message_str = job.get("message", "Design concluído com sucesso!") if job else "Design concluído com sucesso!"

    return {
        "id": generation_id,
        "generation_id": generation_id,
        "status": status_str,
        "progress": progress_val,
        "message": message_str,
        "agent_slug": job.get("agent_slug", "design-builder1-2") if job else "design-builder1-2",
        "outputs": [
            {
                "id": f"gen-{generation_id}-0",
                "url": cdn_url,
                "preview_url": cdn_url,
                "thumbnail_url": f"/designbuilder/thumbnails/{generation_id}/thumbnail.avif",
                "download_url": bff_url,
                "storage_key": download_key,
            }
        ],
        "result": {
            "url": cdn_url,
            "download_url": bff_url,
        },
    }


# ==========================================
# Generation Detail Endpoint (Full Metadata View)
# ==========================================
@router.get(
    "/api/bff/api/generations/{generation_id}/detail",
    summary="Get Full Generation Job Detail",
    description="Returns comprehensive details of a design generation job, including input parameters, prompts, and output assets.",
)
async def get_generation_detail(generation_id: str) -> Dict[str, Any]:
    job = generation_jobs.get(generation_id)
    fallback_key = f"results/{generation_id}/result.avif"
    download_key = job.get("download_key") if job else fallback_key
    cdn_url = f"/designbuilder/results/{generation_id}/result.avif"
    bff_url = f"/api/bff/api/storage/download?key={download_key}"
    status_str = job.get("status", "COMPLETED") if job else "COMPLETED"
    progress_val = job.get("progress", 100) if job else 100
    message_str = job.get("message", "Design concluído com sucesso!") if job else "Design concluído com sucesso!"

    saved_files = job.get("saved_files", {}) if job else {}
    subject_url = (
        f"/api/bff/api/storage/download?key={saved_files['fotos_do_sujeito_produto']}"
        if saved_files.get("fotos_do_sujeito_produto")
        else f"/api/bff/api/storage/download?key=inputs/{generation_id}/fotos_do_sujeito_produto/0.jpg"
    )
    ambiente_url = (
        f"/api/bff/api/storage/download?key={saved_files['referencias_de_ambiente']}"
        if saved_files.get("referencias_de_ambiente")
        else None
    )
    estilo_url = (
        f"/api/bff/api/storage/download?key={saved_files['referencias_de_estilo']}"
        if saved_files.get("referencias_de_estilo")
        else None
    )

    return {
        "id": generation_id,
        "generation_id": generation_id,
        "agent_slug": job.get("agent_slug", "design-builder1-2") if job else "design-builder1-2",
        "status": status_str,
        "progress": progress_val,
        "message": message_str,
        "prompt": job.get("parsed_prompt", "Alta qualidade, fotorrealista, estilo profissional") if job else "Alta qualidade, fotorrealista, estilo profissional",
        "inputs": {
            "fotos_do_sujeito_produto": subject_url,
            "referencias_de_ambiente": ambiente_url,
            "referencias_de_estilo": estilo_url,
            "parameters": job.get("parsed_parameters") if job else {
                "dimensions": "4:5",
                "quality": "4K",
                "quantidade": 1,
                "genero": "female",
                "subject_description": "ela está com jaleco verde neon",
                "subject_position": "right",
                "scene_description": "ela está em uma praia cheia de turistas",
                "plano": "medio",
                "estilo_visual": "fotorealista",
            },
        },
        "outputs": [
            {
                "id": f"gen-{generation_id}-0",
                "url": cdn_url,
                "preview_url": cdn_url,
                "thumbnail_url": f"/designbuilder/thumbnails/{generation_id}/thumbnail.avif",
                "download_url": bff_url,
                "storage_key": download_key,
                "width": 1080,
                "height": 1350,
            }
        ],
        "result": {
            "url": cdn_url,
            "download_url": bff_url,
        },
    }


# ==========================================
# User Profile & Permissions Endpoint
# ==========================================
@router.get(
    "/api/bff/api/user/me",
    summary="Get Current User Profile and Permissions",
    description="Returns authenticated user profile, membership data, tool permissions, and credit balance.",
)
@router.get(
    "/api/user/me",
    summary="Get Current User Profile and Permissions (Alias)",
)
async def get_user_me(
    authorization: Optional[str] = Header(default=None),
    token_cookie: Optional[str] = Cookie(default=None, alias=COOKIE_NAME),
) -> Dict[str, Any]:
    user_email = "der.contatos@gmail.com"
    user_name = "Ricardo"
    user_id = "d30cf0d9-8b2c-4782-966c-4c2e26a38b3d"
    member_id = "ac7b185d-7fad-472a-b672-c385265c0a92"
    bh_subject = "de3515a0-e005-40be-a35c-8cf2a55011e0"

    raw_token = None
    if authorization and authorization.startswith("Bearer "):
        raw_token = authorization.split(" ")[1].strip()
    elif token_cookie:
        raw_token = token_cookie.strip()

    if raw_token:
        try:
            payload = jwt.decode(raw_token, options={"verify_signature": False})
            user_email = payload.get("email", user_email)
            user_name = payload.get("name", user_name)
            user_id = payload.get("sub", user_id)
            member_id = payload.get("member_id", member_id)
            bh_subject = payload.get("bh_subject", bh_subject)
        except Exception:
            pass

    return {
        "id": user_id,
        "sub": user_id,
        "name": user_name,
        "given_name": user_name,
        "email": user_email,
        "preferred_username": user_email,
        "email_verified": True,
        "kind": "customer",
        "member_id": member_id,
        "is_admin": True,
        "is_admin_designbuilder": True,
        "qg_builder_admin": True,
        "nivel_acesso": "admin",
        "bh_subject": bh_subject,
        "bh_metadata": {
            "is_admin": True,
            "is_admin_designbuilder": True,
            "kind": "customer",
            "member_id": member_id,
            "qg_builder_admin": True,
            "tools": {
                "design_builder": {
                    "enabled": True,
                    "permissions": {
                        "generate": True,
                        "export_4k": True,
                        "remove_background": True,
                        "advanced_prompting": True,
                        "super_resolution": True,
                    },
                }
            },
        },
        "tools": {
            "design_builder": {
                "enabled": True,
                "permissions": {
                    "generate": True,
                    "export_4k": True,
                    "remove_background": True,
                    "advanced_prompting": True,
                    "super_resolution": True,
                },
            }
        },
        "credits": {
            "total": 7500,
            "used": 49,
            "remaining": 7451,
            "plan": "pro",
            "mode": "unlimited",
        },
        "subscription": {
            "status": "active",
            "plan_name": "Design Builder Pro (Ilimitado)",
            "tier": "pro",
            "active": True,
            "created_at": "2026-01-01T00:00:00.000Z",
        },
    }


# ==========================================
# SSO Authentication & Session Endpoints
# ==========================================
@router.get(
    "/api/auth/sessao",
    summary="Get SSO Session",
    description="Validates SSO session and returns expiration timestamp and user profile.",
)
@router.get(
    "/api/auth/session",
    summary="Get SSO Session (Alias)",
)
async def get_sso_session(
    refresh: Optional[str] = Query(default=None),
    authorization: Optional[str] = Header(default=None),
    token_cookie: Optional[str] = Cookie(default=None, alias=COOKIE_NAME),
) -> Dict[str, Any]:
    user_email = "der.contatos@gmail.com"
    user_name = "Ricardo"
    user_id = "d30cf0d9-8b2c-4782-966c-4c2e26a38b3d"
    member_id = "ac7b185d-7fad-472a-b672-c385265c0a92"
    bh_subject = "de3515a0-e005-40be-a35c-8cf2a55011e0"
    exp_ms = int((time.time() + 86400) * 1000)

    raw_token = None
    if authorization and authorization.startswith("Bearer "):
        raw_token = authorization.split(" ")[1].strip()
    elif token_cookie:
        raw_token = token_cookie.strip()

    if raw_token:
        try:
            payload = jwt.decode(raw_token, options={"verify_signature": False})
            user_email = payload.get("email", user_email)
            user_name = payload.get("name", user_name)
            user_id = payload.get("sub", user_id)
            member_id = payload.get("member_id", member_id)
            bh_subject = payload.get("bh_subject", bh_subject)
            if payload.get("exp") and isinstance(payload.get("exp"), (int, float)):
                exp_ms = max(int((time.time() + 7200) * 1000), int(payload["exp"] * 1000))
        except Exception:
            pass

    if refresh:
        exp_ms = int((time.time() + 86400) * 1000)

    profile_data = {
        "userId": user_id,
        "email": user_email,
        "firstName": user_name,
        "lastName": None,
        "fullName": user_name,
        "imageUrl": None,
        "metadata": {
            "is_admin": True,
            "is_admin_designbuilder": True,
            "kind": "customer",
            "member_id": member_id,
            "bh_subject": bh_subject,
            "qg_builder_admin": True,
            "tools": {
                "design_builder": {
                    "enabled": True,
                    "permissions": {
                        "generate": True,
                        "export_4k": True,
                        "remove_background": True,
                        "advanced_prompting": True,
                        "super_resolution": True,
                    },
                }
            },
        },
    }

    return {
        "expiresAt": exp_ms,
        "profile": profile_data,
        "perfil": profile_data,
    }


@router.api_route(
    "/api/auth/sair",
    methods=["GET", "POST"],
    summary="Sign Out SSO Session",
)
@router.api_route(
    "/api/auth/logout",
    methods=["GET", "POST"],
    summary="Sign Out SSO Session (Alias)",
)
async def sso_sign_out(
    redirect_url: Optional[str] = Query(default="/"),
    redirect_to: Optional[str] = Query(default="/"),
):
    target = redirect_url if redirect_url != "/" else redirect_to
    response = RedirectResponse(url=target, status_code=302)
    response.delete_cookie(key="__Host-db.sessao", path="/")
    response.delete_cookie(key="__Host-db.sessao.r", path="/")
    response.delete_cookie(key="__Host-db.sessao.i", path="/")
    return response


@router.api_route(
    "/api/auth/entrar",
    methods=["GET", "POST"],
    summary="Sign In SSO",
)
@router.api_route(
    "/api/auth/login",
    methods=["GET", "POST"],
    summary="Sign In SSO (Alias)",
)
async def sso_sign_in(
    redirect_to: Optional[str] = Query(default="/"),
    redirect_url: Optional[str] = Query(default="/"),
):
    target = redirect_to if redirect_to != "/" else redirect_url
    return RedirectResponse(url=target, status_code=302)


@router.post(
    "/api/auth/nome",
    summary="Update Profile Name",
)
async def update_auth_nome(payload: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    nome = payload.get("nome", "Ricardo") if payload else "Ricardo"
    return {"success": True, "nome": nome}


@router.post(
    "/api/auth/foto",
    summary="Upload Profile Photo",
)
async def upload_auth_foto(file: Optional[UploadFile] = File(default=None)) -> Dict[str, Any]:
    return {"success": True, "foto": None, "avatar_url": None}


@router.post(
    "/api/auth/email",
    summary="Request Email Change Code",
)
async def request_email_change(payload: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    return {"success": True, "message": "Código enviado"}


@router.post(
    "/api/auth/email/confirmar",
    summary="Confirm Email Change",
)
async def confirm_email_change(payload: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    email = payload.get("email", "der.contatos@gmail.com") if payload else "der.contatos@gmail.com"
    return {"success": True, "email": email}


@router.get(
    "/api/v1/oauth/login/session",
    summary="OAuth Login Session Status",
)
async def get_oauth_login_session() -> Dict[str, Any]:
    return {
        "csrf": f"csrf_db_token_{int(time.time())}",
        "email": "der.contatos@gmail.com",
        "destination_hint": "der.contatos@gmail.com",
        "stage": "authenticated",
        "terms": None,
    }


@router.post(
    "/api/v1/oauth/login/otp/request",
    summary="OAuth OTP Request",
)
async def oauth_otp_request() -> Dict[str, Any]:
    return {"ok": True, "resend_after": 60}


@router.post(
    "/api/v1/oauth/login/otp/verify",
    summary="OAuth OTP Verify",
)
async def oauth_otp_verify() -> Dict[str, Any]:
    return {"ok": True, "location": "/"}


@router.get(
    "/api/v1/oauth/login/terms",
    summary="OAuth Terms of Service",
)
async def get_oauth_terms() -> Dict[str, Any]:
    return {
        "terms": {
            "id": "terms_v1",
            "version": "1.0",
            "title": "Termos de Uso - Design Builder",
            "body_markdown": "# Termos de Uso\n\nAcesso autorizado.",
        }
    }


# ==========================================
# User Plan Access & Entitlements Endpoint
# ==========================================
@router.get(
    "/api/bff/api/user/plan-access",
    summary="Get User Plan Access & Feature Entitlements",
    description="Validates feature access, subscription entitlements, and generation quotas for the current user.",
)
@router.get(
    "/api/user/plan-access",
    summary="Get User Plan Access & Feature Entitlements (Alias)",
)
async def get_user_plan_access() -> Dict[str, Any]:
    return {
        "has_access": True,
        "access": True,
        "status": "active",
        "plan": {
            "id": "plan_unlimited_pro",
            "name": "Design Builder Pro",
            "tier": "pro",
            "status": "active",
            "is_trial": False,
            "features": {
                "design_builder": True,
                "export_4k": True,
                "unlimited_generations": True,
                "remove_background": True,
                "custom_branding": True,
                "priority_queue": True,
                "super_resolution": True,
                "advanced_styles": True,
            },
        },
        "permissions": [
            "design_builder:create",
            "design_builder:generate",
            "design_builder:export_4k",
            "design_builder:history",
            "design_builder:all",
        ],
        "limits": {
            "max_monthly_generations": 10000,
            "max_concurrent_jobs": 5,
            "max_resolution": "4K",
        },
        "credits": {
            "total": 7500,
            "used": 49,
            "remaining": 7451,
            "can_generate": True,
        },
    }


# ==========================================
# Community Publish Nudge Endpoints
# ==========================================
publish_nudge_seen = False


@router.get(
    "/api/bff/api/community/publish-nudge",
    summary="Get Community Publish Nudge Status",
)
@router.get(
    "/api/community/publish-nudge",
    summary="Get Community Publish Nudge Status (Alias)",
)
async def get_publish_nudge() -> Dict[str, Any]:
    global publish_nudge_seen
    return {
        "show": not publish_nudge_seen,
        "show_nudge": not publish_nudge_seen,
        "has_seen": publish_nudge_seen,
        "agent_slug": "design-builder1-2",
        "title": "Vire inspiração na comunidade. Compartilhe!",
        "cta_text": "Publicar",
        "can_publish": True,
        "status": "active",
    }


@router.post(
    "/api/bff/api/community/publish-nudge/seen",
    summary="Mark Community Publish Nudge as Seen",
)
@router.post(
    "/api/community/publish-nudge/seen",
    summary="Mark Community Publish Nudge as Seen (Alias)",
)
async def mark_publish_nudge_seen() -> Dict[str, Any]:
    global publish_nudge_seen
    publish_nudge_seen = True
    return {
        "success": True,
        "has_seen": True,
        "message": "Publish nudge marked as seen.",
    }


# ==========================================
# Announcements Endpoints
# ==========================================
@router.get(
    "/api/bff/api/announcements/pending",
    summary="List Pending Announcements",
)
@router.get(
    "/api/announcements/pending",
    summary="List Pending Announcements (Alias)",
)
async def list_pending_announcements(product: Optional[str] = "design_builder") -> List[Dict[str, Any]]:
    return []


@router.get(
    "/api/bff/api/announcements/active",
    summary="List Active Announcements",
)
@router.get(
    "/api/announcements/active",
    summary="List Active Announcements (Alias)",
)
async def list_active_announcements(product: Optional[str] = "design_builder") -> List[Dict[str, Any]]:
    return []


@router.post(
    "/api/bff/api/announcements/{announcement_id}/view",
    summary="Record Announcement View",
)
@router.post(
    "/api/announcements/{announcement_id}/view",
    summary="Record Announcement View (Alias)",
)
async def record_announcement_view(announcement_id: str) -> Dict[str, Any]:
    return {"success": True, "id": announcement_id}


# ==========================================
# Publication Invites Endpoints
# ==========================================
publication_intro_seen = True


@router.get(
    "/api/bff/api/publication-invites/pending",
    summary="List Pending Publication Invites",
)
@router.get(
    "/api/publication-invites/pending",
    summary="List Pending Publication Invites (Alias)",
)
async def list_pending_publication_invites() -> Dict[str, Any]:
    global publication_intro_seen
    return {
        "items": [],
        "intro_seen": publication_intro_seen,
        "total": 0,
    }


@router.post(
    "/api/bff/api/publication-invites/{invite_id}/respond",
    summary="Respond to Publication Invite",
)
@router.post(
    "/api/publication-invites/{invite_id}/respond",
    summary="Respond to Publication Invite (Alias)",
)
async def respond_publication_invite(invite_id: str, payload: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    decision = payload.get("decision", "accepted") if payload else "accepted"
    return {"success": True, "id": invite_id, "decision": decision}


@router.post(
    "/api/bff/api/publication-invites/intro-seen",
    summary="Mark Publication Invite Intro as Seen",
)
@router.post(
    "/api/publication-invites/intro-seen",
    summary="Mark Publication Invite Intro as Seen (Alias)",
)
async def mark_publication_intro_seen() -> Dict[str, Any]:
    global publication_intro_seen
    publication_intro_seen = True
    return {"success": True, "intro_seen": True}


# ==========================================
# Sidebar Links Endpoints
# ==========================================
@router.get(
    "/api/bff/api/sidebar-links",
    summary="Get Sidebar Navigation Links",
)
@router.get(
    "/api/sidebar-links",
    summary="Get Sidebar Navigation Links (Alias)",
)
async def get_sidebar_links(product: Optional[str] = "design_builder") -> List[Dict[str, Any]]:
    return [
        {
            "label": "documentation",
            "description": "guides",
            "icon": "book",
            "color": "#a78bfa",
            "url": "https://docs.designbuilder.co/docs/onboarding",
        },
        {
            "label": "roadmap",
            "description": "whats-next",
            "icon": "map",
            "color": "#34d399",
            "url": "https://roadmap.designbuilder.co/",
        },
        {
            "label": "discord",
            "description": "local-community",
            "icon": "discord",
            "color": "#5865F2",
            "url": "https://link.easybuilder.com.br/convitediscord-fundadores",
        },
    ]


# ==========================================
# Static Asset Endpoints (Favicon / Branding)
# ==========================================
@router.get("/favicon-db.png", include_in_schema=False)
@router.get("/favicon.ico", include_in_schema=False)
async def get_favicon():
    """Serve the Design Builder favicon."""
    favicon_path = Path("./public/favicon-db.png").resolve()
    if favicon_path.exists():
        return FileResponse(favicon_path, media_type="image/png")
    fallback = Path("./public/logo-zion.png").resolve()
    if fallback.exists():
        return FileResponse(fallback, media_type="image/png")
    raise HTTPException(status_code=404, detail="Favicon not found")


# ==========================================
# Generations Cotar & Credits Extrato Endpoints
# ==========================================
@router.post(
    "/api/bff/api/generations/cotar",
    summary="Estimate Generation Cost and Credits",
)
@router.post(
    "/api/generations/cotar",
    summary="Estimate Generation Cost and Credits (Alias)",
)
async def cotar_generation(payload: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    agent_slug = payload.get("agent_slug", "design-builder1-2") if payload else "design-builder1-2"
    acao = payload.get("acao", "gerar") if payload else "gerar"
    qualidade = str(payload.get("qualidade", "4K")).lower() if payload else "4k"
    formato = str(payload.get("formato", "4:5")).replace(":", "-") if payload else "4-5"

    return {
        "evento": f"{agent_slug}:{acao}:{qualidade}:{formato}:google-gemini-3.1-flash-image-preview",
        "custo": 1,
        "regra": "*",
        "saldo": 7451,
        "ilimitado": True,
        "pode_pagar": True,
        "provider": "openrouter",
        "modelo": "google/gemini-3.1-flash-image-preview",
        "estimado": True,
    }


@router.get(
    "/api/bff/api/user/creditos/extrato",
    summary="Get User Credits Balance and Movement History",
)
@router.get(
    "/api/user/creditos/extrato",
    summary="Get User Credits Balance and Movement History (Alias)",
)
async def get_creditos_extrato(limite: Optional[int] = Query(default=1)) -> Dict[str, Any]:
    return {
        "saldo": 7451,
        "ilimitado": True,
        "vence_primeiro": None,
        "lotes": [
            {
                "quantidade": 7500,
                "restante": 7451,
                "origem": "compra",
                "vence_em": None,
                "concedido_em": "2026-09-06T12:29:18.412753Z",
            }
        ],
        "liberacao_inicial": None,
        "movimentos": [
            {
                "id": 53837,
                "quando": "2026-09-15T05:42:56.460637Z",
                "tipo": "gasto",
                "entrada": False,
                "quantidade": 1,
                "saldo_depois": 7451,
                "app_slug": "design-builder1-2",
                "app": "design-builder1-2",
                "acao": "Criação",
                "qualidade": "4K",
                "formato": "4:5",
                "modelo": "google-gemini-3.1-flash-image-preview",
                "geracao": {
                    "id": "c7d66479-2abf-4a41-8114-545418b77ff2",
                    "status": "done",
                    "imagem": "/designbuilder/thumbnails/c7d66479-2abf-4a41-8114-545418b77ff2/thumbnail.avif",
                },
                "pedido": None,
            }
        ],
    }


# ==========================================
# User Generations & Community Feed Endpoints
# ==========================================
@router.get(
    "/api/bff/api/generations",
    summary="List User Generations",
)
@router.get(
    "/api/generations",
    summary="List User Generations (Alias)",
)
async def list_generations(
    limit: int = Query(default=20),
    offset: int = Query(default=0),
    agent_slug: Optional[str] = Query(default=None),
) -> Dict[str, Any]:
    items = []
    gen_file = Path("./public/generations_data.json").resolve()
    if gen_file.is_file():
        try:
            with open(gen_file, "r", encoding="utf-8") as f:
                data = json.load(f)
                items = data.get("items", [])
        except Exception:
            pass

    for job_id, job in generation_jobs.items():
        if not any(i.get("id") == job_id for i in items):
            items.insert(
                0,
                {
                    "id": job_id,
                    "status": "done" if job.get("status") == "COMPLETED" else str(job.get("status", "done")).lower(),
                    "result_url": f"/designbuilder/results/{job_id}/result.avif",
                    "thumbnail_url": f"/designbuilder/thumbnails/{job_id}/thumbnail.avif",
                    "created_at": "2026-09-15T05:42:56.549711Z",
                    "agent_slug": job.get("agent_slug", "design-builder1-2"),
                    "dimensions": "4:5",
                    "form_data": {
                        "plano": "medium",
                        "quality": "4K",
                        "dimensions": "4:5",
                        "quantidade": "1",
                    },
                    "input_image_urls": {},
                    "is_public": False,
                    "is_favorited": False,
                },
            )

    paginated = items[offset : offset + limit]
    return {
        "items": paginated,
        "limit": limit,
        "offset": offset,
        "total": len(items),
    }


@router.get(
    "/api/bff/api/community",
    summary="List Community Generations",
)
@router.get(
    "/api/community",
    summary="List Community Generations (Alias)",
)
async def list_community(
    limit: int = Query(default=24),
    offset: int = Query(default=0),
    sort: Optional[str] = Query(default=None),
) -> Dict[str, Any]:
    items = []
    total = 344
    comm_file = Path("./public/community_data.json").resolve()
    if comm_file.is_file():
        try:
            with open(comm_file, "r", encoding="utf-8") as f:
                data = json.load(f)
                items = data.get("items", [])
                total = data.get("total", len(items))
        except Exception:
            pass

    paginated = items[offset : offset + limit]
    return {
        "items": paginated,
        "limit": limit,
        "offset": offset,
        "total": total,
    }


@router.get(
    "/api/agent-videos/{video_name:path}",
    summary="Agent Marketing Video Endpoint",
)
async def get_agent_video(video_name: str):
    return StreamingResponse(iter([b""]), media_type="video/mp4", headers={"Accept-Ranges": "bytes"})


@router.get("/agent/design-builder1-2", summary="Design Builder 1.2 UI")
@router.get("/design-builder", summary="Design Builder UI")
async def get_design_builder_ui():
    p = Path("./public/Design_Builder1_2.html").resolve()
    if p.is_file():
        return FileResponse(p, media_type="text/html")
    p3 = Path("./public/3.html").resolve()
    if p3.is_file():
        return FileResponse(p3, media_type="text/html")
    return JSONResponse(status_code=404, content={"error": "UI not found"})




