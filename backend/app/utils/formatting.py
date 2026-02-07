def truncate_text(text: str, max_length: int = 200, suffix: str = "...") -> str:
    if len(text) <= max_length:
        return text
    return text[: max_length - len(suffix)].rstrip() + suffix


def format_time_delta(milliseconds: int) -> str:
    if milliseconds is None:
        return ""

    total_seconds = milliseconds / 1000
    minutes = int(total_seconds // 60)
    seconds = int(total_seconds % 60)
    ms = int((total_seconds % 1) * 1000)

    if minutes > 0:
        return f"{minutes}:{seconds:02d}.{ms:03d}"
    else:
        return f"{seconds}.{ms:03d}"
