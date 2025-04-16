import requests
from PIL import Image
from io import BytesIO
import os

# 游戏图片URL列表 - 使用更可靠的图片源
game_images = {
    'game1.png': 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=200&h=300&fit=crop',  # 狼人杀
    'game2.png': 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=200&h=300&fit=crop',  # 谁是卧底
    'game3.png': 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=200&h=300&fit=crop',  # 麻将
    'game4.png': 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=200&h=300&fit=crop',  # 斗地主
    'game5.png': 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=200&h=300&fit=crop',  # UNO
    'game6.png': 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=200&h=300&fit=crop',  # 拆弹猫
    'game7.png': 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=200&h=300&fit=crop',  # 五子棋
    'game8.png': 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=200&h=300&fit=crop'   # 象棋
}

def download_and_process_image(url, filename, target_size=(200, 300)):
    try:
        # 下载图片
        response = requests.get(url)
        if response.status_code == 200:
            # 打开图片
            img = Image.open(BytesIO(response.content))
            
            # 调整图片大小
            img = img.resize(target_size, Image.Resampling.LANCZOS)
            
            # 保存图片
            img.save(os.path.join('images', filename), 'PNG')
            print(f"Successfully processed {filename}")
        else:
            print(f"Failed to download {filename}")
    except Exception as e:
        print(f"Error processing {filename}: {str(e)}")

# 确保images目录存在
if not os.path.exists('images'):
    os.makedirs('images')

# 下载并处理所有图片
for filename, url in game_images.items():
    download_and_process_image(url, filename) 