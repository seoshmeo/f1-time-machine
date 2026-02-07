from datetime import date, datetime, timedelta


def season_date_range(year: int) -> tuple[date, date]:
    start_date = date(year, 1, 1)
    end_date = date(year, 12, 31)
    return start_date, end_date


def years_ago_date(current_date: date, target_year: int) -> date | None:
    try:
        years_diff = datetime.now().year - target_year
        historical_date = current_date.replace(year=current_date.year - years_diff)
        return historical_date
    except ValueError:
        if current_date.month == 2 and current_date.day == 29:
            historical_date = current_date.replace(
                year=current_date.year - years_diff, day=28
            )
            return historical_date
        return None


def format_date_ru(dt: date) -> str:
    months_ru = [
        "января",
        "февраля",
        "марта",
        "апреля",
        "мая",
        "июня",
        "июля",
        "августа",
        "сентября",
        "октября",
        "ноября",
        "декабря",
    ]

    return f"{dt.day} {months_ru[dt.month - 1]} {dt.year}"
