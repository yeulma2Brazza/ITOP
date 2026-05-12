# ITOP - Convertisseur d'Images en PDF Multi-Formats 🛠️

![Django](https://img.shields.io/badge/Django-092E20?style=for-the-badge&logo=django&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)

**ITOP** est une solution web moderne permettant de convertir instantanément plusieurs images de formats variés en un seul fichier PDF optimisé.

## ✨ Fonctionnalités
- **Conversion multi-formats :** Supporte PNG, GIF, TIF, PSD, SVG, WEBP, et HEIC.
- **Expérience Drag & Drop :** Interface intuitive pour glisser-déposer vos fichiers.
- **Barre de progression réelle :** Suivi en temps réel de l'upload des fichiers grâce à AJAX.
- **Conversion intelligente :** Assemblage de plusieurs images dans un seul document PDF.
- **Support HEIC & PSD :** Capacité à traiter les photos iPhone (HEIC) et les fichiers Photoshop (PSD) nativement.

## 🛠️ Architecture Technique
Le projet repose sur une communication asynchrone entre le client et le serveur :
1. **Front-end :** JavaScript (Vanilla) utilisant l'API `XMLHttpRequest` pour gérer les flux binaires et la progression.
2. **Back-end :** Django (Python) pour la logique serveur.
3. **Traitement d'image :** - `Pillow` pour la manipulation d'image standard.
   - `psd-tools` pour le décodage des fichiers Photoshop.
   - `svglib` & `reportlab` pour le rendu des fichiers SVG.
   - `pillow-heif` pour le support du format HEIC.



## ⚙️ Installation

1. **Cloner le projet :**
   ```bash
   git clone [https://github.com/ton-pseudo/itop-converter.git](https://github.com/ton-pseudo/itop-converter.git)
   cd itop-converter
