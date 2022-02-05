import os
from . import app

app.run(
    os.environ.get("WIKIGAME_HOST", "127.0.0.1"),
    int(os.environ.get("WIKIGAME_PORT", "5000")),
)