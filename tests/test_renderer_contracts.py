from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
RENDERER=ROOT/"production/living_engraving/render_current.js"

def test_ellipse_alpha_multiplies_parent_state():
    text=RENDERER.read_text()
    assert "function ell(" in text
    assert "ctx.globalAlpha*=a;" in text
    assert "ctx.globalAlpha=a;" not in text.split("function ell(",1)[1].split("}",1)[0]
