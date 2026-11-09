#!/usr/bin/env python3
"""
Generate Technical Design Document (.docx) for Isocode Take-Home Task Submission
Brand Palette: UdaanHer Crimson Red (#EA3C36), Dark Slate (#1A1A1A), Neutral Light (#F8F9FA)
"""
import os
import re
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml import OxmlElement
from docx.oxml.ns import qn

def set_cell_background(cell, fill_hex):
    tcPr = cell._element.get_or_add_tcPr()
    shd = OxmlElement('w:shd')
    shd.set(qn('w:val'), 'clear')
    shd.set(qn('w:color'), 'auto')
    shd.set(qn('w:fill'), fill_hex)
    tcPr.append(shd)

def create_tdd_document():
    doc = Document()

    # 1-inch margins
    for section in doc.sections:
        section.top_margin = Inches(1)
        section.bottom_margin = Inches(1)
        section.left_margin = Inches(1)
        section.right_margin = Inches(1)

    # Base Typography
    style_normal = doc.styles['Normal']
    style_normal.font.name = 'Calibri'
    style_normal.font.size = Pt(10.5)
    style_normal.font.color.rgb = RGBColor(0x1A, 0x1A, 0x1A)

    md_path = os.path.join(os.path.dirname(__file__), '..', 'docs', 'technical-design.md')
    with open(md_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    in_table = False
    table_lines = []
    in_code_block = False
    code_lines = []

    for line in lines:
        raw_line = line.rstrip('\r\n')
        stripped = raw_line.strip()

        # Handle Code Blocks
        if stripped.startswith('```'):
            if in_code_block:
                # End of code block
                process_code_block(doc, code_lines)
                in_code_block = False
                code_lines = []
            else:
                in_code_block = True
                code_lines = []
            continue

        if in_code_block:
            code_lines.append(raw_line)
            continue

        # Handle Tables
        if '|' in stripped and stripped.startswith('|'):
            in_table = True
            table_lines.append(stripped)
            continue
        elif in_table:
            process_table(doc, table_lines)
            in_table = False
            table_lines = []

        if not stripped:
            continue

        # Skip horizontal rules
        if stripped == '---':
            p = doc.add_paragraph()
            p.paragraph_format.space_before = Pt(6)
            p.paragraph_format.space_after = Pt(6)
            continue

        # Headings
        if stripped.startswith('# '):
            p = doc.add_paragraph()
            run = p.add_run(stripped[2:])
            run.font.name = 'Calibri'
            run.font.size = Pt(21)
            run.font.bold = True
            run.font.color.rgb = RGBColor(0xEA, 0x3C, 0x36) # Primary Brand Red
            p.paragraph_format.space_before = Pt(14)
            p.paragraph_format.space_after = Pt(6)
        elif stripped.startswith('## '):
            p = doc.add_paragraph()
            run = p.add_run(stripped[3:])
            run.font.name = 'Calibri'
            run.font.size = Pt(15)
            run.font.bold = True
            run.font.color.rgb = RGBColor(0x1A, 0x1A, 0x1A) # Dark Slate
            p.paragraph_format.space_before = Pt(14)
            p.paragraph_format.space_after = Pt(5)
        elif stripped.startswith('### '):
            p = doc.add_paragraph()
            run = p.add_run(stripped[4:])
            run.font.name = 'Calibri'
            run.font.size = Pt(12)
            run.font.bold = True
            run.font.color.rgb = RGBColor(0xD3, 0x2F, 0x2F) # Deep Red Accent
            p.paragraph_format.space_before = Pt(10)
            p.paragraph_format.space_after = Pt(3)
        elif stripped.startswith('- ') or stripped.startswith('* '):
            p = doc.add_paragraph(style='List Bullet')
            add_formatted_text(p, stripped[2:])
            p.paragraph_format.space_after = Pt(3)
        elif re.match(r'^\d+\.\s+', stripped):
            match = re.match(r'^\d+\.\s+', stripped)
            p = doc.add_paragraph(style='List Number')
            add_formatted_text(p, stripped[match.end():])
            p.paragraph_format.space_after = Pt(3)
        else:
            p = doc.add_paragraph()
            add_formatted_text(p, stripped)
            p.paragraph_format.space_after = Pt(5)

    if in_table and table_lines:
        process_table(doc, table_lines)
    if in_code_block and code_lines:
        process_code_block(doc, code_lines)

    output_path = os.path.join(os.path.dirname(__file__), '..', 'Technical-Design-Document.docx')
    doc.save(output_path)
    print(f"✔ Successfully generated {output_path}")

def add_formatted_text(paragraph, text):
    parts = re.split(r'(\*\*.*?\*\*|\*.*?\*|`.*?`)', text)
    for part in parts:
        if not part:
            continue
        if part.startswith('**') and part.endswith('**'):
            run = paragraph.add_run(part[2:-2])
            run.bold = True
        elif part.startswith('*') and part.endswith('*'):
            run = paragraph.add_run(part[1:-1])
            run.italic = True
        elif part.startswith('`') and part.endswith('`'):
            run = paragraph.add_run(part[1:-1])
            run.font.name = 'Consolas'
            run.font.size = Pt(9.5)
            run.font.color.rgb = RGBColor(0xC6, 0x28, 0x28)
        else:
            paragraph.add_run(part)

def process_code_block(doc, code_lines):
    if not code_lines:
        return
    table = doc.add_table(rows=1, cols=1)
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    cell = table.cell(0, 0)
    set_cell_background(cell, 'F8F9FA')

    p = cell.paragraphs[0]
    p.paragraph_format.space_before = Pt(4)
    p.paragraph_format.space_after = Pt(4)

    run = p.add_run('\n'.join(code_lines))
    run.font.name = 'Consolas'
    run.font.size = Pt(8.5)
    run.font.color.rgb = RGBColor(0x2D, 0x37, 0x48)

    doc.add_paragraph().paragraph_format.space_after = Pt(4)

def process_table(doc, table_lines):
    rows_data = []
    for line in table_lines:
        if re.match(r'^\|[\s\-:|]+\|$', line):
            continue
        cells = [c.strip() for c in line.split('|')[1:-1]]
        if cells:
            rows_data.append(cells)

    if not rows_data:
        return

    num_cols = len(rows_data[0])
    table = doc.add_table(rows=len(rows_data), cols=num_cols)
    table.alignment = WD_TABLE_ALIGNMENT.CENTER

    for row_idx, row_cells in enumerate(rows_data):
        for col_idx, cell_value in enumerate(row_cells):
            if col_idx < num_cols:
                cell = table.cell(row_idx, col_idx)
                p = cell.paragraphs[0]
                p.paragraph_format.space_before = Pt(3)
                p.paragraph_format.space_after = Pt(3)

                if row_idx == 0:
                    set_cell_background(cell, 'EA3C36') # UdaanHer Red Header
                    run = p.add_run(cell_value)
                    run.bold = True
                    run.font.color.rgb = RGBColor(0xFF, 0xFF, 0xFF)
                else:
                    if row_idx % 2 == 1:
                        set_cell_background(cell, 'F8F9FA')
                    add_formatted_text(p, cell_value)

    doc.add_paragraph().paragraph_format.space_after = Pt(4)

if __name__ == '__main__':
    create_tdd_document()
