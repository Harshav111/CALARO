import math
import re
import tempfile
from typing import List

from fastapi import UploadFile

try:
    import whisper  # type: ignore
except Exception:  # pragma: no cover - optional dependency
    whisper = None


# Very simple, fully local rule-based parser.
_UNITS = {
    "piece",
    "pieces",
    "bowl",
    "bowls",
    "cup",
    "cups",
    "plate",
    "plates",
    "slice",
    "slices",
    "gram",
    "grams",
    "g",
    "ml",
    "litre",
    "litres",
    "spoon",
    "spoons",
}


def _parse_phrase(phrase: str) -> List[dict]:
    tokens = re.split(r"\s+", phrase.strip())
    tokens = [t for t in tokens if t]
    if not tokens:
        return []

    quantity = 1.0
    unit = "portion"
    name_tokens: List[str] = []

    idx = 0
    # number (optional)
    if idx < len(tokens):
        q_match = re.match(r"^(\d+(?:\.\d+)?)$", tokens[idx])
        if q_match:
            quantity = float(q_match.group(1))
            idx += 1

    # unit (optional)
    if idx < len(tokens) and tokens[idx].lower() in _UNITS:
        unit = tokens[idx].lower()
        idx += 1

    # remaining tokens form the food name
    if idx < len(tokens):
        name_tokens = tokens[idx:]
    else:
        # fallback: use the whole phrase
        name_tokens = tokens

    name = " ".join(name_tokens).strip(" .").lower()
    if not name:
        return []

    return [{"name": name, "quantity": quantity, "unit": unit}]


async def extract_food_info(text: str):
    """
    Extracts food items, quantities, and units from natural language text.

    This implementation is intentionally simple and fully local:
    it does not call any external APIs or require API keys.
    """
    parts = re.split(r"[,.]|\band\b", text, flags=re.IGNORECASE)
    items: List[dict] = []
    for part in parts:
        items.extend(_parse_phrase(part))

    # Fallback if nothing parsed
    if not items and text.strip():
        items.append(
            {"name": text.strip().lower(), "quantity": 1.0, "unit": "portion"}
        )

    # Clamp quantities to something reasonable
    for item in items:
        try:
            q = float(item.get("quantity", 1.0))
        except Exception:
            q = 1.0
        item["quantity"] = max(0.1, min(q, 1000.0))
        if not item.get("unit"):
            item["unit"] = "portion"
    return items


async def transcribe_audio_to_text(file: UploadFile) -> str:
    """
    Transcribes an audio file to text using the local open-source Whisper model.

    - No external APIs
    - No API keys
    - Audio is stored only in a temporary file and removed immediately after.
    """
    if whisper is None:
        # Whisper library not installed; fail gracefully.
        return ""

    audio_bytes = await file.read()
    if not audio_bytes:
        return ""

    with tempfile.NamedTemporaryFile(suffix=".webm", delete=True) as tmp:
        tmp.write(audio_bytes)
        tmp.flush()
        model = whisper.load_model("base")
        result = model.transcribe(tmp.name, fp16=False)

    text = result.get("text", "") if isinstance(result, dict) else ""
    return text.strip()
