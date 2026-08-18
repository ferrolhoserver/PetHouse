from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

output = Path(__file__).with_name('ocr-fixture.png')
image = Image.new('RGB', (1400, 520), 'white')
draw = ImageDraw.Draw(image)
try:
    font = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', 56)
except OSError:
    font = ImageFont.load_default()
lines = ['VACINA V8', 'Data: 12/08/2026', 'Veterinário: Clínica PetHouse']
y = 70
for line in lines:
    draw.text((70, y), line, fill='black', font=font)
    y += 125
image.save(output)
print(output)
