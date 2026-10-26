#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Ferramentas para ler PDFs e desenhos técnicos automaticamente.
Usa Poppler (pdftoppm, pdftotext) e Tesseract OCR.
"""

import os
import sys
import subprocess
import json
from pathlib import Path
from PIL import Image
import tempfile
import shutil

# Caminhos das ferramentas
POPPLER_BIN = r"C:\Users\dst7973\AppData\Local\Microsoft\WinGet\Packages\oschwartz10612.Poppler_Microsoft.Winget.Source_8wekyb3d8bbwe\poppler-25.07.0\Library\bin"
TESSERACT_BIN = r"C:\Program Files\PDF24\tesseract"
PDFTOTEXT = os.path.join(POPPLER_BIN, "pdftotext.exe")
PDFTOPPM = os.path.join(POPPLER_BIN, "pdftoppm.exe")
TESSERACT = os.path.join(TESSERACT_BIN, "tesseract.exe")

class PDFReader:
    """Classe para ler e extrair dados de PDFs."""

    def __init__(self, pdf_path):
        """Inicializa com caminho do PDF."""
        self.pdf_path = Path(pdf_path)
        if not self.pdf_path.exists():
            raise FileNotFoundError(f"PDF não encontrado: {pdf_path}")

    def extract_text(self, output_path=None):
        """Extrai texto do PDF usando pdftotext."""
        print(f"[1] Extraindo texto de: {self.pdf_path.name}")

        if output_path is None:
            output_path = self.pdf_path.with_suffix('.txt')

        try:
            cmd = [PDFTOTEXT, str(self.pdf_path), str(output_path)]
            result = subprocess.run(cmd, capture_output=True, text=True, check=True)
            print(f"    ✓ Texto extraído para: {output_path}")
            return output_path
        except subprocess.CalledProcessError as e:
            print(f"    ✗ Erro ao extrair texto: {e.stderr}")
            return None

    def convert_to_images(self, output_dir=None, first_page=None, last_page=None):
        """Converte PDF em imagens PNG usando pdftoppm."""
        print(f"[2] Convertendo PDF para imagens: {self.pdf_path.name}")

        if output_dir is None:
            output_dir = self.pdf_path.parent / self.pdf_path.stem

        output_dir = Path(output_dir)
        output_dir.mkdir(parents=True, exist_ok=True)

        try:
            output_prefix = str(output_dir / self.pdf_path.stem)
            cmd = [PDFTOPPM, "-png", str(self.pdf_path), output_prefix]

            if first_page:
                cmd.extend(["-f", str(first_page)])
            if last_page:
                cmd.extend(["-l", str(last_page)])

            result = subprocess.run(cmd, capture_output=True, text=True, check=True)

            images = sorted(output_dir.glob(f"{self.pdf_path.stem}-*.png"))
            print(f"    ✓ {len(images)} página(s) convertida(s) para PNG")
            return images
        except subprocess.CalledProcessError as e:
            print(f"    ✗ Erro ao converter para imagens: {e.stderr}")
            return []

    def ocr_image(self, image_path, lang='por'):
        """Extrai texto de imagem usando Tesseract OCR."""
        print(f"[3] OCR em imagem: {Path(image_path).name}")

        try:
            output_prefix = str(Path(image_path).parent / Path(image_path).stem)
            cmd = [TESSERACT, str(image_path), output_prefix, f"-l", lang]

            result = subprocess.run(cmd, capture_output=True, text=True, check=True)

            txt_file = f"{output_prefix}.txt"
            if os.path.exists(txt_file):
                with open(txt_file, 'r', encoding='utf-8') as f:
                    text = f.read()
                print(f"    ✓ OCR completado ({len(text)} caracteres)")
                return text
        except subprocess.CalledProcessError as e:
            print(f"    ✗ Erro OCR: {e.stderr}")
        return None

    def full_process(self, output_dir=None, use_ocr=False, lang='por'):
        """Processa PDF completo: extrai texto + converte imagens + OCR opcional."""
        print(f"\n{'='*60}")
        print(f"PROCESSANDO PDF: {self.pdf_path.name}")
        print(f"{'='*60}\n")

        if output_dir is None:
            output_dir = self.pdf_path.parent / f"{self.pdf_path.stem}_extracted"

        output_dir = Path(output_dir)
        output_dir.mkdir(parents=True, exist_ok=True)

        results = {
            'pdf': str(self.pdf_path),
            'output_dir': str(output_dir),
            'texto_extraido': None,
            'imagens': [],
            'ocr_resultados': []
        }

        # 1. Extrair texto
        txt_file = self.extract_text(output_dir / f"{self.pdf_path.stem}.txt")
        if txt_file:
            results['texto_extraido'] = str(txt_file)

        # 2. Converter para imagens
        images = self.convert_to_images(output_dir)
        results['imagens'] = [str(img) for img in images]

        # 3. OCR opcional (se PDFs forem imagens)
        if use_ocr and images:
            print(f"\n[4] Executando OCR em {len(images)} imagem(ns)...")
            for img in images:
                text = self.ocr_image(img, lang)
                if text:
                    results['ocr_resultados'].append({
                        'imagem': str(img),
                        'texto': text[:500] + "..." if len(text) > 500 else text
                    })

        print(f"\n{'='*60}")
        print(f"PROCESSAMENTO COMPLETO")
        print(f"{'='*60}")
        print(f"Textos em: {output_dir}")
        print(f"Imagens: {len(images)}")
        print(f"OCR: {'Sim' if use_ocr else 'Não'}\n")

        # Guardar resultado em JSON
        json_file = output_dir / "resultado.json"
        with open(json_file, 'w', encoding='utf-8') as f:
            json.dump(results, f, ensure_ascii=False, indent=2)
        print(f"Resultado guardado em: {json_file}\n")

        return results

def main():
    """Função principal para uso em linha de comando."""
    if len(sys.argv) < 2:
        print("Uso: python ferramentas_pdf.py <caminho_pdf> [--ocr] [--lang pt]")
        print("\nExemplos:")
        print("  python ferramentas_pdf.py desenho_306.pdf")
        print("  python ferramentas_pdf.py desenho_306.pdf --ocr")
        print("  python ferramentas_pdf.py desenho_306.pdf --ocr --lang por")
        sys.exit(1)

    pdf_path = sys.argv[1]
    use_ocr = '--ocr' in sys.argv
    lang = 'por' if '--lang' not in sys.argv else sys.argv[sys.argv.index('--lang') + 1]

    try:
        reader = PDFReader(pdf_path)
        reader.full_process(use_ocr=use_ocr, lang=lang)
    except Exception as e:
        print(f"\n✗ ERRO: {e}")
        sys.exit(1)

if __name__ == '__main__':
    main()
