import os
os.chdir('post')
import asyncio
import aiofiles
async def main():
    for i in range(3):
        os.mkdir(f'category {i}')
        for j in range(10):
            async with aiofiles.open(f'category {i}/2001010{i}0{j}-{j}.md', 'w') as f:
                await f.write(f'post 2001010{i}0{j}-{j}.md')

asyncio.run(main())