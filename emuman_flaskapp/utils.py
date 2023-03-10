from urllib.parse import quote
from itertools import zip_longest

def urlify(name: str) -> str:
    return quote(name.replace(' ', '_'))

def replace_links(s: str) -> str:
    s = str(s)
    braces = False
    final_string = ''
    current_link = ''
    for i, c in enumerate(s):
        if c == '{':
            braces = True
        elif c == '}':
            braces = False
            final_string += f'<a href="/1f1t/features/{urlify(current_link)}" style="display: inline;">{current_link}</a>'
            current_link = ''
        else:
            if braces: current_link += c
            else: final_string += c
    return final_string

def portion(l: list, size: int) -> list[list]:
    # am lazy
    # https://stackoverflow.com/questions/2130016/splitting-a-list-into-n-parts-of-approximately-equal-length
    k, m = divmod(len(l), size)
    return (l[i*k+min(i, m):(i+1)*k+min(i+1, m)] for i in range(size))

def cols2rows(l: list[list]) -> list[list]:
    return zip_longest(*l)
