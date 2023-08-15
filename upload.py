from distutils.dir_util import copy_tree
import os
import shutil
os.chdir("../")
copy_tree('blog-builder/css', 'build/css')
copy_tree('blog-builder/js', 'build/js')
copy_tree('blog-builder/assets', 'build/assets')
for i in os.listdir('blog-builder/pages'):
    if os.path.isfile('blog-builder/pages/' + i):
        shutil.copy('blog-builder/pages/' + i, 'build/'+ i)
    else:
        copy_tree('blog-builder/pages/' + i, 'build/'+ i)
os.chdir('build')
os.system('git add .')
os.system(f'git commit -m "Docs: Update blog"')
os.system('git push')