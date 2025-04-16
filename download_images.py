import os
from PIL import Image

def process_image(input_path, output_path, target_size=(300, 200)):
    try:
        # 打开图片
        img = Image.open(input_path)
        
        # 转换为RGB模式（如果是RGBA）
        if img.mode == 'RGBA':
            img = img.convert('RGB')
        
        # 计算裁剪区域以保持比例
        width, height = img.size
        target_ratio = target_size[0] / target_size[1]
        current_ratio = width / height
        
        if current_ratio > target_ratio:
            # 图片太宽，需要裁剪宽度
            new_width = int(height * target_ratio)
            left = (width - new_width) // 2
            img = img.crop((left, 0, left + new_width, height))
        elif current_ratio < target_ratio:
            # 图片太高，需要裁剪高度
            new_height = int(width / target_ratio)
            top = (height - new_height) // 2
            img = img.crop((0, top, width, top + new_height))
        
        # 调整图片大小，使用高质量的重采样方法
        img = img.resize(target_size, Image.Resampling.LANCZOS)
        
        # 保存图片，提高质量设置
        img.save(output_path, 'PNG', quality=100, optimize=False)
        print(f"Successfully processed {output_path}")
    except Exception as e:
        print(f"Error processing {input_path}: {str(e)}")

# 确保images目录存在
if not os.path.exists('images'):
    os.makedirs('images')

# 处理所有游戏图片
game_files = {
    '狼人杀.jpeg': 'game1.png',
    '谁是卧底.png': 'game2.png',
    '麻将.jpeg': 'game3.png',
    '斗地主.jpeg': 'game4.png',
    'UNO.jpeg': 'game5.png',
    '拆弹猫.jpeg': 'game6.png',
    '五子棋.jpeg': 'game7.png',
    '象棋.jpeg': 'game8.png'
}

# 处理每张图片
for input_filename, output_filename in game_files.items():
    input_path = os.path.join('images', input_filename)
    output_path = os.path.join('images', output_filename)
    if os.path.exists(input_path):
        process_image(input_path, output_path)
    else:
        print(f"Warning: {input_path} not found") 