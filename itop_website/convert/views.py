import io
from django.shortcuts import render
from django.http import HttpResponse, FileResponse
from PIL import Image
from pillow_heif import register_heif_opener
from psd_tools import PSDImage
from svglib.svglib import svg2rlg
from reportlab.graphics import renderPM

# Indispensable pour HEIC
register_heif_opener()

def convert_to_pdf_view(request):
    if request.method == 'POST':
        # 'images' doit correspondre au nom dans formData.append('images', file)
        files = request.FILES.getlist('images')
        image_list = []

        if not files:
            return HttpResponse("Aucun fichier reçu", status=400)

        try:
            for f in files:
                ext = f.name.split('.')[-1].lower()

                if ext == 'svg':
                    drawing = svg2rlg(f)
                    img_data = io.BytesIO()
                    renderPM.drawToFile(drawing, img_data, fmt="PNG")
                    img = Image.open(img_data)
                elif ext == 'psd':
                    psd = PSDImage.open(f)
                    img = psd.topil()
                else:
                    img = Image.open(f)

                # Conversion forcée en RGB (Crucial pour le format PDF)
                if img.mode != 'RGB':
                    img = img.convert('RGB')
                
                image_list.append(img)

            if image_list:
                # Création du PDF en mémoire
                pdf_output = io.BytesIO()
                
                image_list[0].save(
                    pdf_output, 
                    format="PDF", 
                    save_all=True, 
                    append_images=image_list[1:]
                )
                
                pdf_output.seek(0)
                
                return HttpResponse(pdf_output.read(), content_type='application/pdf')

        except Exception as e:
            print(f"Erreur de conversion: {e}")
            return HttpResponse(f"Erreur technique: {e}", status=500)


    return render(request, 'convert/convert.html')