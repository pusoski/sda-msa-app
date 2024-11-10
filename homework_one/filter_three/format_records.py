def format_macedonian_number(value):
    value_str = str(value)
    converted_value = value_str.replace('.', '#').replace(',', '.').replace('#', ',')

    return converted_value


def format_date(value):
    value_str = str(value).replace('-', '/')
    month, day, year = value_str.split("/")

    if len(year) == 2:
        if 0 <= int(year) <= 89:
            year = f"20{year}"
        else:
            year = f"19{year}"

    converted_date = f"{month}/{day}/{year}"

    return converted_date


def format_scraped_record(record):
    date_column = {"Date"}

    for header, value in record.items():
        if header not in date_column:
            record[header] = format_macedonian_number(value)
        elif header in date_column:
            record[header] = format_date(value)

    return record
