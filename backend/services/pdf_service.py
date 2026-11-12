import pymupdf


def extract_text_from_pdf(pdf_bytes: bytes) -> str:
    try:
        document = pymupdf.open(
            filename=None,
            stream=pdf_bytes,
            filetype="pdf",
        )
    except pymupdf.FileDataError as exc:
        raise ValueError("Invalid PDF file") from exc

    try:
        extracted_text = []
        for page in document:
            extracted_text.append(page.get_text())
        return "\n".join(extracted_text)
    finally:
        document.close()