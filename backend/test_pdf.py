from services.pdf_service import extract_text_from_pdf
open_pdf = open('sample_resume.pdf', 'rb')
pdf_bytes = open_pdf.read()
open_pdf.close()

extracted_text = extract_text_from_pdf(pdf_bytes)
print(extracted_text)