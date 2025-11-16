#!/usr/bin/env python3
"""
Generate a PNG image for the SustAInd project
"""

from PIL import Image, ImageDraw, ImageFont
import os

# Create image dimensions (typical for project thumbnails)
width, height = 800, 600
img = Image.new('RGB', (width, height), color='#FFFFFF')
draw = ImageDraw.Draw(img)

# Define colors
green = '#2E7D32'  # Sustainable green
light_green = '#66BB6A'
dark_green = '#1B5E20'
blue = '#1976D2'  # AI/Tech blue
light_blue = '#64B5F6'
gray = '#424242'
light_gray = '#E0E0E0'

# Draw background gradient (simplified - solid with pattern)
# Main background
draw.rectangle([0, 0, width, height], fill='#F5F5F5')

# Draw geometric shapes representing AI/Software Architecture
# Top section - AI/Neural Network representation
y_offset = 50
for i in range(3):
    x = 150 + i * 200
    # Draw nodes (circles)
    for j in range(3):
        y = y_offset + j * 80
        # Outer circle (green - sustainability)
        draw.ellipse([x-25, y-25, x+25, y+25], fill=green, outline=dark_green, width=2)
        # Inner circle (blue - AI)
        draw.ellipse([x-15, y-15, x+15, y+15], fill=light_blue)
    
    # Draw connections (lines)
    if i < 2:
        for j in range(3):
            y = y_offset + j * 80
            draw.line([x+25, y, x+175, y], fill=light_green, width=2)

# Middle section - Framework/Architecture representation
# Draw layered rectangles representing software architecture
layers = [
    (100, 280, 700, 320, green),
    (120, 330, 680, 360, light_green),
    (140, 370, 660, 390, light_blue),
]

for x1, y1, x2, y2, color in layers:
    draw.rectangle([x1, y1, x2, y2], fill=color, outline=dark_green, width=2)

# Bottom section - Sustainability symbol (leaf/tree)
# Draw a stylized leaf/tree
leaf_points = [
    (400, 450),
    (350, 420),
    (330, 460),
    (380, 480),
    (420, 480),
    (470, 460),
    (450, 420),
]
draw.polygon(leaf_points, fill=green, outline=dark_green, width=2)

# Draw stem
draw.rectangle([395, 480, 405, 520], fill=dark_green)

# Add text
try:
    # Try to use a nice font if available
    title_font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 48)
    subtitle_font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 32)
except:
    # Fallback to default font
    title_font = ImageFont.load_default()
    subtitle_font = ImageFont.load_default()

# Project title
title = "SustAInd"
bbox = draw.textbbox((0, 0), title, font=title_font)
text_width = bbox[2] - bbox[0]
text_x = (width - text_width) // 2
draw.text((text_x, 520), title, fill=dark_green, font=title_font)

# Subtitle
subtitle = "Sustainable AI Systems"
bbox = draw.textbbox((0, 0), subtitle, font=subtitle_font)
text_width = bbox[2] - bbox[0]
text_x = (width - text_width) // 2
draw.text((text_x, 560), subtitle, fill=gray, font=subtitle_font)

# Save the image
output_path = 'assets/img/sustaind.png'
os.makedirs(os.path.dirname(output_path), exist_ok=True)
img.save(output_path, 'PNG')
print(f"Image saved to {output_path}")

