#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
Sanitize fontgis SVG

Reads an SVG file from standard input, cleans it for use with React-compatible icon systems,
and writes the result to standard output.

- Removes extra namespaces and unused elements
- Keeps only <path> and <g> elements
- Strips style and id attributes
- Forces viewBox="0 0 100 100"
- Removes width, height, version attributes

Usage:
    cat input.svg | python3 sanitize.py > output.svg
"""

import xml.etree.ElementTree as ET
from sys import stdin

SVG_NS = 'http://www.w3.org/2000/svg'
ALLOWED_TAGS = [
    'g',
    'path',
    'rect',
    'circle',
    'ellipse',
    'line',
    'polyline',
    'polygon',
    'use',
    'defs',
    'symbol',
    'title',
    'desc',
    'style',
    'metadata'
]

def main():
    ET.register_namespace('', SVG_NS) # Default namespace

    tree = ET.parse(stdin)
    root = tree.getroot()

    # Delete non-default namespace attributes
    for attr in list(root.attrib):
        if attr.startswith('{'):
            root.attrib.pop(attr, None)

    root.set('viewBox', "0 0 100 100")
    root.attrib.pop('height', None)
    root.attrib.pop('width', None)

    # Keep only allowed tags (<g>, <path>, etc.)
    for child in list(root):
        tag = ET.re.match(r'\{[^}]+\}(.*)', child.tag)[1]
        if tag not in ALLOWED_TAGS :
            root.remove(child)

    # Remove style attr from all elements
    for children in root.iter() :
        children.attrib.pop('style',None)

    print( ET.tostring(root, encoding='unicode') )


if __name__ == "__main__":
    main()
