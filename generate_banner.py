import cv2
import numpy as np

# LinkedIn banner standard resolution
W, H = 1584, 396

# Create dark gradient background
# From deep dark olive-black #0b100d to dark forest #18221a
img = np.zeros((H, W, 3), dtype=np.uint8)
for y in range(H):
    ratio = y / float(H)
    # BGR format
    b = int(13 * (1 - ratio) + 26 * ratio)
    g = int(16 * (1 - ratio) + 34 * ratio)
    r = int(11 * (1 - ratio) + 24 * ratio)
    img[y, :] = (b, g, r)

# Add subtle grid lines
grid_color = (39, 53, 37)  # subtle dark green
for x in range(0, W, 45):
    cv2.line(img, (x, 0), (x, H), grid_color, 1)
for y in range(0, H, 45):
    cv2.line(img, (0, y), (W, y), grid_color, 1)

# Subtle radar / target circles on right
center = (1380, 198)
cv2.circle(img, center, 150, (60, 90, 70), 1, cv2.LINE_AA)
cv2.circle(img, center, 100, (76, 164, 185), 1, cv2.LINE_AA)  # goldish hue in BGR (76, 164, 185)
cv2.circle(img, center, 50, (76, 164, 185), 1, cv2.LINE_AA)
cv2.circle(img, center, 5, (76, 164, 185), -1, cv2.LINE_AA)
cv2.line(img, (1200, 198), (1560, 198), (60, 90, 70), 1, cv2.LINE_AA)
cv2.line(img, (1380, 20), (1380, 376), (60, 90, 70), 1, cv2.LINE_AA)

# Jet silhouette points on right
pts = np.array([
    [1380, 130], [1386, 165], [1435, 195], [1392, 198],
    [1398, 225], [1412, 235], [1380, 230], [1348, 235],
    [1362, 225], [1368, 198], [1325, 195], [1374, 165]
], np.int32)
pts = pts.reshape((-1, 1, 2))
overlay = img.copy()
cv2.fillPoly(overlay, [pts], (76, 164, 185))
cv2.addWeighted(overlay, 0.35, img, 0.65, 0, img)
cv2.polylines(img, [pts], True, (100, 200, 225), 1, cv2.LINE_AA)

# Decorative gold horizontal lines
gold_bgr = (76, 164, 185)
cv2.line(img, (440, 60), (1220, 60), (45, 90, 100), 1, cv2.LINE_AA)
cv2.line(img, (440, 336), (1220, 336), (45, 90, 100), 1, cv2.LINE_AA)

# Typography using OpenCV Hersheys
# 1. Top Subheader: IT SUPPORT ENGINEER • CIVILIAN WRITER & RESEARCHER
cv2.putText(img, "IT SUPPORT ENGINEER   |   CIVILIAN RESEARCHER & WRITER", 
            (460, 95), cv2.FONT_HERSHEY_SIMPLEX, 0.52, gold_bgr, 1, cv2.LINE_AA)

# 2. Main Name
cv2.putText(img, "Anush Varma Kakarlapudi", 
            (460, 155), cv2.FONT_HERSHEY_DUPLEX, 1.45, (255, 255, 255), 2, cv2.LINE_AA)

# 3. Tagline
cv2.putText(img, "Defence, aerospace and aviation explained in simple language", 
            (460, 198), cv2.FONT_HERSHEY_SIMPLEX, 0.68, (190, 205, 190), 1, cv2.LINE_AA)

# 4. Badges / Category Pills
# Draw rounded rectangles / pills
def draw_pill(img, text, x, y, w, h):
    sub = img.copy()
    cv2.rectangle(sub, (x, y), (x + w, y + h), (30, 42, 32), -1)
    cv2.addWeighted(sub, 0.85, img, 0.15, 0, img)
    cv2.rectangle(img, (x, y), (x + w, y + h), (55, 75, 55), 1, cv2.LINE_AA)
    cv2.putText(img, text, (x + 18, y + 23), cv2.FONT_HERSHEY_SIMPLEX, 0.48, (225, 235, 220), 1, cv2.LINE_AA)

draw_pill(img, "Military & Defence", 460, 228, 205, 34)
draw_pill(img, "Aviation & Aerospace", 680, 228, 215, 34)
draw_pill(img, "Global Defence", 910, 228, 175, 34)

# 5. Footer info
cv2.putText(img, "EMAIL", (460, 305), cv2.FONT_HERSHEY_SIMPLEX, 0.45, gold_bgr, 1, cv2.LINE_AA)
cv2.putText(img, "kakarlapudianushvarma@gmail.com", (520, 305), cv2.FONT_HERSHEY_SIMPLEX, 0.48, (220, 225, 215), 1, cv2.LINE_AA)

cv2.putText(img, "BLOG", (840, 305), cv2.FONT_HERSHEY_SIMPLEX, 0.45, gold_bgr, 1, cv2.LINE_AA)
cv2.putText(img, "anushvarmak.github.io/vanguard-brief", (895, 305), cv2.FONT_HERSHEY_SIMPLEX, 0.48, (220, 225, 215), 1, cv2.LINE_AA)

# Save as PNG and JPG
out_png = "static/images/linkedin-banner.png"
out_jpg = "static/images/linkedin-banner.jpg"
cv2.imwrite(out_png, img)
cv2.imwrite(out_jpg, img, [int(cv2.IMWRITE_JPEG_QUALITY), 95])
print("Banner images successfully created!")
