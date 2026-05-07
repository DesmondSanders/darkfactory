import json
from pathlib import Path
from typing import List, Type, TypeVar
from pydantic import BaseModel

DATA_DIR = Path('data')
DATA_DIR.mkdir(exist_ok=True)

T = TypeVar('T', bound=BaseModel)


def _read(path: Path):
    if not path.exists():
        return []
    with path.open('r', encoding='utf-8') as f:
        return json.load(f)


def _write(path: Path, data):
    with path.open('w', encoding='utf-8') as f:
        json.dump(data, f, indent=2)


def load_models(filename: str, model: Type[T]) -> List[T]:
    path = DATA_DIR / filename
    raw = _read(path)
    return [model.model_validate(x) for x in raw]


def save_models(filename: str, items: List[T]):
    path = DATA_DIR / filename
    _write(path, [x.model_dump() for x in items])
